---
title: Subatomic Tokenization
description: 34-dimensional element descriptor, group balancing, PCA-16 与 nearest-prototype decoding.
---

# Subatomic Tokenization

## 从 one-hot 到连续 element geometry

MP-20 含 89 种 elements. One-hot 把 Li 到 Na 与 Li 到 Xe 的距离都设成相同. Crystalite 为每个 element $z$ 构造 34-dimensional descriptor:

| Oxygen descriptor | Titanium descriptor |
| --- | --- |
| ![Oxygen subatomic descriptor](/images/crystalite/oxygen.png) | ![Titanium subatomic descriptor](/images/crystalite/titanium.png) |

$$
\mathbf d_z=left[
\operatorname{onehot}_7(r_z-1),
\operatorname{onehot}_{19}(g_z),
\operatorname{onehot}_4(b_z),
\dfrac{s_z}{2},
\dfrac{p_z}{6},
\dfrac{d_z}{10},
\dfrac{f_z}{14}
\right].
$$

$r_z$, $g_z$, $b_z$ 分别是 period, group 与 block, 后 4 项是 valence-shell occupancy. 特征先按 supported elements 标准化, 再按 period, group, block, valence 4 组的 dimension 乘 $|G|^{-1/2}$, 防止 19-dimensional group one-hot 仅因维度更大而支配距离.

## PCA 与 normalization

Balanced descriptors 可用 fixed PCA basis 压缩. Main DNG 使用 16 dimensions, 最后做 $\ell_2$ normalization:

$$
\mathbf h_z^{\mathrm{PCA}}
=\dfrac{\bar{\mathbf d}_z\mathbf U_{16}}
{\left\|\bar{\mathbf d}_z\mathbf U_{16}\right\|_2}.
$$

![Subatomic tokens 的 PCA 投影](/images/crystalite/token-pca.png)

采样后的 continuous token 用 nearest prototype 解码:

$$
\widehat a_i
=\underset{z}{\arg\max}\,
\left\langle\widehat{\mathbf h}_i,\mathbf h_z^{\mathrm{PCA}}\right\rangle.
$$

由于 prototypes 已归一化, 这等价于 cosine similarity.

## 归纳偏置是什么

该表示将 periodic-table priors 固定进 diffusion space. Noise 下的近邻错误更可能是 descriptor 中接近的 element substitutions, 同时 16-dimensional regression 比 89-dimensional one-hot denoising 更紧凑. 它不是从结构数据中学习出的 chemical embedding, 也没有使用 oxidation state, bonding environment 或 pressure-dependent chemistry.

![Fe 在 token PCA 空间中的近邻](/images/crystalite/fe-neighbors.png)

图注称 learned token geometry, 但 PCA basis 和 descriptor 都是固定构造, 这处措辞不准确. 两维投影中接近也不保证完整 16-dimensional cosine distance 或真实 substitution energy 接近.

## 消融的公平性边界

v2 新增 one-hot comparison, 但作者为了对齐 stability trajectories, 调整了 one-hot baseline 的 atom-type loss weight. 这避免简单 stability imbalance, 同时意味着 comparison 不再是只替换 encoding 的严格 single-variable ablation. 图支持 tokenization 在选定 balancing 下改善 UN-SUN trade-off, 尚不能区分 dimension reduction, fixed chemical geometry 与 altered loss scale 各自贡献.
