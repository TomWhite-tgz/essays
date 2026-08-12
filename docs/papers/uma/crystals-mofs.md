---
title: 分子晶体与 MOFs
description: OMC25, CSP Blind Test, ODAC OOD 与 total-energy difference 的跨域证据.
---

# 分子晶体与 MOFs

## OMC25 held-out test

| Model | Energy/atom | Force | Stress |
| --- | ---: | ---: | ---: |
| UMA-S-1.1 | 1.03 | 5.04 | 0.93 |
| UMA-S-1.2 | 1.01 | 3.63 | **0.84** |
| UMA-M-1.1 | **0.84** | **2.83** | 0.90 |
| eSEN-S-OMC | 1.05 | 5.39 | 0.94 |

Energy 为 meV/atom, force 为 meV/Å, stress 为 meV/Å$^3$. 所有 active UMA variants 都整体优于作者训练的 OMC-only eSEN baseline. 这支持 OMol 等跨任务数据为 intermolecular crystal representation 提供互补信息.

## CSP Blind Test

主文 Table 4 在 CCDC 7th CSP Blind Test subset 上比较 lattice-energy MAE, Kendall rank 与 matched-structure RMSD:

| Model | Lattice energy | Kendall rank | RMSD |
| --- | ---: | ---: | ---: |
| UMA-S-1.1 | **2.13 kJ/mol** | **0.86** | **0.13 Å** |
| UMA-S-1.2 | 3.02 | 0.84 | **0.13 Å** |
| UMA-M-1.1 | 3.24 | 0.82 | 0.14 Å |
| eSEN-S-OMC | 6.18 | 0.74 | 0.18 Å |

更大的 M 并未最好, 新的 1.2 也未超过 1.1. 这再次说明 architecture/training version 与 benchmark specificity 比 total capacity 更重要.

论文正文声称 lattice-energy accuracy $\leqslant3$ kJ/mol, 但 active table 中 UMA-S-1.2 为 3.02, UMA-M-1.1 为 3.24. 该表述只严格适用于 S-1.1, 或依赖把数值粗略四舍五入.

## Structure matching 的筛选效应

RMSD 只对 pymatgen `StructureMatcher` 成功匹配的 DFT/UMA-relaxed polymorphs 计算. 若模型 relaxation 进入完全不同结构且无法匹配, 它可能不进入 RMSD average. 因而 RMSD 需与 match rate 一起看, 但主文 compact table 未显示后者.

## ODAC OOD-L/T

| Model | Adsorption-energy MAE | Force MAE |
| --- | ---: | ---: |
| UMA-S-1.1 | **289.9 meV** | 13.3 meV/Å |
| UMA-S-1.2 | 302.5 | 15.5 |
| UMA-M-1.1 | 294.1 | 10.3 |
| EquiformerV2-ODAC | 316.0 | **7.2** |

UMA 的 adsorption-energy error 更低, specialized EquiformerV2 的 force 更低. 正文说 UMA 在 hardest OOD test 上 best performance, 若指 adsorption energy 成立, 若指全部 metrics 则不成立.

## MOF task 的适用边界

UMA 使用与 ODAC23 重叠的 ODAC25 subset, 主要覆盖 $\mathrm{CO_2}$ 与 $\mathrm{H_2O}$ 在 MOFs 中的 adsorption/co-adsorption. 这不支持对任意 adsorbate, hydrocarbon 或全新 bare MOF chemistry 的普遍可靠性.

模型同样使用 6 Å cutoff. Dispersion 以 D3 reference 隐含在 local training target 中, 但真正超过 receptive field 的 framework-guest long-range interaction仍无法由 architecture 显式计算.

## 结论

Molecular crystals 是 UMA 跨任务训练最令人信服的正迁移案例之一. MOF 结果支持 adsorption energy, 但 force 与 domain coverage 仍有明显边界.
