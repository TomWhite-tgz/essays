---
title: eSEN 原文定位索引
description: eSEN PMLR 终稿的章节, 公式, 图表, 附录与精读页面映射.
---

# eSEN 原文定位索引

本索引以 19 页 PMLR 终稿确定页码和最终编号, 以 arXiv:2502.12147v2 TeX source 恢复公式, 表格和原始图件. PMLR 终稿正文为第 1-10 页, References 延续至第 13 页, Appendix 从第 14 页开始.

## 正文章节覆盖

| 原文章节 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Abstract, Section 1 | 1-2 | 问题, 贡献与 Figure 1 | [总览](/papers/esen/), [问题](/papers/esen/problem) |
| Section 2 | 2 | MLIP 与四类物性任务 | [问题](/papers/esen/problem) |
| Section 3 | 2-3 | Conservative forces 与 derivative bounds | [理论](/papers/esen/theory) |
| Section 4 | 3-4 | eSEN architecture | [模型](/papers/esen/model) |
| Section 5 | 4-6 | 设计选择, 守恒测试与消融 | [平滑性](/papers/esen/smoothness) |
| Section 6.1 | 6-7 | Matbench Discovery 与热导率 | [材料证据](/papers/esen/materials) |
| Section 6.2 | 7-9 | MDR Phonon | [声子](/papers/esen/phonons) |
| Sections 6.3-6.4 | 8-9 | SPICE 与代理指标 | [批判](/papers/esen/critique), [材料证据](/papers/esen/materials) |
| Sections 7-8 | 9-10 | Related works 与 Discussion | [批判](/papers/esen/critique) |

## 编号公式

| 公式 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Equation 1 | 3 | 闭合路径做功为 0 | [理论](/papers/esen/theory) |
| Equation 2 | 3 | Verlet 长时能量漂移界 | [理论](/papers/esen/theory) |

终稿只有 2 个编号公式, 已全部逐式解释. 本站为解释 test error 与高阶导数的脱钩, 逐原子能量求和和有限差分噪声另写了未编号推导, 不冒充原文公式.

## 正文图表

| 图表 | PDF 页码 | 证据角色 | 精读页面 |
| --- | ---: | --- | --- |
| Figure 1 | 2 | 守恒筛选与物性相关性总览 | [总览](/papers/esen/) |
| Figure 2 | 3 | eSEN 与 edgewise convolution | [模型](/papers/esen/model) |
| Figure 3 | 4 | 直接力预训练和保守微调 | [模型](/papers/esen/model) |
| Figure 4 | 5 | TM23 与 MD22 守恒消融 | [平滑性](/papers/esen/smoothness) |
| Table 1 | 6 | 设计变体的静态测试误差 | [平滑性](/papers/esen/smoothness) |
| Tables 2-3 | 7 | Matbench compliant/non-compliant | [材料证据](/papers/esen/materials) |
| Figure 5 | 8 | eSEN 声子带的位移收敛 | [声子](/papers/esen/phonons) |
| Table 4 | 7 | MDR Phonon 四项 MAE | [声子](/papers/esen/phonons) |
| Table 5 | 8 | SPICE-MACE-OFF splits | [批判](/papers/esen/critique) |
| Figure 6 | 8 | eSEN 变体的误差相关性 | [材料证据](/papers/esen/materials) |

## Appendix 覆盖

| 附录部分 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| A.1 | 14 | TM23 与 MD22 NVE protocol | [问题](/papers/esen/problem), [平滑性](/papers/esen/smoothness) |
| A.2 | 14 | Phono3py 与 Phonopy protocol | [声子](/papers/esen/phonons) |
| A.3 | 14 | 5000 sAlex test samples | [材料证据](/papers/esen/materials) |
| Appendix B, Figures B.7-B.9 | 14-16 | phonon correlation 与 displacement | [声子](/papers/esen/phonons) |
| Figure B.10, Appendix C | 16 | inference efficiency | [批判](/papers/esen/critique) |
| Figures C.11-C.14 | 18-19 | eqV2 与 direct eSEN phonon bands | [声子](/papers/esen/phonons) |
| Appendix D, Table 6 | 17-19 | 全部训练 hyperparameters | [模型](/papers/esen/model) |

## 版本与源码注记

- arXiv v2 日期为 2025-04-23, PMLR 终稿发表于 ICML 2025.
- arXiv source 已包含主文和 Appendix, 原始文件共有 14 个 figure PDFs.
- 源码中 Table 4 同时出现了两个 `label`, 不影响终稿数值, 本站按 PMLR 的 Table 4 定位.
- 源码将 Figure 2 caption 中的 back-propagation 拼作 `back-propagration`, 本站不沿用该拼写错误.
- 论文代码链接指向 FAIR-Chem 单仓库, 不是一个只包含 eSEN 的冻结复现实验包.
