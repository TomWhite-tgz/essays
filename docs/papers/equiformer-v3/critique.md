---
title: 局限与审读结论
description: 评价 EquiformerV3 的证据强度, 混杂因素与实际贡献.
---

# 局限与审读结论

## 最扎实的贡献

第一, 实现优化用相同 parameters, targets 与 MAE 给出 $1.75\times$ end-to-end training speedup, 证据口径清楚. 第二, SwiGLU-$S^2$ 把 scalar gate, fast spherical tensor product 与 sampling theory 连接起来, 既有机制解释, 又有 body-order 与 equivariance tests. 第三, Matbench 同时考察稳定性, relaxation 与 thermal conductivity, 比只报告 validation energy/force MAE 更接近材料模拟的实际要求.

## 主要混杂因素

- OC20 是 cumulative sequential ablation, 顺序固定且没有 seeds.
- 最终 SwiGLU-$S^2$ row 比前一 row 多 25M parameters, 不是等参数对比.
- OMat24 direct 与 gradient rows 更换 force parameterization, regularization 和 label normalization.
- Matbench V2 到 V3 同时修改多个组件, 不能把 $\kappa$ 改善完全归因于 smooth cutoff.
- Training GPU-hours 跨 H100 与 H200 对比, 没有 hardware-normalized compute.

## `strict equivariance` 的措辞

结果的真实含义是 rotation test error 与 gate baseline 同阶, 约为 $10^{-6}$. 这是非常好的数值等变性, 但 `strict` 容易被误读为 analytic exactness. Discrete quadrature, floating-point arithmetic, neighbor-list boundaries 与 stochastic dropout 都需要条件说明.

## 物理一致性还缺什么

论文强调 smooth PES 与 energy conservation, 但没有直接给出 long-time NVE energy drift curve, cutoff crossing scan, phonon dispersion error 或不同 finite-difference step 的 force-constant convergence. Matbench thermal conductivity 是重要的 downstream evidence, 却仍把 architecture, training data 与 relaxation pipeline 混在一起.

## Generality 的边界

三组 benchmark 覆盖 catalyst surfaces 与 inorganic crystals, 但不覆盖 molecular datasets, reactive chemistry, charged systems, liquids 或 biomolecules. 论文 title 中的 general 指向 output parameterization 与 derivative-sensitive tasks 的扩展, 不是已证明跨所有 atomistic domains universal.

## 总体判断

EquiformerV3 是一篇强工程与强方法结合的迭代论文. 它没有用全新架构推翻 EquiformerV2, 而是准确找出高阶 equivariant Transformer 的真实瓶颈: redundant GPU operations, node/edge capacity allocation, cutoff discontinuity 与 nonlinear spherical aliasing. 最值得复用的是这些问题分解与代码化解法. 最需要后续补强的是等参数多 seed ablation, direct smoothness diagnostics, hardware-neutral efficiency 和跨化学域验证.
