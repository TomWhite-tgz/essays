---
title: 局限与审读结论
description: UMA 的 strongest evidence, scaling 外推, 版本混合, benchmark 公平性与开放性边界.
---

# 局限与审读结论

## 最强贡献

UMA 首次把约 4.59 亿 heterogeneous DFT structures, billion-scale total parameters, conservative inference 与跨 5 个 chemical domains 的应用评测放进同一系统. MoLE 的价值尤其具体:

1. Router 只读 trajectory-invariant global inputs.
2. Linear experts 可预合并为单一 equivariant operator.
3. 中等规模下相同 loss 所需 active params 约减少 2.5 倍.
4. 在 eSEN 与 EquiformerV2 上都观察到约 10% molecular-validation improvement.

这不是普通 sparse MoE 在原子模型上的直接复制, 而是针对 PES smoothness 和 repeated inference 重新设计的条件权重族.

## Universal 的含义仍是 task-conditioned

用户必须选择 DFT task ID. 同一结构在 `omat`, `omol` 或 `oc20` 下代表不同 reference PES. 模型共享 representation 与 expert bank, 但不是单一无条件物理真值.

元素 pair 几乎全覆盖也不等于 configuration universal. Diatomic failure, 6 Å disconnected fragments 与 unseen charge/spin 都是明确反例.

## Scaling law 有两层外推

实验只覆盖 direct-force pretraining 的 $10^{18}$-$10^{20}$ FLOPs. 最终预算约 $10^{22}$ FLOPs, 依赖约两个数量级的 extrapolation. 再从 pretraining validation loss 推到 conservative scientific applications, 又跨了一层 objective 与 training-stage 变化.

作者提供 bootstrap intervals 是优点, 但 Table 12 仍有 MoLE $\beta=0.44$ 落在所列 (0.39, 0.43) 区间之外, 以及 $\widehat\alpha$ 在 Equations 5-6 间符号混用的问题.

## MoLE 优势并非无限

在 UMA-M 区间, MoLE active-parameter efficiency 很强. 到 700M active params, 5.6B-total 8-expert model 只比 dense 略好. 数据量, optimization 或 expert redundancy 会让优势收敛.

因此不能从 UMA-M 的 2.5 倍直接外推更大模型. UMA-S-1.2 把 experts 从 32 增至 64, 但没有 isolated 64-vs-32 ablation.

## Benchmark tables 混合不同证据等级

- Table 2 是 held-out tests, 但大多仍在对应训练 task 内.
- Table 4 的 materials rows 使用 MPtrj/sAlex fine-tuning.
- OMC baseline 由同一作者团队训练, 外部独立性较弱.
- OC20 adsorption-energy advantage 部分来自 total-energy target 与 clean-surface data, 不只是 backbone.
- 各 baseline training data, precision, parameterization 与 software optimization 不一致.

所以 single model without fine-tuning 的总括适用于部分 rows, 不适用于整个 evaluation suite.

## 最终 v2 文字与 active tables 不完全同步

源码保留旧 UMA-S/M/L rows 但已注释, active rows 改为 1.1/1.2. 这产生数处陈述漂移:

- 正文说 UMA-L 在 AdsorbML 提升 25%, active Table 4 不再列 UMA-L.
- Active UMA-M-1.1 相对 EquiformerV2 提升约 18.8%.
- 正文称 molecular crystal lattice energy $\leqslant3$ kJ/mol, active S-1.2 为 3.02, M-1.1 为 3.24.
- 正文称 UMA-M 在 OMol test 显著优于 specialized models, 但 active Table 2 的 total-energy MAE 远高于 eSEN.

精读时应以 active v2 tables 为准, 不能只沿用 prose conclusion.

## Source 有重复标签与表格

Appendix 把同一 hyperparameter table 完整写了两次, 最终成为 Tables 6-7. `table:hps`, `table:training_proc` 和 `tab:datasets` 也被重复定义. 这使部分 `\ref` 指向后一个表, 例如初版 two-stage training 段可能显示指向 1.2 Table 9, 而不是原意的 Table 5.

这不改变数值本身, 但会降低 source-to-claim 可追踪性.

## Conservative 不等于所有任务最好

S/M 通过 NVE, 并在 phonon 与 optimization 上常优于 direct-force L. 但主表只给 NVE pass/fail, 没有 drift curve 与 protocol details. Conservative force 是必要结构约束, 不是 accuracy 或 stability 的充分条件.

## Long-range 与电子态

6 Å cutoff 无法作用于完全断开的 distant fragments. Global charge/spin embedding 又不能处理 dissociation 后的 fragment charge/spin allocation. 这些不是简单增加 data 就必然解决的局部误差, 而是 representation limitation.

UMA-S-1.2 加 diatomic data 大幅提高 accuracy, 但 OMol curves 的 asymptote 和 N-N 小 barrier 仍有问题.

## 开放性与许可

FAIR Chemistry code 使用 MIT license. Model checkpoints 位于 gated Hugging Face repository, 使用 FAIR Chemistry License, 要求用户提交身份信息并接受 acceptable-use terms. 当前 model card 还明确限制在 China, Russia, Belarus 与全面制裁地区的可用性.

因此论文所称 commercially permissive 与 code/data release 有真实价值, 但 checkpoint 不是无条件 global open-weight artifact. 这也解释了 DPA3 论文为何无法在中国访问并纳入 UMA benchmark.

## 最终判断

UMA 是目前最完整的 multi-domain atomistic foundation-model 工程之一. 它最可信地证明了共享 equivariant backbone 加 task-conditioned linear expert bank 可以在较低 active inference cost 下吸收极大异构数据, 并在多个实际 workflow 中达到有竞争力结果.

它尚未证明一个 checkpoint 对任意 chemistry, DFT reference, electronic state 与 length scale 都可靠. Scaling fit, dataset breadth 与 leaderboard averages 必须与 diatomic unit tests, conservative dynamics, reference alignment 和 domain-specific validation 一起使用.
