---
title: CSP 结果
description: MP-20, MPTS-52 与 Alex-MP-20 的 match rate, RMSD 与比较边界.
---

# CSP 结果

## 数据集

MP-20 含 45,231 crystals, 每个 cell 最多 20 atoms, 覆盖 89 elements. MPTS-52 含 40,476 structures, 最多 52 atoms, 使用 chronological splits, 因而 train 与 test 之间存在 temporal distribution shift. Alex-MP-20 含 675,204 structures, 最多 20 atoms, 来自 Alexandria 与 MP-20.

## Main table

| Model | MP-20 MR | MP-20 RMSD | MPTS-52 MR | MPTS-52 RMSD | Alex-MP-20 MR | Alex-MP-20 RMSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| KLDM | 65.83 | 0.0517 | 23.93 | 0.1276 | - | - |
| OMatG | 63.75 | 0.0720 | 25.15 | 0.1931 | 64.71 | 0.1251 |
| Crystalite | 66.09 | 0.0337 | 31.56 | 0.0711 | 68.26 | 0.0317 |

Crystalite 在表中 3 个 datasets 的 MR 与 RMSD 都最好. 相对各 dataset 此前最好 RMSD, 降幅分别为 34.8%, 44.3%, 74.7%. 对 MPTS-52, MR 相对 OMatG 从 25.15% 提升到 31.56%, 但仍有超过三分之二 targets 未匹配.

## MR 与 RMSD 的 denominator 不同

每个 composition 只生成一个 sample. MR 的 denominator 是全部 test compositions:

$$
\operatorname{MR}
=\dfrac{1}{N_{\mathrm{test}}}
\left|\left\{
i:\widehat{\mathcal C}_i\text{ matches }\mathcal C_i^{\mathrm{gt}}
\right\}\right|.
$$

RMSD 只在 matched subset $\mathcal M$ 上平均:

$$
\operatorname{RMSD}
=\dfrac{1}{|\mathcal M|}\sum_{i\in\mathcal M}r_i.
$$

因此低 RMSD 说明成功匹配的 cases 很精确, 不惩罚 unmatched predictions 的几何偏差. MR 与 RMSD 必须共同阅读.

## GEM 提升了什么

![CSP 中的 GEM 消融](/images/crystalite/gem-csp.png)

GEM 对 MR 影响较小, 对 RMSD 约有 20% 改善. 这支持 authors 的机制解释: geometry bias 更像 refinement prior, 帮助已进入正确 structural mode 的 sample 精调局部位置, 而不是大幅改变 mode recovery probability.

不过 GEM ablation 图只给 training trajectory, 没有独立 seeds 或 final numerical table. Main CSP results 的 $\pm$ 值也未说明来自 sampling seeds, checkpoints 还是 repeated training. 因而 precision 可引用, uncertainty interpretation 不完整.

## SOTA 口径

表中 baselines 的 architecture, training compute, sampling steps 与 checkpoint selection 不统一. Crystalite CSP 用 width 1024 和 400 EDM steps, 不是 abstract 中容易联想到的 67M DNG model. 所以结论应写为 selected standard benchmarks 和 single-sample protocol 下的 best reported result, 而不是普遍证明 Transformer 优于 equivariant generator.

