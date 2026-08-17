---
title: DPA-2 原文定位索引
description: DPA-2 v2 的全部编号公式, 主文, 补充材料, 图表与精读页面映射.
---

# DPA-2 原文定位索引

本索引以本地 37 页 arXiv:2312.15492v2 PDF 为编号与页码权威, 以官方 TeX source 恢复数学结构. 主文到第 19 页, Supplementary Materials 从 PDF 第 20 页开始.

## 主文章节覆盖

| 原文章节 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Abstract, Section 1 | 1-4 | LAM 动机, 要求与 related work | [总览](/papers/dpa2/), [工作流](/papers/dpa2/workflow) |
| Section 2.1 | 4-5 | Pre-train, fine-tune, distill workflow | [工作流](/papers/dpa2/workflow) |
| Section 2.2 | 5-7 | Datasets 与 DPA-2 descriptor | [数据](/papers/dpa2/data) |
| Section 2.3 | 7-9 | Single-task 与 zero-shot generalization | [泛化证据](/papers/dpa2/generalization) |
| Section 2.4 | 9 | Downstream fine-tuning | [泛化证据](/papers/dpa2/generalization) |
| Section 2.5 | 9-11 | Distillation 与 application evaluation | [蒸馏](/papers/dpa2/distillation) |
| Section 2.6 | 11-12 | Learned representation | [表征](/papers/dpa2/representation) |
| Section 3 | 12-13 | Discussion 与数据缺口 | [局限](/papers/dpa2/critique) |
| Sections 4.1-4.2.1 | 13-15 | PES, descriptor 与 environment matrix | [数学基础](/papers/dpa2/formulation) |
| Sections 4.2.2-4.2.3 | 15-17 | Repinit 与 repformer | [Repinit](/papers/dpa2/repinit), [Repformer](/papers/dpa2/repformer) |
| Section 4.2.4 | 17 | Smooth softmax | [Repformer](/papers/dpa2/repformer) |
| Sections 4.3-4.5 | 17-19 | Single-task loss, multi-task loss 与 fine-tuning | [训练](/papers/dpa2/training) |
| Section 4.6 | 19 | Model distillation | [蒸馏](/papers/dpa2/distillation) |

## Equation 1-46 覆盖

| 公式 | PDF 页码 | 数学主题 | 精读页面 |
| --- | ---: | --- | --- |
| 1-3 | 13 | Atomic energy, force 与 virial | [数学基础](/papers/dpa2/formulation) |
| 4-6 | 13-14 | Descriptor, fitting net 与 energy bias | [数学基础](/papers/dpa2/formulation) |
| 7-10 | 14 | DPA-2 descriptor composition | [数学基础](/papers/dpa2/formulation) |
| 11-15 | 14-15 | Environment matrix, switch, $g_{ij}$ 与 $h_{ij}$ | [数学基础](/papers/dpa2/formulation) |
| 16-20 | 15 | Repinit 与 symmetrization | [Repinit](/papers/dpa2/repinit) |
| 21-23 | 15 | Repformer input projection | [Repinit](/papers/dpa2/repinit) |
| 24-28 | 16 | Single-atom update 与 local attention | [Repformer](/papers/dpa2/repformer) |
| 29-33 | 16 | Pair update, gated attention 与可选 equivariant update | [Repformer](/papers/dpa2/repformer) |
| 34-36 | 17 | Standard 与 smooth softmax | [Repformer](/papers/dpa2/repformer) |
| 37-41 | 17 | Single-task dataset, loss 与 prefactors | [训练](/papers/dpa2/training) |
| 42-46 | 18 | Multi-task data, heads 与 loss | [训练](/papers/dpa2/training) |

编号公式共 46 个, 已全部逐式解释. 此外, 本站补出 task-sampling probability, shared-descriptor gradient, rotation-invariance contraction 与 source-error ratio 等推导, 均明确作为解释而非论文编号公式.

## 主文图表

| 图表 | PDF 页码 | 证据角色 | 精读页面 |
| --- | ---: | --- | --- |
| Figure 1 | 4 | 预训练, 微调, 蒸馏三阶段 | [工作流](/papers/dpa2/workflow) |
| Table 1 | 6-7 | 18 个预训练和 15 个下游数据集 | [数据](/papers/dpa2/data) |
| Figure 2 | 7 | Repinit 与 repformer architecture | [数学基础](/papers/dpa2/formulation), [Repformer](/papers/dpa2/repformer) |
| Table 2 | 8 | Zero-shot generalization | [泛化证据](/papers/dpa2/generalization) |
| Figure 3 | 9 | 代表性 downstream learning curves | [泛化证据](/papers/dpa2/generalization) |
| Figure 4 | 10-11 | Distilled models 的物理验证与效率 | [蒸馏](/papers/dpa2/distillation) |
| Figure 5 | 11-12 | t-SNE representation | [表征](/papers/dpa2/representation) |

## 补充材料覆盖

| 补充章节 | PDF 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| S1 | 20-23 | 25 个 datasets 的来源与 protocol | [数据](/papers/dpa2/data) |
| S2 | 23-24 | ANI-1x 与 6 架构 single-task benchmark | [泛化证据](/papers/dpa2/generalization) |
| S3 | 24-25 | Multi-task source-task accuracy | [训练](/papers/dpa2/training), [泛化证据](/papers/dpa2/generalization) |
| S4 | 25 | 全部 downstream learning curves | [泛化证据](/papers/dpa2/generalization) |
| S5 | 25 | Fine-tuning head choices | [训练](/papers/dpa2/training) |
| S6 | 26 | Distillation accuracy | [蒸馏](/papers/dpa2/distillation) |
| S7 | 26-27 | Repformer ablation | [表征](/papers/dpa2/representation) |
| S8 | 27 | NVE energy conservation | [表征](/papers/dpa2/representation) |
| S9 | 27-28 | DPA-2 hyperparameters | [Repinit](/papers/dpa2/repinit), [训练](/papers/dpa2/training) |

## 补充图表

| 图表 | 内容 | 精读页面 |
| --- | --- | --- |
| Table S1 | ANI-1x 6 个 test sets | [泛化证据](/papers/dpa2/generalization) |
| Table S2 | 6 种 architecture 的 source-task comparison | [泛化证据](/papers/dpa2/generalization) |
| Table S3 | Single-task 与 multi-task source accuracy | [泛化证据](/papers/dpa2/generalization) |
| Figure S1 | 15 个 downstream tasks 的完整 learning curves | [泛化证据](/papers/dpa2/generalization) |
| Figure S2 | ANI-1x fitting-head choice | [训练](/papers/dpa2/training) |
| Table S4 | Teacher, student 与 full-data model | [蒸馏](/papers/dpa2/distillation) |
| Table S5 | Repformer sequential ablation | [表征](/papers/dpa2/representation) |
| Figure S3 | 100 ps NVE total-energy drift | [表征](/papers/dpa2/representation) |

## TeX 源码审读注记

- Equation 13 source 写有 `\nu^3`, 但变量定义为 $u$ 且标准 quintic switch 要求 $u^3$. 本站按 PDF 语义与多项式一致性写作 $u^3$.
- Equation 41 同时用 $\xi$ 表示 loss-prefactor 类别和 fitting-network 参数. 本站把前者重命名为 $\zeta$.
- Table S3 的 18.6 相对 14.9 增加约 $24.8\%$, 与正文 "roughly 40% higher" 不完全一致, 本站保留表中原始数字.
