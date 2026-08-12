---
title: 原子模拟基础模型 Perspective 原文定位索引
description: arXiv:2503.10538v3 的章节, 图表, 数据表, 版本与源码问题映射.
---

# 原子模拟基础模型 Perspective 原文定位索引

本索引以 36 页 arXiv:2503.10538v3 PDF 确定页码, 以官方 `Main.tex` 恢复结构和 Table 1. 主体论述位于 PDF 第 1-18 页, References 为第 19-34 页, 尾部声明和 graphical abstract 为第 35 页, short summary 为第 36 页.

## 章节覆盖

| 原文章节 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Abstract, Section 1 | 1-3 | 科学动机, FM 愿景与全文范围 | [总览](/papers/fm-atomistic/) |
| Section 2 | 3-4 | Scaling, pre-training, emergence 与 FM 定义 | [资格判据](/papers/fm-atomistic/definition) |
| Section 3.1 前半 | 4-6 | 架构谱系, atomic density, ACE 与 GNN | [架构](/papers/fm-atomistic/architecture) |
| Section 3.1 中段 | 5-6 | Bitter lesson, equivariance 与 conservation | [归纳偏置](/papers/fm-atomistic/inductive-bias) |
| Section 3.1 后半 | 6-8 | Softening, long range, MD stability 与 scaling | [失效模式](/papers/fm-atomistic/failure-modes) |
| Section 3.2 前半 | 8-10 | Table 1, 元素, charge/spin 与采样 | [数据版图](/papers/fm-atomistic/datasets) |
| Section 3.2 后半 | 10-13 | Figure 2, theory/basis/protocol error 与 fine-tuning | [数据质量](/papers/fm-atomistic/data-quality) |
| Section 3.3 | 13-15 | Self-supervision, multi-fidelity, distillation 与实验 | [训练](/papers/fm-atomistic/training) |
| Section 3.4 | 15-16 | Leaderboards, uncertainty 与 FM testing | [评测](/papers/fm-atomistic/evaluation) |
| Section 3.5 | 16-17 | EScAIP, Uni-Mol2, OMol25 与 UMA | [前沿](/papers/fm-atomistic/frontier) |
| Section 4 | 17-18 | Future directions, openness, compute 与 ethics | [前沿](/papers/fm-atomistic/frontier), [评测](/papers/fm-atomistic/evaluation) |
| Sections 5-9 | 35-36 | 声明, graphical abstract 与 short summary | [总览](/papers/fm-atomistic/) |

## 公式覆盖

原文没有编号或展示公式. 本站为明确论证补写了 scaling law, fine-tuning sample efficiency, size consistency, curl-free condition 与 foundation gain 等解释性公式. 它们均未标成论文公式.

原文在正文中出现的数学量包括 Figure 1 的 $f_{\mathrm{MLIP}}/f_{\mathrm{DFT}}$, force ranges, 数据规模, cutoff 和 error thresholds, 均已在相应页面解释.

## 图表覆盖

| 图表 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Figure 1 | 7 | Softening, long range 与 MD instability | [失效模式](/papers/fm-atomistic/failure-modes) |
| Table 1 | 8-9 | 18 个 labeled datasets 与 2 个 unlabeled dataset families | [数据版图](/papers/fm-atomistic/datasets) |
| Figure 2 | 10 | 10 类高优先级数据缺口 | [数据质量](/papers/fm-atomistic/data-quality) |
| Figure 3 | 14 | Foundation teacher 到 specialized students | [训练](/papers/fm-atomistic/training) |
| Graphical abstract | 35 | MLIP FM 的规模化概念图 | [总览](/papers/fm-atomistic/) |

## Table 1 数据集清单

Molecular labeled datasets 为 OMol25, QCML, AIMNet2, $\nabla^2$DFT, Transition-1x, ANI-1x/ANI-2x, QM7-X, SPF, GEMS 和 SPICE/SPICE2. Materials datasets 为 OC20, OMat24, ODAC23, Alexandria, OC22 和 MPtrj. Unsupervised 部分为 Zinc20/Zinc22 与 Uni-Mol/Uni-Mol2.

表注的门槛是 energy/force labeled 3D structures 超过 1M, 或无此类标签的 3D structures 超过 100M.

## v3 源码审读注记

- Table 1 将 OMol25 method 写为 `$\omega$B97M-D3/def2-TZVPD`, Section 3.5 写为 `$\omega$B97M-V/def2-TZVPD`. OMol25 的官方方法是后者.
- Figure 2 caption 用 a-j 对应 10 项 data gaps. 随后的正文把 long range 写作 Figure 2g, interfaces 写作 h/j, defects 写作 i, rich quantum information 写作 k, 与 caption 不一致.
- Section 3.4 `Criteria for a Successful Foundation Model` 与 Section 3.5 `Toward Foundation Models in Chemistry and Materials` 都使用 `\label{subsec:eval}`. PDF 标题不受影响, 但源码交叉引用目标不唯一.
- Figure 1 caption 中 Ref. 60 后与 `(b)` 之间缺空格. 本站按子图语义解读.
- `Graphical abstract` 的 section 命令后多出句点, 图本身没有 caption 或编号.
- Figure 2 图注的内容名称与拼图本身是可靠定位方式, 不应依赖错位的正文子图字母.

## 版本边界

v3 日期为 2025-06-24, 已纳入 OMol25 与 UMA. 本站对 "当前模型" 的讨论只复述 v3 截止点, 不将 2025-06-24 之后的新模型倒灌进原文结论. 后续若论文再更新, 应重新审计 Table 1, Section 3.5 与 references, 而不是静默覆盖本版本页面.

