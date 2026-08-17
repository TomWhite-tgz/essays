---
title: 晶体表示, 周期性与对称性
description: Unit cell tuple, fractional coordinates, lattice latent 与 exact 和 approximate symmetry.
---

# 晶体表示, 周期性与对称性

## Unit cell tuple

论文将含 $N$ 个 atoms 的 crystal 写成

$$
\mathcal C=(\mathbf A,\mathbf F,\mathbf L),
$$

其中 $\mathbf A\in\{0,1\}^{N\times N_Z}$ 是 atom identities, $\mathbf F\in[0,1)^{N\times3}$ 是 fractional coordinates, $\mathbf L\in\mathbb R^{3\times3}$ 是 lattice matrix. 按 row-vector convention,

$$
\mathbf X=\mathbf F\mathbf L.
$$

![Unit cell 与周期重复](/images/crystalite/unit-cell.png)

## Torus 与两种 minimum image

Fractional coordinate 位于 $\mathbb T^3\cong(\mathbb R/\mathbb Z)^3$. Training loss 使用 componentwise wrapped residual,

$$
\operatorname{wrap}(\mathbf u)=\mathbf u-\operatorname{round}(\mathbf u).
$$

![Fractional coordinates](/images/crystalite/fractional.png)

对 non-orthogonal lattice, componentwise shortest fractional displacement 不一定给出 shortest Cartesian displacement. GEM 因而显式枚举 $\Omega_R=\{-R,\cdots,R\}^3$, 用 metric tensor $\mathbf G=\mathbf L\mathbf L^\top$ 选择

$$
\Delta\mathbf f_{ij}^{\star}
=\underset{\mathbf r\in\Omega_R}{\arg\min}\,
(\mathbf f_i-\mathbf f_j+\mathbf r)\mathbf G
(\mathbf f_i-\mathbf f_j+\mathbf r)^\top.
$$

Main configuration 取 $R=1$, 即每对 atoms 比较 27 个 images. 这在 reduced, regular cells 中通常足够, 但论文没有证明对所有 skewed cells 都能找到全局 minimum image.

## Lattice latent

正文将 6-dimensional latent 还原成 positive-diagonal lower-triangular matrix:

$$
\mathbf L(\mathbf y)=
\begin{bmatrix}
\mathrm{e}^{y_1}&0&0\\
y_2&\mathrm{e}^{y_3}&0\\
y_4&y_5&\mathrm{e}^{y_6}
\end{bmatrix}.
$$

这样 determinant 始终为正, 也去掉 rotation redundancy. Dataset 先做 Niggli reduction 并使用 fixed convention. 公开代码把该表示称为 `ltri`, 与另一个 `[log lengths, cos angles]` 的 `y1` representation 区分.

## 哪些 symmetry 是 exact

没有 atom index positional embedding, self-attention 与 pair bias 对 atom permutation 是 equivariant. Fractional Fourier embedding 对整数 lattice translation 是 periodic. 但对所有 atoms 加任意 common fractional translation 时, absolute coordinate embeddings 会改变. Training 只用 random global translations 鼓励 approximate translation equivariance.

Rotation 与 lattice-basis permutation 主要靠 canonical preprocessing 消除, architecture 没有 exact guarantee. GEM 的 normalized distance branch 是 rotation invariant, 但 edge branch 同时读取 minimum-image fractional displacement 和 basis-dependent lattice descriptor. 所以论文附录列出的 target distribution symmetries 不等于 model 已严格满足这些 symmetries.

