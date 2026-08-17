---
title: 消融与大样本行为
description: Subatomic Tokenization, GEM, anti-annealing 与 million-sample diversity evidence.
---

# 消融与大样本行为

## Subatomic Tokenization

![Subatomic Tokenization 消融](/images/crystalite/token-ablation.png)

PCA-16 tokens 在后半段 training 中保持更高 UN 与 SUN, stability ceiling 也更高. 但 one-hot baseline 的 atom-loss weight 被调到与 token model 对齐 stability trajectory. 因而该图证明的是经过 loss balancing 后的 system-level advantage, 不是 raw encoding 的独立 effect.

## GEM 对 DNG

![GEM 对 DNG 的影响](/images/crystalite/gem-dng.png)

GEM on 与 off 的 UN trajectory 相近, on model 更快获得 stability, 从而全程 SUN 更高. 这与 GEM 提供 geometry prior 的预期一致. 图没有多 seed bands, 而且 checkpoint curves 同时随训练时间变化, 所以不能量化稳定的 final effect size.

## GEM 对 CSP

![GEM 对 CSP 的影响](/images/crystalite/gem-csp.png)

CSP 中 MR 差距很小, RMSD 差距较清楚. Mechanism inference 是 GEM 主要帮助 local refinement. 但 DNG 与 CSP 使用不同 GEM sharing 和 bias branches, 不能把两个 ablations 视为同一 module setting 的复现.

## Anti-annealing grid

DNG grid 涵盖 type AA $0,10,20$, coordinate AA $0,4,10$, lattice AA $0,4,10$, 共 27 个 settings. 最高 SUN setting 同时显著损伤 density matching. CSP grid 则在 coordinate 和 lattice 各取 $0,4,10,20$ 外加一个 legacy $(27,36)$ setting, $(4,4)$ 最佳.

因为 main inference settings 来自同类 metrics grid, anti-annealing gain 是 benchmark-tuned sampling gain. 更强证据需要在 validation grid 选 hyperparameters, 再锁定后评估 held-out datasets.

## 一百万 samples

![Large-scale generation](/images/crystalite/scaling.png)

Crystalite 与 ADiT 的 uniqueness 和 UN 都随 samples 增多而下降, Crystalite 到 $10^6$ samples 仍保持更高值. 这说明模型不是只在 10,000 sample budget 偶然占优.

图只有 2 个 models, 没有 confidence bands, 也没有对 million samples 做完整 MLIP relaxation. 它证明 diversity scaling, 不证明 million-scale SUN discovery yield. 此外 atom count 仍从 empirical distribution 采样, 所以 large-scale novelty 不是对 cell size 的 extrapolation.

