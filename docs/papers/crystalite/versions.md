---
title: v1 到 v2 的变化
description: Crystalite 官方 TeX archives 的逐版本差异, 配置修正与数值更新.
---

# v1 到 v2 的变化

## 时间线

| 版本 | arXiv 时间 | 核心变化 |
| --- | --- | --- |
| v1 | 2026-04-02 17:03:42 UTC | 首次提交 |
| v2 | 2026-07-01 16:42:39 UTC | 澄清 task-specific configurations, 更新结果与消融 |

## 最重要的修正是 model identity

v1 声称所有 experiments 共用约 67M parameters, 14 layers, width 512, PCA-16 Subatomic Tokenization, 150 sampling steps 与相同 anti-annealing settings. v2 将其改为 3 套 task-specific configurations:

- DNG MP-20, width 512, PCA-16, edge bias only, shared GEM, 2.5M training steps, 150 sampling steps.
- CSP MP-20 与 Alex-MP-20, width 1024, atomic-number features, distance plus edge bias, per-layer GEM, 5.0M training steps, 400 sampling steps.
- CSP MPTS-52, width 1024, atomic-number features, edge bias only, per-layer GEM, 3.0M training steps, 400 sampling steps.

这不是文字润色. 它改变了读者对 result comparability, model size 与 speed-accuracy trade-off 的理解. v2 的 CSP state-of-the-art 不能再归给 v1 所描述的统一 67M DNG configuration.

## Main tables 更新

CSP point estimates 从 v1 的 MP-20 `66.05, 0.0329`, MPTS-52 `31.49, 0.0701`, Alex-MP-20 `67.52, 0.0335`, 改为 v2 的 `66.09, 0.0337`, `31.56, 0.0711`, `68.26, 0.0317`. v2 还新增 $\pm$ values.

DNG 的 Crystalite row 也更新:

| Metric | v1 | v2 |
| --- | ---: | ---: |
| Composition validity | 81.94 | 81.72 |
| Unique | 95.33 | 95.24 |
| Novel | 79.15 | 79.30 |
| UN | 77.12 | 77.33 |
| Stable | 70.97 | 69.72 |
| SUN | 48.55 | 47.49 |
| Density $W_1$ | 0.046 | 0.051 |
| N-ary $W_1$ | 0.125 | 0.127 |

v2 同样新增 uncertainty row. 这些改动略微降低 main DNG result, 没有改变 table ranking.

## 新增证据

v2 新增 Subatomic Tokenization 对 one-hot 的 training-trajectory ablation, 新增 CSP anti-annealing grid, 扩充 task-specific hyperparameter table, 并重画 GEM figures. 它还明确 learned embedding 不保证 chemical similarity, 将 `chemically structured` 多处改为更中性的 `subatomic`, 删除 optimized timing 明确来自 FlashAttention 的说法, 只保留 optimized `bfloat16`.

## 仍未在 v2 解决的事

v2 没有说明 $\pm$ values 的 estimator 和 repeated-run protocol, 没有报告 CSP parameter counts 与 total training cost, 也没有统一 stable 与 metastable threshold naming. 更重要的是, loss normalization bug 在 v2 后才由公开代码 issue 暴露, 因此不属于 v2 source 内的修正.

