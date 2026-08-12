---
title: 融合, 稀疏与 Path Aggregation
description: 逐步拆解 FlashTP 如何保持 CGTP 语义并消除中间数据, 零系数计算和重复输入读取.
---

# 4. 融合, 稀疏与 Path Aggregation

FlashTP 的 3 项优化不是彼此独立的小技巧. Fusion 改变中间量的存储位置, sparsity 改变遍历对象, path aggregation 再改变多个 path 的调度顺序. 最终 kernel 直接执行经过聚合的非零 CG 收缩并写入目标 node.

## Intra-layer kernel fusion

常规单条 path 可以抽象为

$$
\boldsymbol{o}_p
=r_p\boldsymbol{C}_p
\operatorname{vec}\left(\boldsymbol{h}_p\otimes\boldsymbol{e}_p\right).
$$

这里的外积张量只为随后的 CG 收缩服务. FlashTP 按 CG 非零项直接计算

$$
z_k\mathrel{+}=C_{ijk}h_ie_j,
$$

把 $h_ie_j$, CG 系数乘法和局部累加放进一次 pass. 在某个输出分量的 partial sum 完整后, 才进行依赖最终和的径向缩放等后续操作.

这样做取消了外积和矩阵乘法结果的 DRAM 物化. Forward 的收益直观, backward 与 double-backward 的收益更大, 因为中间量不再跨多个自动微分 kernel 往返.

## Inter-layer fusion 与 atomic reduce

Tensor-Product layer 原本输出逐边消息, 随后的 reduce 按 destination node 求和:

$$
\boldsymbol{x}'_v
=\sum_{(u,v)\in\mathcal{E}}\boldsymbol{m}_{uv}.
$$

FlashTP 不保存完整 $\boldsymbol{m}_{uv}$ 数组, 而是在消息算出后直接累加到 $\boldsymbol{x}'_v$. 不同 GPU worker 可能同时处理指向同一 node 的 edge, 因而 Figure 7 的融合版本使用 atomic add 保证求和正确.

这一设计缩短了逐边扩张输出的生命周期, 是 peak memory 大幅下降的主要来源. 代价是 atomic contention 可能随 destination node 入度分布变化. 论文证明了所测 SevenNet 图上的净收益, 但没有系统扫过不同邻居数与入度偏斜.

## 稀疏 CG 表示

Figure 8 把每个非零 CG 项存成 COO 形式的四元组

$$
(i,j,k,\operatorname{val}).
$$

$i$, $j$, $k$ 分别索引 hidden component, edge component 和 output component. `val` 不直接保存 32-bit 浮点系数, 而是指向 unique CG value array 的小整数索引. 原因是 CG tensor 中许多非零值本身也重复, 例如相同的平方根组合与符号变体.

执行时 kernel 遍历非零元组, 查询对应唯一值, 再执行

$$
z_k\mathrel{+}=h_ie_jC_{ijk}.
$$

因此, 零系数既不占乘加, 也不需要生成相应外积元素. 压缩 `val` 又降低了稀疏元数据带宽.

## Path aggregation

融合与稀疏化之后, CG 运算本身变轻, 相同输入被不同 path 重复读取就变得显眼. Figure 9 的例子中, 同一个 degree-1 hidden subvector 被读取 5 次, 一个 edge subvector 被读取 3 次.

FlashTP 按共享 hidden subvector 的 path 分组, 在同一个 kernel 中执行这些 path. 输入加载一次后可以供多个输出耦合复用. 这不改变 path 集合, 只改变执行顺序与数据驻留时间.

需要区分 path aggregation 与数学上的 path 求和. 不同 path 可能产生不同 $l_{\mathrm{out}}$ 或不同输出通道, 它们不是先被数值合并成一条 path. 聚合指共同调度和复用输入, 输出仍按原模型定义分别累加.

## 为什么 3 项优化可以保持语义

在精确实数算术中, FlashTP 只做以下等价变换:

- 删除乘以零的项.
- 改变有限和的执行次序.
- 将生产者与唯一消费者融合, 不保存中间数组.
- 将逐边消息立即加到相同 destination node.

前后模型的 path, 权重和 CG 系数均未改变. 浮点算术中, 改变求和顺序会带来舍入差异, 所以论文 Appendix B 另外用 FP64 e3nn 作为参考评估 FP32 误差. 这项数值检查是语义等价主张不可缺少的一部分.

## 消融证据怎样读

Table 7 把 Fused, Path, Sparse 和 All 逐步加入, $l_{\max}=1$ 到 4 的 forward, backward 和 double-backward 均有改善. 例如 $l_{\max}=3$:

| 配置 | Forward | Backward | Double-backward |
| --- | ---: | ---: | ---: |
| 仅 fusion | $2.67\times$ | $4.48\times$ | $9.79\times$ |
| 加 path aggregation | $3.22\times$ | $6.32\times$ | $12.45\times$ |
| 加 sparsity | $4.79\times$ | $7.24\times$ | $15.46\times$ |
| 全部组合 | $6.80\times$ | $13.01\times$ | $25.82\times$ |

表中的 Fused, Path 和 Sparse 分别考察单项策略, All 才是 3 项组合. 它不是包含所有两两交互项的完整析因设计, 但足以显示每项单独有效且组合收益更大. 此外, 为保证非稀疏配置也能运行, 消融统一关闭 constant-memory storage, 因而 All 略慢于完整 FlashTP.

## 本章结论

Fusion 解决数据生命周期, sparsity 解决遍历空间, path aggregation 解决输入复用. 三者组合后, kernel 的基本工作单位从一条 path 的稠密外积变成一组共享输入 path 的非零 CG 项. 性能提升来自执行计划变化, 不是以删减表示或近似物理换速度.
