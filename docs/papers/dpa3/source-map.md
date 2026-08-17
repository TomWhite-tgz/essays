---
title: DPA3 原文定位索引
description: arXiv:2506.01686v3 的章节, 公式, 图表与 Supplementary Information 映射.
---

# DPA3 原文定位索引

本索引以 36 页 arXiv:2506.01686v3 PDF 确定页码和编号, 以官方 `main.tex` 与 `sm.tex` 恢复数学结构. 主文与 Methods 为第 1-20 页, Supplementary Information 为第 21-30 页, References 为第 31-36 页.

## 主文章节

| 原文内容 | PDF 页码 | 精读页面 |
| --- | ---: | --- |
| Abstract, Introduction | 1-3 | [总览](/papers/dpa3/), [问题](/papers/dpa3/problem) |
| Results 2.1, DPA3 on LiGS | 4-5 | [LiGS](/papers/dpa3/ligs), [架构](/papers/dpa3/architecture) |
| Results 2.2, Related work | 5-6 | [问题](/papers/dpa3/problem), [局限](/papers/dpa3/critique) |
| Results 2.3, Benchmarking | 6-10 | [Benchmarks](/papers/dpa3/benchmarks), [效率](/papers/dpa3/efficiency) |
| Results 2.4, Scaling Law | 10-11 | [Scaling](/papers/dpa3/scaling) |
| Results 2.5, DPA-3.1-3M | 11-14 | [LAM](/papers/dpa3/lam), [多任务](/papers/dpa3/multitask) |
| Discussion | 14 | [局限](/papers/dpa3/critique) |
| Methods, Datasets | 14-16 | [Benchmarks](/papers/dpa3/benchmarks) |
| Methods, Line graph transform | 16-17 | [LiGS](/papers/dpa3/ligs) |
| Methods, DPA3 architecture | 17-20 | [架构](/papers/dpa3/architecture), [物理](/papers/dpa3/physics), [公式](/papers/dpa3/formulas) |
| Data availability | 20 | [总览](/papers/dpa3/) |

## 主文图表

| 图表 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Figure 1 | 4 | DPA3 architecture 与 LiGS updates | [总览](/papers/dpa3/), [架构](/papers/dpa3/architecture) |
| Figure 2 | 7 | 5 组 task-specific benchmarks | [Benchmarks](/papers/dpa3/benchmarks) |
| Table 1 | 9 | Compliant Matbench Discovery | [Benchmarks](/papers/dpa3/benchmarks) |
| Figure 3 | 10 | LiGS order $K$ 消融 | [LiGS](/papers/dpa3/ligs) |
| Figure 4 | 10 | OMat24 IsoFLOP scaling | [Scaling](/papers/dpa3/scaling) |
| Figure 5 | 11 | 12 datasets zero-shot LWARMSE | [LAM](/papers/dpa3/lam) |
| Figure 6 | 16 | Line graph transform 示例 | [LiGS](/papers/dpa3/ligs) |

## Supplementary figures

| 图 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Figure S-1 | 21 | Energy MAE 与 phonon properties | [物理](/papers/dpa3/physics) |
| Figure S-2 | 22 | DPA3/MACE inference efficiency | [效率](/papers/dpa3/efficiency) |
| Figure S-3 | 30 | Residual, SiLUT 与 LayerNorm 消融 | [Scaling](/papers/dpa3/scaling) |

## Supplementary tables

| 表 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Table S-1 | 23 | SPICE-MACE-OFF 逐 split MAE | [Benchmarks](/papers/dpa3/benchmarks) |
| Table S-2 | 23 | TorsionNet-500 | [Benchmarks](/papers/dpa3/benchmarks) |
| Table S-3 | 24 | Liquid water 与 ice | [Benchmarks](/papers/dpa3/benchmarks) |
| Table S-4 | 24 | Formate/Cu, graphene, zeolite | [Benchmarks](/papers/dpa3/benchmarks) |
| Table S-5 | 25 | DPA2 18 test sets | [Benchmarks](/papers/dpa3/benchmarks) |
| Table S-6 | 26 | 12 datasets zero-shot 明细 | [LAM](/papers/dpa3/lam) |
| Table S-7 | 27 | Non-compliant Matbench 与 fine-tuned LAM | [多任务](/papers/dpa3/multitask) |
| Table S-8 | 27 | SPICE fine-tuning | [多任务](/papers/dpa3/multitask) |
| Table S-9 | 28 | 全部训练 hyperparameters | [Scaling](/papers/dpa3/scaling), [效率](/papers/dpa3/efficiency) |
| Table S-10 | 29 | LiGS order/cutoff accuracy-cost | [LiGS](/papers/dpa3/ligs), [效率](/papers/dpa3/efficiency) |
| Table S-11 | 30 | Dataset encoding 与 separate heads | [多任务](/papers/dpa3/multitask) |

## 编号公式

| 公式 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Equation 1 | 7 | LWARMSE/LWAMAE | [公式](/papers/dpa3/formulas), [Benchmarks](/papers/dpa3/benchmarks) |
| Equations 2-3 | 17 | Force, virial 与 atomic energy | [公式](/papers/dpa3/formulas), [架构](/papers/dpa3/architecture) |
| Equations 4-8 | 17 | Residual updates 与 messages | [公式](/papers/dpa3/formulas), [架构](/papers/dpa3/architecture) |
| Equations 9-11 | 18 | Switch 与高阶 weights | [公式](/papers/dpa3/formulas), [物理](/papers/dpa3/physics) |
| Equations 12-16 | 18-19 | Self-message 与 symmetrization | [公式](/papers/dpa3/formulas), [架构](/papers/dpa3/architecture) |
| Equations 17-20 | 19 | Atom, distance, angle, dihedral initialization | [公式](/papers/dpa3/formulas), [架构](/papers/dpa3/architecture) |
| Equation S1 | 22 | SiLUT | [公式](/papers/dpa3/formulas), [Scaling](/papers/dpa3/scaling) |
| Equations S2-S5 | 29 | Add 与 LayerNorm ablations | [公式](/papers/dpa3/formulas), [Scaling](/papers/dpa3/scaling) |

## 源码审读注记

- v3 active text 的 scaling experiment 使用 OMat24 IsoFLOP. TeX 中仍保留被注释的旧 MPtrj/WBM scaling 拟合, 本站不将注释内容当作 v3 结果.
- Figure 4 图内给出 3 个 power-law exponents, 正文未逐项抄写, 本站从最终 v3 figure 恢复这些数值.
- Equation 9 在 $r_c$ 内支为极小非零值, 外支为 0, 因而严格 smoothness 与公式不完全一致.
- Equation 3 说明 encoding 通常为 one-hot, 所以参数规模严格 independent of dataset count 的表述需要降格.
- Figure 5 的 DPA-3.1-3M overall energy/force 最低, 但 virial 最低的是 SevenNet-MF-ompa.
- Table S-7 属于 non-compliant Matbench comparison, 不能与主文 Table 1 的 compliant ranking 混为一张榜单.
- Table S-11 的 `Seperate fitting networks` 为原文拼写, 本站正文统一写作 `Separate fitting networks`.
