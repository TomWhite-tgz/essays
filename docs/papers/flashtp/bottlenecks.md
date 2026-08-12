---
title: 3 类性能瓶颈
description: 从 kernel 边界, 中间数据, 逐边输出和 CG 稀疏性审计 FlashTP 的问题诊断.
---

# 3. 3 类性能瓶颈

论文 Section 3 的贡献不是笼统地说 tensor product 很慢, 而是把瓶颈拆成 3 种不同资源问题. 它们分别要求减少 DRAM traffic, 降低 peak memory 和跳过无效 FLOP.

## 瓶颈 1: 中间数据的 DRAM 往返

原始 Tensor-Product layer 的单条 path 在 3 个阶段使用多个 kernel:

- Forward 使用 3 个 kernel.
- Backward 使用 5 个 kernel.
- Double-backward 使用 13 个 kernel.

不同 kernel 之间不能默认共享寄存器中的临时值, 所以前一个 kernel 的输出通常要写入显存, 后一个 kernel 再读回. Figure 5 用 $1000$ 条 edge, hidden degree dimension 为 3, edge degree dimension 为 5 的例子展示流量. 外积产生 $15000$ 个元素, 而 CG 矩阵本身只有 45 个元素并可跨所有 edge 复用.

这说明主要流量不是固定系数, 而是随 edge 数量扩张的输入相关中间量. Backward 与 double-backward 还需要保存或重建这些量的梯度路径, 所以问题比 forward 更严重.

## Figure 6 怎样支持 memory-bound 判断

作者在 A100 上 profile SevenNet-l3i5 的 Tensor-Product layer. Figure 6 显示 backward 与 double-backward 时间明显长于 forward, DRAM bandwidth utilization 高而 compute utilization 相对低. 这支持它们主要受数据搬运限制.

需要注意, utilization 图是特定模型, 输入和硬件上的观测, 不是 CGTP 永远 memory-bound 的数学定理. 当 channel, $l_{\max}$, 精度或 GPU 资源比例变化时, 算术强度也会变化.

## 瓶颈 2: 扩张输出造成峰值显存尖峰

Tensor-Product layer 的输入 hidden state 形状近似为

$$
[N_{\mathrm{edge}},N_{\mathrm{ch}},d_i],
$$

输出则为

$$
[N_{\mathrm{edge}},N_{\mathrm{ch}},d_i'],
$$

且论文所分析架构中 $d_i'$ 通常比 $d_i$ 大一个数量级. 下一层 reduce 会立即按 destination node 汇总并压缩这个逐边输出, 但常规执行必须先完整保存它. 作者指出, 单是这一步就可能让 peak memory 增加约 4 倍.

因此, 只把 Tensor-Product layer 内部 kernel 融合仍不够. 即便外积中间量消失, 最终逐边输出如果仍被物化, 最大可模拟原子数仍会被它限制. 这正是 FlashTP 还要做 inter-layer fusion 的原因.

## 瓶颈 3: 稠密执行 CG 零元素

Table 1 给出 CG coefficient matrix 的 sparsity:

| $l_{\max}$ | 1 | 2 | 3 | 4 | 5 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 零元素比例 | $71\%$ | $78\%$ | $82\%$ | $84\%$ | $86\%$ |

若先构造完整外积, 再与稠密 CG 矩阵相乘, 对应零系数的乘法不会影响结果. 这些 ineffectual computations 还会传播到 backward 和 double-backward.

稀疏度随 $l_{\max}$ 上升, 使得更高阶模型同时面临更多 path 和更高矩阵稀疏. 这也是 FlashTP 在高 $l_{\max}$ 配置上相对收益更大的一个原因.

## 3 类资源不能用一个指标概括

| 问题 | 主要代价 | 对应优化 |
| --- | --- | --- |
| kernel 间中间量 | DRAM 读写与 launch 开销 | Intra-layer fusion |
| 巨大逐边输出 | Peak memory | Inter-layer fusion |
| CG 零系数 | 无效 FLOP 与相关梯度计算 | Sparse execution |
| 优化后输入重复读取 | 新的 DRAM 流量热点 | Path aggregation |

最后一项不是原始 Section 3 的三大问题. 它是在前三项缓解后暴露的新瓶颈, 论文 Section 4.4 才引入 path aggregation 处理.

## 与端到端时间的关系

Figure 4 给出 SevenNet-l3i5 中 Tensor-Product layer 的时间比例. 若该层占比为 $f$, 内核加速为 $s$, Amdahl 定律给出的总加速为

$$
S_{\mathrm{total}}
=\dfrac{1}{(1-f)+\dfrac{f}{s}}.
$$

推理时 $f=0.889$, 即使张量积无限快, 总加速上限也约为

$$
\dfrac{1}{1-0.889}\approx9.0.
$$

训练时 $f=0.752$, 理想上限约为 $4.03$. 论文在 SevenNet-l3i5 上报告 $4.2\times$ 推理加速和 $3.5\times$ 训练加速, 与该约束的数量级相符. 微内核的数十倍加速不应直接写成整个模型的数十倍加速.

## 本章结论

FlashTP 的问题诊断是 IO-aware 的. 它并非只减少理论 FLOP, 而是识别出中间数据和最终逐边输出的生命周期. 这使 kernel fusion, sparse execution 和 fused reduce 分别对应明确资源瓶颈, 也为后续消融是否支持设计动机提供了检查框架.

