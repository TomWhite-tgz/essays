---
title: 全部编号公式
description: Crystalite v2 Eq. 1-103 的分段定位, 关键推导与记号审计.
---

# 全部编号公式

v2 共有 103 个连续编号公式. 主文为 Eq. 1-18, Appendices A-E 为 Eq. 19-103. 下表先给出完整 range map, 后文解释核心 groups.

## 完整 range map

| Equations | 内容 | PDF 页码 |
| --- | --- | ---: |
| 1 | Crystal tuple | 4 |
| 2-4 | Subatomic descriptor, token matrix 与 decoding | 4-5 |
| 5 | Lower-triangular lattice latent | 5 |
| 6-8 | Joint noising 与 3-channel losses | 5-6 |
| 9-13 | Atom-lattice tokens 与 denoiser outputs | 6-7 |
| 14-17 | GEM distance, biases 与 attention | 7-8 |
| 18 | Main anti-annealed Heun update | 8 |
| 19-23 | Unit cell, Cartesian map, torus 与 periodic crystal | 16-17 |
| 24-28 | Wrapped residual 与 metric-aware minimum image | 17-18 |
| 29-32 | Atom permutation, rotation, basis permutation, translation | 18 |
| 33-39 | Full Subatomic Tokenization construction | 19-21 |
| 40-49 | Detailed input embeddings, AdaLN blocks 与 heads | 22-23 |
| 50-58 | Detailed GEM construction | 24-25 |
| 59-69 | EDM noising, preconditioning, predictions 与 weights | 27 |
| 70-86 | Karras schedule, churn, anti-annealing 与 Heun sampler | 27-29 |
| 87-88 | Structural validity 与 validity rates | 30 |
| 89-91 | Uniqueness, novelty 与 UN | 31 |
| 92-95 | Wasserstein, density 与 N-ary distributions | 31 |
| 96-98 | Stable, metastable, SUN 与 MSUN | 32 |
| 99-100 | CSP match rate 与 matched-only RMSD | 32-33 |
| 101-103 | Intensive estimator, budget-dependent UN 与 SUN estimator | 33-34 |

## Eq. 1-8, generation state

Eq. 1 定义 $\mathcal C=(\mathbf A,\mathbf F,\mathbf L)$. Eq. 2-4 将 discrete atomic number 映射为 normalized continuous prototype, 再用 cosine nearest prototype 解码. Eq. 5 用 exponential diagonal 保证 lattice determinant positive. Eq. 6 同一 $\sigma$ 扰动 3 个 channels. Eq. 7 的 coordinate term 使用 wrapped fractional residual, Eq. 8 汇总 weighted objective.

主文 Eq. 7 写的是按 atoms 平均后对 feature squared norm 求和. 这正是 current code normalization issue 的判断基准.

## Eq. 9-18, network 与 sampler

Eq. 9-13 描述 $N$ 个 atom tokens 加一个 lattice token 的 Transformer. Eq. 14 normalized Cartesian distance, Eq. 15 合并 distance 与 edge biases, Eq. 16 展开 edge features, Eq. 17 将 bias 加入 attention logits. Eq. 18 将 channel factor $\alpha_i^{(q)}$ 乘到 Heun drift.

Eq. 17 使用 $\sqrt d$ 作为 scale, standard multi-head attention 通常按 per-head key dimension $d_h$ 使用 $\sqrt{d_h}$. 这里 $d$ 的定义在上下文中既可表示 hidden width, 也可能泛指 attention dimension. 公开实现调用 PyTorch `MultiheadAttention`, 实际由库按 head dimension scaling, 所以公式应读作 schematic notation.

## Eq. 19-39, crystal geometry 与 element tokens

Eq. 19-23 从 finite unit cell 生成 infinite periodic crystal. Eq. 24-25 是 componentwise wrapping. Eq. 26-28 用 Gram metric 在 finite offset set 内搜索 minimum image. Eq. 29-32 列出 target distribution 应满足的 4 类 symmetry, 不是 architecture exact-invariance theorem.

Eq. 33 明确 34-dimensional raw descriptor. Eq. 34 featurewise standardize, Eq. 35 group balance, Eq. 36 normalize, Eq. 38 PCA compress, Eq. 39 nearest prototype decode.

## Eq. 40-69, implementation specification

Eq. 40-44 依次定义 type embedding, Fourier coordinate embedding, atom token, lattice token 与 sequence. Eq. 45-46 noise embedding, Eq. 47-48 AdaLN residual blocks, Eq. 49 output heads.

Eq. 50-53 从 lattice latent 得到 Gram matrix 和 all-pairs minimum-image geometry. Eq. 54 是 non-positive linear distance prior. Eq. 55 是 learned edge branch. Eq. 56 noise gate, Eq. 57 对 global lattice token zero-pad, Eq. 58 写回 attention.

Eq. 59-69 完整展开 EDM. 值得注意的是 coordinate input wrap 到 $[0,1)$, coordinate denoised state 又在 centered space linear combine, 最后再 wrap. Paper 对这些 domains 做了区分, current code 也保留 centered state 与 decoded fractional state 两套变量.

## Eq. 70-86, anti-annealing 全过程

Eq. 70 是 base Karras schedule. Eq. 71-73 加 churn 并调用 denoiser. Eq. 74-76 为 3 个 channel drifts. Eq. 77 构造 auxiliary schedule, Eq. 78 取 step-size ratio 且下限为 1, Eq. 79 可对 coordinates cap. Eq. 80 是 Euler predictor, Eq. 81 再求 denoiser, Eq. 82-84 是 corrected drifts, Eq. 85 Heun average, Eq. 86 处理 terminal step.

Anti-annealing 因此不是降低 noise schedule temperature. 它保持 base $\sigma_i$ 和 denoiser 不变, 只扩大 selected channel 的 integration drift, 更像 channel-dependent time reparameterization.

## Eq. 87-103, evaluation semantics

Eq. 87-91 定义 validity 和 discovery sets. Eq. 92-95 定义 Wasserstein distribution metrics. Eq. 96 与 Eq. 97 分别使用 0.0 与 $0.1\,\mathrm{eV/atom}$ thresholds. Eq. 98 定义

$$
\operatorname{SUN}=\operatorname{UN}\times\operatorname{Stable}_{\mathrm{UN}},
\qquad
\operatorname{MSUN}=\operatorname{UN}\times\operatorname{Meta}_{\mathrm{UN}}.
$$

Eq. 99 的 MR 在全 test set 上计算, Eq. 100 的 RMSD 只在 matched set 上计算. Eq. 101-103 将 per-sample estimator 与 sample-budget-dependent discovery metric 区分开.

## 公式审读结论

公式覆盖程度较高, 特别是 v2 appendix 对 preprocessing, sampler 与 metrics 的定义优于许多 generation papers. 主要风险不在缺公式, 而在 formula-to-code reduction, stable threshold terminology, attention scale notation 与 finite periodic search assumption. 复现时需同时读取 Eq. 7, Eq. 58, Eq. 78, Eq. 96-98 和 released code.
