---
title: MatterSim 原文定位索引
description: 讲解结论与 arXiv v2 主文, 补充材料图表和公式的对应关系.
---

# MatterSim 原文定位索引

本站使用的论文版本是 `arXiv:2405.04967v2`. 主文和补充材料在同一个 86 页 PDF 中. TeX 源码中的补充材料重新从 Section 1, Figure 1 和 Table 1 编号, 因而下面显式标注 "主文" 或 "补充材料".

## 核心主张映射

| 讲解主题 | 原文位置 | 主要证据 |
| --- | --- | --- |
| 问题定义与 1700 万构型 | 主文 Introduction, Results 2.1 | 主文图 1, 图 2 |
| 主动学习数据闭环 | 主文 Results 2.1 | 主文图 2a, 补充材料 Section 2, 3, 5 |
| M3GNet 与 Graphormer | 主文 Results 2.1 | 补充材料 Section 1, 图 S2 至 S6 |
| 有限温压 benchmark | 主文 Results 2.2 | 补充材料 Section 6, 表 S1 |
| Matbench Discovery | 主文 Results 2.2 | 补充材料 Section 7, 表 S2 |
| 随机结构搜索 | 主文 Results 2.2 | 主文图 3, 补充材料 Section 8 |
| 声子 | 主文 Results 2.2 | 主文图 4a 至 4b, 补充材料 Section 9 |
| 体模量与高压焓 | 主文 Results 2.2 | 主文图 4c 至 4d, 补充材料 Section 10 |
| 自由能与相图 | 主文 Results 2.2 | 主文图 4e 至 4f, 补充材料 Section 11 |
| 高温高压 MD | 主文 Results 2.2 | 主文图 5, 补充材料 Section 12 |
| 主动学习专用体系 | 主文 Results 2.3 | 主文图 6a 至 6b, 补充材料 Section 13 |
| 液态水跨理论微调 | 主文 Results 2.4 | 主文图 6c 至 6d, 补充材料 Section 14 |
| 结构到性质预测 | 主文 Results 2.5 | 主文表 1, 补充材料 Section 15 |
| 作者声明的局限 | 主文 Discussion | Discussion 最后一段 |

## 关键数字来源

| 数字 | 来源 |
| --- | --- |
| 前 89 种元素, 0 至 5000 K, 0 至 1000 GPa | 主文 Results 2.2 第一段 |
| 约 1700 万 DFT 标注结构 | 主文 Results 2.1, 补充材料 Section 2 |
| MPF-TP 能量 MAE 36 meV/atom | 主文 Introduction, 补充材料表 S1 |
| Matbench Discovery F1 0.83 | 主文 Results 2.2, 补充材料表 S2 |
| RSS 约 8000 万候选 | 主文 Results 2.2 Materials Discovery |
| 1974 个不在 Alexandria-MP-ICSD 中的联合凸包结构 | 主文 Results 2.2, 图 3 |
| 最大声子频率 MAE 0.87 THz | 主文 Results 2.2 Phonons, 补充材料 Section 9 |
| 0 K 体模量 MAE 2.47 GPa | 主文 Results 2.2 Mechanical Properties |
| 自由能相对实验 MAE 15 meV/atom | 摘要, 主文 Results 2.2 Free Energy |
| MgO 300 K B1-B2 转变压力 584 GPa | 主文 Results 2.2 Free Energy |
| 液态水只使用 30 个高层级构型 | 主文 Results 2.4, 补充材料 Section 14 |
| finetune-30 扩散系数 $1.862\times10^{-5}$ cm²/s | 主文 Results 2.4, 补充材料表 S4 |

## 模型公式来源

| 公式 | 原文位置 |
| --- | --- |
| M3GNet 三体边更新 | 补充材料 Section 1.2, 第 1 个展示公式 |
| Graphormer attention bias | 补充材料 Section 1.3, Eqs. 2 至 4 |
| 等变 decoder 初始化 | 补充材料 Section 1.3, Eq. 5 |
| Graphormer 应力头 | 补充材料 Section 1.3, Eq. 7 |
| 能量, 力和应力损失 | 补充材料 Section 1.4, Eq. 8 |
| QHA 自由能与体模量 | 补充材料 Section 10.1 |
| Einstein 扩散关系与有限尺寸修正 | 补充材料 Section 14.4, Eqs. S1 至 S2 |

## 外部入口

- [arXiv 论文页面](https://arxiv.org/abs/2405.04967).
- [MatterSim 官方代码](https://github.com/microsoft/mattersim).
- [Microsoft Research 项目介绍](https://www.microsoft.com/en-us/research/blog/mattersim-a-deep-learning-model-for-materials-under-real-world-conditions/).

::: info 版本说明
网页中的判断针对论文 v2 及其随附源码. 官方代码和 checkpoint 可能继续变化. 复现实验时应以具体版本为准.
:::
