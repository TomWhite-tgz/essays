---
title: 原文定位与数据来源
description: 精读内容与论文页码, 图表, 公式和公开仓库的对应关系.
---

# 原文定位与数据来源

## 主文定位

| 精读主题 | 原文位置 | 关键内容 |
| --- | --- | --- |
| 研究问题 | 摘要, 第 1 节 | 通用生成模型能否用于特定 LIB 发现任务 |
| 总工作流 | 第 2.1 节, Scheme 1, Figure 1 | MatterGen, MatterSim, S.U.N., DFT 和 OCV |
| 数量漏斗 | 第 2.2 节, Figure 2, Figure 3 | 32,600, 27,227, 12,550, 817, 804, 425, 91 |
| 元素分布 | 第 2.3 节, Figure 4, Figure 5 | 生成分布较窄, 高频元素偏置 |
| SOAP 与 t-SNE | 第 2.3 节, Figure 6, Figure 7 | Li 结构的局部环境分布 |
| 十个候选 | 第 2.3 节, Table 1, Figure 8 | 电压, 容量, 结构与材料讨论 |
| 声子筛选 | 第 2.3 节 | 31 个状态, 16 个初始虚频, 6 个未解决状态 |
| MatterSim 与 DFT 总能 | Supporting Information, Figure S1 | 总能 parity 与离群点 |
| 元素分布基线 | Supporting Information, Figure S2, Figure S3 | MP, 训练集与过滤后生成集 |
| 负凸包能条目 | Supporting Information, Table S1 | 36 个结构条目, 35 个不同化学式 |
| 晶体表示 | Experimental Section, 式 (1) | $M=(A,X,L)$ |
| 电压与容量 | DFT Methods, 式 (2) 至式 (5) | $\Delta G$, $\Delta E$, DFT 能量和比容量 |
| 计算设置 | DFT Methods | VASP, PAW, PBE, 550 eV, KSPACING 0.15 |

## 原始资料

- [论文 DOI 页面](https://doi.org/10.1002/batt.202500309).
- [DTU Research Database 论文记录](https://orbit.dtu.dk/en/publications/mining-chemical-space-with-generative-models-for-battery-material/).
- [作者公开数据与 notebook](https://github.com/chiku-parida/genAI4LIBs).
- [ChemRxiv v2 预印本](https://doi.org/10.26434/chemrxiv-2025-q48jr-v2).
- 本站分析基于用户保存的 10 页出版版 PDF.

## 公开仓库审计范围

本次精读检查的仓库版本为 commit `9a338c9993223bf5ae60a97a763e84b47abbedaa`. 主要文件包括:

- `data/30kmetrics.json`: 生成集合的聚合评价指标.
- `data/gen_structures.extxyz`: 生成结构.
- `data/li_gen_Structure_eval_final.db`: 最终 Li 结构的 ASE 数据库.
- `scripts/analysis_evaluation.ipynb`: 能量与评价统计.
- `scripts/Chemiscope_html.ipynb`: SOAP 与交互可视化.
- `scripts/chemiscope_plot.ipynb`: SOAP t-SNE 静态图.

作者在 ChemRxiv v2 元数据中公开了 `Supporting Information.docx`, 版本日期为 2025-08-28, 描述为 `additional analysis and phases`. 本站已直接核对其中 Figure S1 至 Figure S3 和 Table S1. Wiley 出版版列出的附件名为 `batt70075-sup-0001-SuppData-S1.pdf`, 但出版商页面拒绝自动下载. 本站使用作者官方 ChemRxiv v2 附件, 并将其与出版主文逐项交叉核对.

补充材料确认而没有消除两处主文矛盾: 概述称 3 种材料未通过动力学稳定性检查, 详细结果列出 4 个材料家族; 表 1 写 $\mathrm{Li_2TiV_2CrO_8}$, Table S1 与公开数据库写 $\mathrm{Li_2TiV_2CrO_9}$. 详细证据见 [补充材料与公开数据审计](./supplementary).

## 数字口径说明

论文有时把样本数近似写为 32,000, 图文的精确生成数是 32,600. 本站计算阶段比例时使用 32,600.

论文主文的 S.U.N. 数量为 12,550, 对应 $38.50\%$. 公开 JSON 的 `frac_novel_unique_stable_structures` 为 0.382546. 两个来源存在小差异, 本站分别保留, 不以其中一个覆盖另一个.

## 图像说明

本站使用的 workflow, screening, element distribution, chemical space 和 candidates 图均从用户保存的论文 PDF 中提取. 图片版权与许可遵循原论文标注的 CC BY-NC-ND 许可, 图下注明原始图号, 本站未对图中科学内容作改绘.
