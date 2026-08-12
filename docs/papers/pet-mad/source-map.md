---
title: PET-MAD 原文定位索引
description: arXiv:2503.14118v2 的主文, 补充材料, 公式, 图表与精读页面映射.
---

# PET-MAD 原文定位索引

本索引以 29 页 arXiv:2503.14118v2 PDF 确定页码和编号, 以官方 `text.tex` 恢复数学结构. 主文为第 1-10 页, References 为第 11-16 页, Supplementary Information 为第 17-29 页.

## 主文章节

| 原文章节 | PDF 页码 | 精读页面 |
| --- | ---: | --- |
| Abstract, Introduction | 1-2 | [总览](/papers/pet-mad/) |
| Results A-B | 2-4 | [数据](/papers/pet-mad/data), [模型](/papers/pet-mad/model) |
| Results C | 4-6 | [Benchmarks](/papers/pet-mad/benchmarks) |
| Results D-E | 7-8 | [输运与熔点](/papers/pet-mad/transport-melting), [不确定性](/papers/pet-mad/uncertainty) |
| Results F-G | 8-9 | [合金与水](/papers/pet-mad/alloy-water) |
| Results H-I | 9-10 | [NMR 与 BTO](/papers/pet-mad/nmr-bto) |
| Discussion | 10 | [局限](/papers/pet-mad/critique) |
| Methods | 10 | [数据](/papers/pet-mad/data), [模型](/papers/pet-mad/model) |

## 主文图表

| 图表 | PDF 页码 | 精读页面 |
| --- | ---: | --- |
| Figure 1, Table I | 4-5 | [Benchmarks](/papers/pet-mad/benchmarks) |
| Figures 2-3 | 6 | [Benchmarks](/papers/pet-mad/benchmarks) |
| Figures 4-5 | 7 | [输运与熔点](/papers/pet-mad/transport-melting) |
| Figures 6-7 | 8-9 | [合金与水](/papers/pet-mad/alloy-water) |
| Figures 8-9 | 9-10 | [NMR 与 BTO](/papers/pet-mad/nmr-bto) |

## Supplementary sections 与图表

| SI 内容 | PDF 页码 | 图表 | 精读页面 |
| --- | ---: | --- | --- |
| Hyperparameter optimization | 17 | Figure S1 | [模型](/papers/pet-mad/model) |
| Benchmark subset selection, Matbench consistency | 17-18 | Figure S2 | [Benchmarks](/papers/pet-mad/benchmarks) |
| DFT cutoff convergence, dimers | 19-20 | Figures S3-S4 | [数据](/papers/pet-mad/data), [局限](/papers/pet-mad/critique) |
| Geometry optimization | 20-21 | Figure S5 | [Benchmarks](/papers/pet-mad/benchmarks) |
| LLPR calibration | 21-22 | Figure S6, Equation 1 | [不确定性](/papers/pet-mad/uncertainty) |
| Phonon uncertainty | 22-23 | Figure S7 | [不确定性](/papers/pet-mad/uncertainty) |
| Fine-tuning accuracy | 21 | Table II | [Fine-tuning](/papers/pet-mad/finetuning) |
| Learning curves | 23-26 | Figures S8-S15 | [Fine-tuning](/papers/pet-mad/finetuning) |
| Simulation protocols | 26-28 | Equations 2-11 | [公式](/papers/pet-mad/formulas) 与各案例页 |
| Non-conservative MD | 28-29 | Figures S16-S17 | [Direct force](/papers/pet-mad/direct-force) |

## Equation 1-11

| Equations | 内容 | 精读页面 |
| --- | --- | --- |
| 1 | LLPR predictive variance | [不确定性](/papers/pet-mad/uncertainty) |
| 2-3 | Green-Kubo conductivity 与 charge flux | [输运与熔点](/papers/pet-mad/transport-melting) |
| 4-5 | Interface-pinning bias 与 chemical potential | [输运与熔点](/papers/pet-mad/transport-melting) |
| 6 | Gibbs surface excess | [合金与水](/papers/pet-mad/alloy-water) |
| 7 | PIMD ring-polymer potential | [合金与水](/papers/pet-mad/alloy-water) |
| 8 | BTO phase chemical potential | [NMR 与 BTO](/papers/pet-mad/nmr-bto) |
| 9-11 | Dielectric tensor 与 projections | [NMR 与 BTO](/papers/pet-mad/nmr-bto) |

全部公式还集中收录于 [公式页](/papers/pet-mad/formulas).

## 源码审读注记

- Equation 7 的 harmonic spring term 未显式写对 bead index $j$ 的求和, 但正文说明为全部 adjacent replicas.
- Equation 11 使用 perpendicular projector contraction, 未除以 perpendicular subspace dimension 2. 若目标是单一垂直方向平均, normalization 需要进一步说明.
- Table I 的 MAD error 为 17.6/65.1, Supplementary Table II text 对 base PET-MAD 报告 15.1/72.3, Methods validation 为 14.7/72.2. 它们可能来自不同 split/context, source 未明确解释.
- Results 将 MC3D random-composition 简写为 `MC3D-randcomp`, dataset list 使用 `MC3D-random`. 本站视为同一子集.
- HEA 正文说 recomputed subset 约 2000, SI 给出的分层抽样数相加为 2000, 但 learning-curve 文字写 1975 structures. 这可能来自实际收敛/过滤后的数量.
- 数据可用性段使用 future tense 表示 model/data 将于 publication 发布, 同时提供 GitHub repository. 本站只链接公开入口, 不把 future promise 当作已验证 archive snapshot.
