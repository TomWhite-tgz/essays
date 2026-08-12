---
title: 研究问题与主张边界
description: 区分 EquiformerV3 的效率, 表达力与物理一致性目标.
---

# 研究问题与主张边界

## 三个问题不是一回事

原子模型输入原子序数 $z_i$ 与位置 $\mathbf r_i$, 输出能量 $E$, 力 $\mathbf F_i$ 和应力. 一个实用模型至少同时面对三条约束:

1. Efficiency: 高阶 irreps 与大量 edge tensor operations 是否能在 GPU 上有效执行.
2. Expressivity: 一次 message passing 后的 node descriptor 是否能区分仅靠 pair distances 无法区分的局域环境.
3. Generality: 模型是否能从 single-point labels 延伸到 relaxation, force constants 与 thermal conductivity 等导数敏感任务.

EquiformerV2 的高 $L_{\max}$ 改善了 angular resolution, 但不能自动保证上述三点. V3 因而不是简单地把 $L_{\max}$ 再调大, 而是分别处理 implementation, activation 与 cutoff.

## 预测对象

论文覆盖两种 force parameterization:

- Direct: 独立的 equivariant head 直接预测 $\mathbf F_i$.
- Gradient: 从标量能量求导, $\mathbf F_i=-\nabla_{\mathbf r_i}E$.

Gradient force 天然保守, 但要求网络关于坐标的映射可微且 cutoff 处光滑. Direct force 可以容纳数据中的非零净力并降低训练成本, 但不自动对应某个全局势能函数.

## 证据链

| 主张 | 论文证据 | 能推出什么 |
| --- | --- | --- |
| 实现更快 | OC20 同配置 270 到 154 H100 GPU-hours | 该训练设置下的端到端实现提速 |
| 激活更有表达力 | 2-body, 3-body, 4-body counterexamples | 测试族上的区分能力, 不是任意几何图完备性 |
| 更接近严格等变 | 随网格分辨率变化的 rotation error | 给定实现与精度下的数值误差 |
| 更适合物理任务 | Matbench RMSD, $\kappa_{\mathrm{SRME}}$ 与 CPS | 指定训练和评测 pipeline 下的下游能力 |

## 状态范围

OC20 是 catalyst surface trajectories, OMat24 是超过 110M 个 non-equilibrium crystals, Matbench Discovery 则考察 WBM crystals 的稳定性判断, relaxation 与 thermal conductivity. 这三组实验覆盖面很广, 但没有直接验证长时间 NVE energy drift, liquids, molecules 或极大体系 scaling. 因而论文的 generality 更准确地理解为从 direct single-point prediction 扩展到若干 gradient-based crystalline materials tasks.

