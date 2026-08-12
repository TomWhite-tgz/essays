---
title: UMA 原文定位索引
description: arXiv:2506.23971v2 的章节, 版本, 公式, Figures 1-9 与 Tables 1-26 映射.
---

# UMA 原文定位索引

本索引以 34 页 arXiv:2506.23971v2 PDF 确定页码和最终编号, 以官方分文件 TeX source 恢复结构. 主文为第 1-11 页, References 为第 12-16 页, Appendix contents 为第 17 页, Appendix 正文为第 18-34 页.

## 主文章节

| 原文内容 | PDF 页码 | 精读页面 |
| --- | ---: | --- |
| Abstract, Introduction | 1-2 | [总览](/papers/uma/), [数据](/papers/uma/data) |
| Approach, UMA family | 2-3 | [架构](/papers/uma/architecture) |
| Architecture, global inputs | 3-4 | [架构](/papers/uma/architecture) |
| Mixture of Linear Experts | 4-5 | [MoLE](/papers/uma/mole), [公式](/papers/uma/formulas) |
| Training Procedure, Datasets | 5-6 | [训练](/papers/uma/training), [数据](/papers/uma/data) |
| Model and Data Scaling | 6-7 | [Scaling](/papers/uma/scaling) |
| Multi-task vs Single-task | 7-8 | [MoLE](/papers/uma/mole), [Scaling](/papers/uma/scaling) |
| Inference Efficiency | 8 | [推理](/papers/uma/inference) |
| Evaluation | 8-10 | [材料](/papers/uma/materials), [催化](/papers/uma/catalysis), [分子](/papers/uma/molecules), [晶体与 MOFs](/papers/uma/crystals-mofs) |
| Related Work, Limitations, Discussion | 10-11 | [局限](/papers/uma/critique) |

## 主文图表

| 图表 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Figure 1 | 2 | 5 个数据域与 element pairs | [数据](/papers/uma/data) |
| Table 1 | 2-3 | UMA family size/speed summary | [总览](/papers/uma/), [推理](/papers/uma/inference) |
| Figure 2 | 3 | Architecture, MoLE 与 experts 消融 | [架构](/papers/uma/architecture), [MoLE](/papers/uma/mole) |
| Figure 3 | 6 | Dense/MoLE IsoFLOP scaling | [Scaling](/papers/uma/scaling) |
| Table 2 | 6 | 5 domains held-out tests | 各应用页面 |
| Figure 4 | 7 | Single/multi-task overfitting | [Scaling](/papers/uma/scaling) |
| Table 3 | 8 | H100 simulation throughput | [推理](/papers/uma/inference) |
| Table 4 | 9-10 | Scientific application benchmarks | 各应用页面 |

## Appendix A-C

| 内容 | PDF 页码 | 图表/公式 | 精读页面 |
| --- | ---: | --- | --- |
| Two-stage training 与 parallelism | 18-19 | Table 5 | [训练](/papers/uma/training) |
| Base model hyperparameters | 19-20 | Tables 6-7 | [架构](/papers/uma/architecture) |
| Training compute | 20 | Table 8 | [训练](/papers/uma/training) |
| Referencing/normalization | 20 | Unnumbered formulas | [公式](/papers/uma/formulas), [训练](/papers/uma/training) |
| UMA-S-1.2 changes | 20-21 | Tables 9-10 | [版本](/papers/uma/versions) |
| Training Data | 22-23 | Table 11 | [数据](/papers/uma/data) |
| Scaling Laws Methods | 23-24 | Equations 3-6, Table 12 | [Scaling](/papers/uma/scaling), [公式](/papers/uma/formulas) |
| Inference | 24-25 | Protocol text | [推理](/papers/uma/inference) |

## Appendix evaluation tables

| Table | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Table 13 | 25 | 旧 UMA-1/1.1 held-out summary | [版本](/papers/uma/versions) |
| Table 14 | 26 | 旧 UMA-1/1.1 application summary | [版本](/papers/uma/versions) |
| Table 15 | 26 | OMat/WBM/HEA full results | [材料](/papers/uma/materials) |
| Table 16 | 26-27 | Matbench, phonon, elasticity, NVE | [材料](/papers/uma/materials) |
| Table 17 | 27 | OC20 与 AdsorbML | [催化](/papers/uma/catalysis) |
| Table 18 | 27 | OMol25 validation | [分子](/papers/uma/molecules) |
| Table 19 | 28 | OMol25 test | [分子](/papers/uma/molecules) |
| Table 20 | 28 | OMol single-point applications | [分子](/papers/uma/molecules) |
| Table 21 | 28 | OMol optimization applications | [分子](/papers/uma/molecules) |
| Table 22 | 29 | OMC25 validation/test | [晶体与 MOFs](/papers/uma/crystals-mofs) |
| Table 23 | 29 | CSP polymorph results | [晶体与 MOFs](/papers/uma/crystals-mofs) |
| Table 24 | 29-30 | ODAC validation/test | [晶体与 MOFs](/papers/uma/crystals-mofs) |

## Appendix expert 与 diatomic

| 图表 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Figure 5 | 31 | Element-expert coefficients | [MoLE](/papers/uma/mole) |
| Figure 6 | 32 | Task-expert statistics | [MoLE](/papers/uma/mole) |
| Table 25 | 30 | eSEN/EquiformerV2 MoLE ablation | [MoLE](/papers/uma/mole) |
| Figure 7 | 33 | UMA-S-1.1 diatomics | [版本](/papers/uma/versions) |
| Figure 8 | 33 | 1.2 without diatomic data | [版本](/papers/uma/versions) |
| Figure 9 | 34 | Released 1.2 with diatomic data | [版本](/papers/uma/versions) |
| Table 26 | 33-34 | Diatomic energy/force MAE | [版本](/papers/uma/versions) |

## Equation 1-6

| Equation | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| 1 | 4 | Dense linear-expert mixture | [MoLE](/papers/uma/mole), [公式](/papers/uma/formulas) |
| 2 | 5 | Pre-merged effective weight | [MoLE](/papers/uma/mole), [公式](/papers/uma/formulas) |
| 3 | 23 | FLOP approximation | [Scaling](/papers/uma/scaling), [公式](/papers/uma/formulas) |
| 4 | 24 | Compute-optimal model/data laws | [Scaling](/papers/uma/scaling), [公式](/papers/uma/formulas) |
| 5 | 24 | Joint loss ansatz | [Scaling](/papers/uma/scaling), [公式](/papers/uma/formulas) |
| 6 | 24 | Loss vs optimal parameters | [Scaling](/papers/uma/scaling), [公式](/papers/uma/formulas) |

## 源码审读注记

- arXiv abstract 写 33 pages, 8 figures, 最终 v2 PDF 实为 34 pages, Figures 1-9.
- TeX 中旧 UMA-S/M/L rows 被注释, active main tables 使用 UMA-S-1.1, UMA-S-1.2 与 UMA-M-1.1. 本站以 active rows 为准.
- Appendix 将 base hyperparameter table 重复编译为 Tables 6-7.
- `table:hps`, `table:training_proc` 与 `tab:datasets` 存在 duplicate labels, 部分 cross-reference 会解析到后定义的 1.2 table.
- Table 12 的 MoLE $\beta=0.44$ 不在所列 10th-90th interval (0.39, 0.43) 内.
- Equations 5-6 对 $\widehat\alpha$ 同时使用 positive decay magnitude 与 negative slope 两种符号约定.
- Main text 的 UMA-L AdsorbML 与 25% improvement 来自已注释的旧 row, 不属于 active Table 4.
- Main Table 4 的 materials results 经过 MPtrj/sAlex fine-tuning, 不能归入完全 zero-shot 证据.
- 当前公开 checkpoint repository 为 gated access. UMA-1 已因 extensivity bug 被 archive, 当前 model card 另列更新的 UMA-S-1.2.1, 超出 v2 论文评测范围.
