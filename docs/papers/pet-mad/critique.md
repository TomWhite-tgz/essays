---
title: PET-MAD 局限与审读结论
description: 数据效率, benchmark 公平性, reference bias, UQ 和 universality 的证据边界.
---

# PET-MAD 局限与审读结论

## 最强贡献

PET-MAD 最有说服力的贡献不是某个最低 MAE, 而是展示一套紧凑系统可以进入真正昂贵的 atomistic workflows:

- 95.6k diverse structures 与统一 DFT.
- 3.3M parameter PET.
- LoRA specialization.
- LLPR uncertainty propagation.
- Conservative default 与经过验证的 MTS acceleration.

六个案例覆盖 transport, phase coexistence, chemical swaps, PIMD, surrogate properties 和 ferroelectric transitions, 明显强于只做 single-point leaderboard.

## Data efficiency claim 的边界

Figure 1 显示 PET-MAD 用少 1-3 orders of magnitude 的 structures 达到 SevenNet/GNoME 级 energy-above-hull error. 但 frame count 不是 DFT cost 或 information content 的完整代理:

- MAD 使用全元素 110/1320 Ry cutoff, 单 frame 成本高.
- 其他数据集的平均 atoms/frame 不同.
- Rattled/random structures 可能每帧提供更广 force information.
- PET 的 1500 epochs 使每个 frame 被重复使用很多次.

因此结论应是 sample efficiency 高, 不能直接推出总 compute 或 energy footprint 更低, 除非报告 DFT core-hours 与训练 FLOPs.

## Benchmark fairness 是双刃剑

按模型训练 level of theory 选择 compatible reference, 能分离 ML approximation error 与 DFT mismatch. 但不同模型实际在逼近不同 functions, 所以表中 MAE 不是对同一 target 的直接竞赛.

最完整报告应同时给:

1. 每个模型对自身 native reference 的 fidelity.
2. 所有模型对共同 high-level reference 的 scientific accuracy.

本文主要解决第一项. 对实验真实性的比较由 GaAs, water 与 BTO 明确暴露出 PBEsol bias.

## Universality 的缺口

MAD 不含或弱化:

- Magnetism 与 multiple spin states.
- Explicit charge states.
- Long-range electrostatics beyond 4.5 Å local graph.
- Dispersion-consistent labels.
- Strongly correlated systems.
- Reactive pathways 的系统覆盖.

85-element coverage 不等于这些 physical variables 已被识别. 同一 geometry 在不同 charge/spin 下具有不同 PES, 输入若不含状态变量就不可辨识.

## 六个案例的证据相关性

PET-Bespoke 和 LoRA 使用同一专用数据, LoRA 又从 PET-MAD 初始化, 三条结果不是三个完全独立实验. 在 HEA 案例中, 作者甚至认为 undersampled bespoke model 过拟合, 因而没有一个明确的高精度 reference trajectory.

尽管如此, PET-MAD out-of-box 与多种 prior bespoke workflows 定性或半定量一致, 仍是强实用证据. 应把它表述为 workflow readiness, 而不是每个 observable 都经过 direct DFT 或 experiment 验证.

## UQ 与 fine-tuning

LLPR 在 MAD domain calibration 出色, 且 GaAs error propagation 合理. 但 last-layer approximation 可能漏掉 representation error, 对完全 OOD chemistry 需额外 calibration.

LoRA 在低数据时有效, 但 Table II 证明 base MAD accuracy 明显下降. 因此 PET-MAD-LoRA 是 domain-specialized derivative, 不是无代价增加新能力的同一个 universal model.

## Direct-force 教训

论文没有因速度而淡化 non-conservative risk. BMIM-Cl 显示 NVT global temperature 可以掩盖 species-specific 2000 K heating 和错误扩散. MTS 每 8 步用 conservative correction 在该体系修复采样, 是有价值的工程路线.

但 MTS stability 依体系频谱, outer timestep 和 error smoothness, 需要逐应用验证.

## 最终判断

PET-MAD 有力支持以下命题:

> 在固定计算预算下, 多样性与标签一致性可能比重复堆叠近似平衡构型更有价值.

它没有证明 100k structures 足以建立无条件 universal PES. 更准确的定位是: PET-MAD 是一个轻量, 快速, 可微调, 带低成本 UQ 的广域 PBEsol emulator, 对许多复杂 workflow 具有强 out-of-box readiness, 同时对 spin, charge, long range 与 reference accuracy 保留清晰边界.

