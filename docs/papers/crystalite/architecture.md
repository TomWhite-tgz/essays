---
title: Transformer 架构与 GEM
description: Atom-lattice token sequence, AdaLN blocks 与 periodic geometry attention bias.
---

# Transformer 架构与 GEM

## Token sequence

每个 atom token 是 type embedding 与 fractional-coordinate Fourier embedding 之和:

$$
\mathbf t_i^{\mathrm{atom}}
=E_H(\mathbf H_i)+E_F(\mathbf f_i).
$$

Lattice latent 经 MLP 形成一个 global token. 最终 sequence 为

$$
\mathbf T^{(0)}=left[
\mathbf t_1^{\mathrm{atom}},\cdots,
\mathbf t_N^{\mathrm{atom}},
\mathbf t^{\mathrm{lat}}
\right].
$$

Noise coordinate $c_{\mathrm{noise}}(\sigma)=\dfrac14\log\sigma$ 经 MLP 后, 用 AdaLN 注入每个 Transformer block. Final atom tokens 分别预测 type 与 coordinates, final lattice token 预测 6-dimensional lattice latent.

## GEM 的 minimum-image geometry

![GEM 总图](/images/crystalite/gem.png)

GEM 从当前 noisy $\mathbf F_\sigma$ 与 $\mathbf L(\mathbf y_\sigma)$ 计算每对 atoms 的 minimum-image fractional displacement $\Delta\mathbf f_{ij}^{\star}$ 与 normalized Cartesian distance

$$
\bar d_{ij}
=\dfrac{\left\|\Delta\mathbf f_{ij}^{\star}\mathbf L\right\|_2}
{s(\mathbf y)},
$$

其中 $s(\mathbf y)$ 是 3 个 lattice lengths 的平均值.

## 两条 bias branches

Distance branch 为每个 attention head 学一个 non-positive slope:

$$
B_{hij}^{\mathrm{dist}}=\alpha_h\bar d_{ij},qquad\alpha_h\leqslant0.
$$

Edge branch 将 fractional displacement Fourier features, distance RBF 与 lattice descriptor 拼接后送入 MLP:

$$
B_{hij}^{\mathrm{edge}}
=\operatorname{MLP}_{\mathrm{edge}}
\left(left[
\gamma_\Delta(\Delta\mathbf f_{ij}^{\star}),
\gamma_d(\bar d_{ij}),
\psi(\mathbf y)
\right]\right)_h.
$$

二者经过 noise-dependent gate:

$$
B_{hij}^{\mathrm{geom}}
=g_h(\sigma)\left(
B_{hij}^{\mathrm{dist}}+B_{hij}^{\mathrm{edge}}
\right).
$$

![GEM 详细计算](/images/crystalite/gem-detailed.png)

Bias 只作用于 atom-atom block. 与 global lattice token 有关的 rows 和 columns 填零. Attention 仍是

$$
\operatorname{Attn}(Q,K,V)
=\operatorname{softmax}\left(
\dfrac{QK^\top}{\sqrt d}+\widetilde{\mathbf B}^{\mathrm{geom}}
\right)V.
$$

## 为什么快, 又为什么不是 linear

GEM 没有 spherical harmonics 或 tensor products, bias 也可在 layers 间共享. 但 standard attention matrix, pair geometry, edge features 与 bias 都是 $N\times N$. $R=1$ 时 minimum-image search 还要为每对 atoms 检查 27 个 offsets. 因而 asymptotic memory 和 compute 仍是 $O(N^2)$.

Benchmarks 只覆盖最多 52 atoms per unit cell. 对该尺度, dense batched Transformer 很适合 GPU. 论文没有测试 hundreds 或 thousands of atoms 的 supercells, 所以 lightweight 是当前 benchmark regime 的 wall-clock statement, 不是 general large-system scaling theorem.

