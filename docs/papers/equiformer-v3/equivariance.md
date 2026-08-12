---
title: SE(3) irreps 与 Equiformer 谱系
description: 解释 EquiformerV3 的 irreps 表示, rotation trick 与 EquiformerV2 起点.
---

# $SE(3)$ irreps 与 Equiformer 谱系

## 特征如何变换

平移不变性通过相对位移 $\mathbf r_{ij}=\mathbf r_j-\mathbf r_i$ 实现. 对旋转 $R\in SO(3)$, degree $L$ 的 type-$L$ feature 按 Wigner matrix 变换:

$$
\mathbf x^{(L)}\mapsto D^{(L)}(R)\mathbf x^{(L)}.
$$

$L=0$ 是 scalar, $L=1$ 与普通 3D vector 同构, 更高 $L$ 描述更细的 angular frequency. 若每个 degree 都有 $C$ 个 channels, 从 $L=0$ 到 $L_{\max}$ 的总分量数为

$$
C\sum_{L=0}^{L_{\max}}(2L+1)=C(L_{\max}+1)^2.
$$

这解释了为什么提高 $L_{\max}$ 很快增加 memory 与 compute.

## 从 SO(3) 到 SO(2)

对 edge $(i,j)$, 模型先构造旋转 $R_{ij}$, 把 $\mathbf r_{ij}$ 对齐到 $y$ axis. 在这个 local frame 中, 与 edge direction 相关的 SO(3) tensor product 可以化为按 order $m$ 分组的 SO(2) linear operations. 计算结束后再用 $D(R_{ij})^{-1}$ 旋回 global frame.

这条 rotation trick 是 eSCN 与 EquiformerV2 的核心效率来源, 不是 V3 新提出的. V3 的工程贡献是减少这些旋转, permutation 和 concatenate 的中间开销.

## 三代模型

| 模型 | 关键点 |
| --- | --- |
| Equiformer | 将 Transformer attention 与 irreps tensor products 结合 |
| EquiformerV2 | eSCN SO(2) convolution, attention re-normalization, separable $S^2$ activation |
| EquiformerV3 | fused implementation, merged LN, wider FFN, smooth attention cutoff, SwiGLU-$S^2$ |

因此读 V3 时必须区分 inheritance 与 novelty. Graph attention 主骨架, eSCN rotation trick 和普通 $S^2$ activation 都来自前作; V3 的创新在于重新组合, 优化与替换其中的具体操作.

## $SE(3)$ 还是 $E(3)$

论文标题明确写 $SE(3)$, 即 translation 加 proper rotations. 仅使用 $SO(3)$ irreps 并不自动处理 reflection parity. 对 energy 和 force 的常规原子势任务, 是否需要完整 $E(3)$ 取决于输入表示, spherical harmonics parity 与输出约束. 本文实验检验 rotation equivariance, 没有单独报告 reflection test.

