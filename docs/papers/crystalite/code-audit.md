---
title: 代码复现审计
description: 公开仓库, checkpoints, v2 后 loss normalization 修复与 paper-code configuration gaps.
---

# 代码复现审计

## 公开状态

论文给出 [GitHub repository](https://github.com/joshrosie/crystalite), MIT license, DNG 与 CSP checkpoints, dataset download utilities, sampling scripts 和 evaluation pipelines. README 明确将当前版本称为 early release, 并提示经历 major refactor.

本次审计读取的公开 commit 为 `3b2d4eacf3f0b17a04851b7bed1fcedc9733cda9`, 日期 2026-07-15. 该 shallow repository 的 visible history 只有这个 root commit, 晚于 v2 的 2026-07-01 submission. 因而代码能核对 current implementation, 不能逐行证明 arXiv experiments 使用了完全相同 commit.

## Loss normalization bug

[Issue 1](https://github.com/joshrosie/crystalite/issues/1) 记录旧 helper 除以 real-token count 后, 又除以 feature dimension. 结果是 type loss 比论文逐 atom 求和式小 16 倍, fractional-coordinate MSE 小 3 倍. 作者确认 wrong normalization 并在 current commit 修复.

修复后的 DNG README recipe 使用

$$
(\lambda_H,\lambda_F,\lambda_{\mathrm{lat}})=(16,150,5),
$$

而 v2 Table 4 写 $(1,50,5)$. 这个变化在数值上恰好补偿 16-dimensional type 与 3-dimensional coordinate 的旧 reduction. 但 public history 不足以确认这是有意兼容 checkpoint, 还是 current recipe 的另一项设置变化. 因而至少要区分:

- 论文公式所表达的 per-atom feature-sum normalization.
- Public issue 中出现过的 feature-mean reduction.
- Current code 的 fixed reduction 与 README adjusted weights.

Released checkpoint 的 exact training reducer 无法从当前 shallow public history 证明. 复现报告必须写全 code commit, reducer 与 weights, 不能只说使用 paper hyperparameters.

## Checkpoint steps 与 paper steps

Paper table 报告 CSP MP-20 训练 5.0M steps, MPTS-52 训练 3.0M steps. Current README 的 released best checkpoints 分别位于 1.4M 与 2.3M steps, recipe 直接在 best step 停止. 这可能表示原始 run 继续训练但 checkpoint selector 选择更早状态, 不一定矛盾. 但要复现 table point, 实际 checkpoint step 比 nominal training budget 更重要.

## 实现核对

Current code 确实实现了以下关键机制:

- PCA subatomic encodings 与 cosine nearest-prototype decoding.
- `ltri` 与 `y1` 两种 lattice representations.
- $R=1$ 或 2 的 metric-aware periodic image enumeration.
- Non-positive distance slope, edge Fourier/RBF MLP 与 sigma gate.
- Shared GEM 或 per-layer GEM.
- Channel-wise auxiliary Karras schedules 与 Heun correction.
- $0.0$ 和 $0.1\,\mathrm{eV/atom}$ 两个 hull thresholds.

代码还暴露论文压缩掉的细节. GEM edge MLP 的 last layer zero-initialized. Distance branch slope 用 negative softplus parameterization. Noise gate 读取 $-\log\sigma$. Padded pair biases 与 lattice-token interactions 显式置零.

## Paper 与 current README 的其他差异

Paper DNG table 写 2.5M training steps, current checkpoint recipe 仍为 2.5M. CSP released checkpoints 则在更早 best steps. Paper 表写 anti-annealing $(0,4,4)$, 但 checkpoint metadata 可能存 `aa_rho_lattice=0`, README 要求 evaluation 时显式 override 为 4. Paper 不提这个 checkpoint metadata caveat.

Current README 给出的 512-sample DNG reference SUN 为 0.111, MSUN 为 0.558, 与 paper 10,000-sample SUN 47.49% 不可直接比较. 除 sample budget 不同外, stable 和 metastable thresholds 也不同. 这正说明 extensive metrics 必须携带 budget 与 threshold.

## 复现结论

代码公开度高于只发布 checkpoint 的论文, 但 arXiv v2 不是 self-contained executable specification. 最稳妥的复现目标是 current code 加 released checkpoint 加 README evaluation command. 若目标是重训 paper model, 还需作者冻结 exact pre-v2 code, raw loss reduction, selected checkpoint 与 random-seed protocol.
