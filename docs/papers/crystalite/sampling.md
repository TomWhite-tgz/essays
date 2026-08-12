---
title: Anti-annealing 与任务配置
description: Channel-wise EDM drift rescaling, Heun update 与 DNG 和 CSP 的实际 hyperparameters.
---

# Anti-annealing 与任务配置

## 标准 Karras schedule

EDM noise schedule 为

$$
\sigma_i=left[
\sigma_{\max}^{1/\rho}
+\dfrac{i}{N-1}
\left(
\sigma_{\min}^{1/\rho}
-\sigma_{\max}^{1/\rho}
\right)
\right]^\rho.
$$

Sampler 加入 churn 后求 denoiser prediction, 由 noisy state 与 denoised state 的差形成 reverse drift, 再用 Heun predictor-corrector 积分.

## Channel-wise anti-annealing

作者另构造每个 channel $q$ 的 auxiliary Karras schedule $\widetilde\sigma_i^{(q)}$, 定义

$$
\alpha_i^{(q)}
=\max\left(
1,
\dfrac{\widetilde\sigma_i^{(q)}-\widetilde\sigma_{i+1}^{(q)}}
{\sigma_i-\sigma_{i+1}}
\right).
$$

然后将该 channel 的 EDM drift 乘 $\alpha_i^{(q)}$. 因为 $\alpha_i^{(q)}\geqslant1$, 它只会推动 channel 更快朝 denoised prediction 前进, 不会减慢更新. 这不是重新训练 score model, 而是 inference-time heuristic.

Main DNG 使用 $(\rho_H^{\mathrm{AA}},\rho_F^{\mathrm{AA}},\rho_{\mathrm{lat}}^{\mathrm{AA}})=(0,10,10)$, CSP 使用 $(0,4,4)$. DNG 150 steps, CSP 400 steps.

## 实际 task configurations

| 配置 | DNG MP-20 | CSP MP-20, Alex-MP-20 | CSP MPTS-52 |
| --- | ---: | ---: | ---: |
| Width | 512 | 1024 | 1024 |
| Layers | 14 | 14 | 14 |
| Heads | 16 | 16 | 16 |
| Type features | PCA-16 subatomic | Atomic number, 95 | Atomic number, 95 |
| GEM distance bias | Off | On | Off |
| GEM edge bias | On | On | On |
| GEM sharing | Across layers | Per layer | Per layer |
| Training steps | 2.5M | 5.0M | 3.0M |
| Sampling steps | 150 | 400 | 400 |
| Max atoms | 20 | 20 | 52 |

全部使用 batch size 128, learning rate $10^{-4}$, `bfloat16`, EMA weights 与 zero dropout. 但 v2 source 没有报告 parameter counts 或 total training GPU-hours. v1 曾把 DNG 称为约 67M parameters, v2 删除该统一说法. CSP width 翻倍后显然是更大模型, 所以 CSP accuracy 与 DNG speed 不能拼接成一个 model point.

## Sensitivity 的真实结论

CSP grid 中 $(4,4)$ 同时给出最高 match rate $66.09\%$ 与最低 RMSD 0.0337. 不加 anti-annealing 为 $65.04\%$ 与 0.0411. 这是可测提升, 但 main result 使用的 sampling rule 是在同一 benchmark grid 上选择出的最佳 pocket.

DNG grid 的最高 SUN 为 $51.42\%$, 出现在 coordinate 与 lattice 都取 4, 但 density Wasserstein distance 恶化到 0.500. Authors 因而报告较平衡配置, 没有 cherry-pick 最高 SUN. 这也说明任何 single summary metric 都无法同时表达 stability, diversity 与 distribution matching.

