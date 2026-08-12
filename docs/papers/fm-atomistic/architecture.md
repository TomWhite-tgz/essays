---
title: MLIP 架构谱系与共同骨架
description: 从手工 descriptor, ACE, GNN 到 attention 的统一理解与扩展瓶颈.
---

# MLIP 架构谱系与共同骨架

## 两十年的架构压缩成四步

作者把 MLIP 演化概括为:

1. Behler-Parrinello 使用手工构造的 two-body 与 three-body symmetry functions.
2. DeePMD 让网络学习 descriptor, 减少人工 feature engineering.
3. ACE 用系统可改进的 body-order expansion 统一原子中心表示.
4. GNN 通过邻居消息传递学习多体作用, 后续再引入 graph attention.

这不是四套完全无关的思想. 作者强调, 大多数原子表示都可理解为邻域 atomic density 的不同展开, 也可映射到 ACE 或 graph features 的共同框架.

## 三类共享归纳偏置

### Nearsightedness

局域模型假设中心原子的能量与力主要由 cutoff $r_c$ 内邻居决定. 逐原子能量求和自然满足 size consistency:

$$
E(A\cup B)=E(A)+E(B),
$$

前提是相距足够远的 $A$ 与 $B$ 不通过模型相互作用. Message passing 通过多层传播扩大感受野, 但每层仍基于局域边, 并未真正消除 cutoff.

### Physical constraints

常见约束包括平移, 旋转与同类原子置换不变性, 向量与张量等变性, 能量守恒和光滑性. 它们可被硬编码进 architecture, 也可通过 data augmentation, loss 或训练数据软学习.

### Body order

Two-body 项通常占主导, three-body 负责角度环境, 更高 body order 增加表达力也增加计算成本. ACE 可显式截断 body order. 作者写道, GNN 每增加一层 message passing 可将有效 body order 提高一阶. 这是有用直觉, 但实际 GNN 的非线性与路径复用会让精确 body-order 计数依具体架构而定.

## GNN 为什么适合原子系统

原子是 nodes, cutoff 内原子对是 edges, node 和 edge features 携带元素与几何信息. 同一套网络可处理原子数变化的体系, 并通过共享参数保持 permutation symmetry. Locality 还使成本近似随原子数线性扩展, 前提是密度和 cutoff 固定.

## GNN 为什么也可能妨碍 FM scaling

作者提出而没有彻底回答三个问题:

- 图大小随体系变化, batch 中计算量高度不均, 造成 accelerator utilization 下降.
- 等变张量积与高阶自动微分昂贵, 分布式训练通信复杂.
- Long-range interaction 若加入全局边或全局 attention, 可能破坏局域线性 scaling.

所以 "扩大参数量" 并不等于 "有效扩大可用容量". 如果 kernel, batching, load balancing 与 communication hiding 不同步改进, 算力可能消耗在 padding, irregular memory access 或跨设备同步上.

## 作者对统一框架的判断边界

"多数 MLIP 可由 atomic density 或 ACE 统一理解" 是有力的表示论视角, 但不能推出所有架构在训练动态, 数值光滑性和硬件效率上等价. 相同的函数基底可以有不同截断, factorization, nonlinearity 和 optimization geometry. 精读时应把 "共同数学语言" 与 "工程上可互换" 分开.

