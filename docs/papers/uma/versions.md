---
title: 版本演化与 diatomic 失效
description: UMA-1, 1.1, 1.2 的训练差异, extensivity bug 与 dissociation 审计.
---

# 版本演化与 diatomic 失效

## 为什么版本必须分开

v2 并不是对 v1 文字的小修. 它把 2025-2026 的多个 checkpoint 世代放进同一稿件:

| Version | 关键变化 |
| --- | --- |
| UMA-1 | Full OMol25, 仍有已知 size-extensivity bug |
| UMA-1.1 | 从 1.0 fine-tune, 修复 size-extensivity bug |
| UMA-S-1.2 | End-to-end FP32 conservative, 64 experts, task-specific heads, 新数据与新 backend |

主文最终表主要比较 S-1.1, S-1.2 与 M-1.1. Scaling 与许多架构消融仍基于初始 training design. 用户不能把 UMA-L scaling prototype 的属性自动赋给 released S-1.2.

## UMA-S-1.2 的结构与数据变化

1.2 两阶段都使用 autograd force/stress, 300 neighbors 与 FP32. 它加入 charge balancing, single-atom prediction, task-specific output heads, 64 experts, 32 radial bases.

训练数据新增:

- Updated OMol25 与 OPoly26.
- OC22 oxide catalysis.
- OC25 catalysis.
- OMat/OMol diatomics.
- 所有 tasks 的 isolated atoms.

Sampling ratio 也重写, 其中 OMol+OPoly 与 OC25 为 16, 远高于 OMat AIMD 4. 因此 1.2 的 gains 同时混合 architecture, label coverage 与 sampling distribution.

## UMA-1.1 的 diatomic 失败

Appendix 明确承认 UMA-1 与 1.1 在 diatomic curves 上有时出现 unphysical behavior, 尤其 OMat task 在 bonding region 外有大幅能量波动.

![UMA-S-1.1 diatomic curves](/images/uma/fig7.png)

这是一项极有价值的 unit test. 训练集有近 5 亿 structures, element-pair heatmap 几乎全覆盖, 仍没有自动学到正确的 isolated two-body limit.

## Training recipe 可修平滑, 数据决定精度

未加入 diatomic data 的 1.2 prototype 已产生定性更平滑的 curves:

![未加入 diatomic data 的 UMA-S-1.2](/images/uma/fig8.png)

但其误差仍很大. 加入 task-specific diatomic data 后, released 1.2 明显改善:

![加入 diatomic data 的 released UMA-S-1.2](/images/uma/fig9.png)

| Model | OMat E | OMat F | OMol E | OMol F |
| --- | ---: | ---: | ---: | ---: |
| 1.2 without diatomics | 128.6 | 279.6 | 2429.5 | 1326.9 |
| 1.2 with diatomics | 37.8 | 52.5 | 60.5 | 103.4 |

Energy 为 meV, force 为 meV/Å. Training recipe 主要修复 qualitative smoothness, explicit data 则使 OMol energy MAE 降约 40 倍. 这直接反驳仅靠规模便会自动补齐基础极限的强版本 scaling 叙事.

## Dissociation 后 global charge/spin 失真

当 bond length 超过约 5.5 Å, envelope 使 edge interaction 趋近 0, 两个 atoms 在 graph 中断开. 但每个 atom node 仍收到相同 system-level charge/spin embedding.

以 $\mathrm{N_2}$ singlet dissociation 为例, overall spin multiplicity 不能简单复制成两个 isolated nitrogen fragments 的局部电子态. 模型没有学习 electron partition 或 fragment-specific spin, 因而 asymptote 仍会错误.

## 剩余伪影

作者指出 N-N dissociation 在约 1.8-1.9 Å 还有小 barrier, 可能来自 training data. Released 1.2 的 diatomic curves 更平滑更准, 但不是物理极限已完全解决.

## 对 foundation model 的启示

Universal benchmark average 不能替代 unit tests. Diatomic, isolated atoms, separated fragments, charge transfer 与 long-range asymptote 应作为 architecture release gate, 而不是等下游用户发现后再补数据.
