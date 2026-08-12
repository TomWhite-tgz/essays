---
title: DPA-2 精读总览
description: DPA-2 大原子模型的多任务预训练, 模型结构, 迁移, 蒸馏与证据边界.
---

# DPA-2 精读总览

## 我们读的是哪个版本

本组页面精读 *DPA-2: a large atomic model as a multi-task learner*, arXiv:2312.15492v2. 本地 PDF 共 37 页. 阅读时同时使用 v2 PDF 与 arXiv TeX 源码: PDF 负责最终页码, Equation 1-46 和图表编号, TeX 用于恢复公式结构, 数据表字段与补充材料细节.

## 论文真正改变了什么

传统 MLIP 往往把使用同一套 DFT 设置标注的数据合并, 训练一个 descriptor 与一个 energy head. 不同交换关联泛函, 基组, 赝势和数值设置定义的能量面并不完全相同, 直接混合标签会制造冲突.

DPA-2 的解决方案不是忽略这种冲突, 而是把模型拆成:

- 一个由全部任务共同更新的 unified descriptor.
- 每个 DFT 数据集独有的 fitting head 与 energy bias.

多任务训练共享环境表征, 但保留每套标签协议自己的 PES 输出. 下游先复用 descriptor 并微调, 再把昂贵 DPA-2 teacher 蒸馏成适合大规模 MD 的 DPA-1 student.

## 一句话理解 DPA-2

DPA-2 把 large atomic model 定义为可迁移的原子环境表示加一组任务特定能量头, 并用 "多任务预训练 -> 少样本微调 -> 面向应用蒸馏" 把数据复用能力与生产推理效率分开处理.

## 论文规模

- 18 个预训练数据集, 约 512 万个构型, 覆盖 73 种元素.
- 15 个下游数据集, 约 1408 万个构型, 覆盖 39 种元素.
- Shared descriptor 约 500 万参数.
- 单任务 DPA-2 约 515 万参数.
- 带 18 个 fitting heads 的多任务模型约 768 万参数.
- 蒸馏后的 DPA-1 约 53 万参数.

数据量大不等于一个同质数据集. Drug 与 OC2M 占据预训练样本的大部分, 其余任务通过人工权重提高采样概率. 这些权重也用于论文的 weighted average RMSE (WARMSE), 因而同时影响训练分布与汇总指标.

## 逐章阅读路线

1. [LAM 工作流与问题定义](/papers/dpa2/workflow), 区分多任务预训练, 微调和蒸馏.
2. [数据集与标签协议](/papers/dpa2/data), 审计 18 个预训练任务和 15 个下游任务.
3. [PES, 环境矩阵与平滑截断](/papers/dpa2/formulation), 对应 Equation 1-15.
4. [Repinit 与对称化](/papers/dpa2/repinit), 对应 Equation 16-23.
5. [Repformer 与平滑注意力](/papers/dpa2/repformer), 对应 Equation 24-36.
6. [单任务与多任务损失](/papers/dpa2/training), 对应 Equation 37-46.
7. [零样本与少样本证据](/papers/dpa2/generalization), 解读 Table 2, Tables S1-S3 和 Figures 3, S1-S2.
8. [蒸馏与物理验证](/papers/dpa2/distillation), 解读 Figure 4 与 Table S4.
9. [表征, 消融与能量守恒](/papers/dpa2/representation), 解读 Figure 5, Table S5 与 Figure S3.
10. [局限与审读结论](/papers/dpa2/critique), 审查 generalizability, 公平性和外推边界.
11. [原文定位索引](/papers/dpa2/source-map), 汇总全部公式, 章节, 图表与补充材料.

## 先记住 5 个边界

第一, multi-task model 不是跨 DFT 设置唯一无歧义的能量函数, 预测时仍需选择 head. 第二, zero-shot RMSE 低于标签标准差只是比常数基线更好, 不自动达到 MD 可用精度. 第三, t-SNE 的化学聚类是表征结构的可视化证据, 不是因果解释或严格度量. 第四, student 学习 teacher 标签, 蒸馏不能消除 teacher 的系统误差. 第五, 论文承认训练集缺少二维材料等领域, 73 元素覆盖不能等同于完整构型空间覆盖.

## 原始资料

- 本地 PDF: `MLIP/2312.15492v2.pdf`.
- 官方预印本: arXiv:2312.15492v2.
- 源码与数据快照: Zenodo DOI `10.5281/zenodo.10428497`.
- 论文代码体系: DeePMD-kit, DP-GEN 与 AIS Square.
