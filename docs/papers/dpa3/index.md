---
title: DPA3 精读总览
description: 以 LiGS, 深层残差消息传递, scaling law 与 dataset encoding 面向 large atomistic model.
---

# DPA3 精读总览

## 版本与对象

本组页面精读 *A Graph Neural Network for the Era of Large Atomistic Models*, arXiv:2506.01686v3. v3 修订于 2026-01-23, PDF 共 36 页. 主文与 Methods 位于第 1-20 页, Supplementary Information 位于第 21-30 页, References 位于第 31-36 页.

本站以 v3 PDF 确定最终页码和编号, 以官方 TeX source 恢复公式与表格. 原文包含 Figures 1-6, Table 1, Supplementary Figures S-1-S-3, Supplementary Tables S-1-S-11, Equations 1-20 与 Supplementary Equations S1-S5.

## 论文真正改变了什么

DPA3 试图同时解决 large atomistic model (LAM) 的 3 个扩展瓶颈:

- 用 line graph series (LiGS) 把原子, 键, 角和更高阶局部几何写成递归图对象.
- 用可训练残差步长与有界尾部的 SiLUT 激活堆叠更深网络, 避免深层 GNN 的数值爆炸或误差饱和.
- 用 dataset encoding 取代每个数据集一个完整 fitting head, 降低多任务模型随任务数增长的参数开销.

![DPA3 模型总图](/images/dpa3/fig1.png)

作者随后给出两类证据. 第一类是 problem-oriented MLIP, 比较 SPICE-MACE-OFF, TorsionNet-500, 水和冰, 3 类材料数据, DPA2 test sets 与 Matbench Discovery. 第二类是预训练 LAM, 在 OpenLAM-v1 的 31 个数据集上训练 DPA-3.1-3M, 再对 12 个下游数据集做 zero-shot 评测.

## 一句话理解

DPA3 不是把等变张量做得更高阶, 而是把高阶局部关系显式变成 LiGS 上的 invariant feature, 再用深层 residual message passing 扩大模型容量.

## 关键规模

- 默认 LiGS 截断阶数为 $K=2$, 即显式处理原子图与其 line graph.
- DPA3-L3 到 DPA3-L24 约有 0.9M 到 4.9M 参数.
- DPA-3.1-3M 使用 $L=16$, 约 3.26M 参数.
- OpenLAM-v1 包含 31 个 DFT 设置不一致的数据集.
- 预训练使用 128 张 GPU, 共 4M steps.
- Zero-shot 测试包含 catalysis, inorganic materials 与 molecules 3 个领域, 共 12 个数据集, 每个最多抽样 1000 帧.

## 阅读路线

1. [LAM 问题与设计目标](/papers/dpa3/problem).
2. [Line graph series](/papers/dpa3/ligs).
3. [消息传递与原子能模型](/papers/dpa3/architecture).
4. [守恒性, 对称性与 smoothness](/papers/dpa3/physics).
5. [Problem-oriented benchmarks](/papers/dpa3/benchmarks).
6. [Scaling law 与架构消融](/papers/dpa3/scaling).
7. [DPA-3.1-3M 与 zero-shot 证据](/papers/dpa3/lam).
8. [Dataset encoding 与 fine-tuning](/papers/dpa3/multitask).
9. [推理效率与成本](/papers/dpa3/efficiency).
10. [全部编号公式](/papers/dpa3/formulas).
11. [局限与审读结论](/papers/dpa3/critique).
12. [原文定位索引](/papers/dpa3/source-map).

## 先记住 6 个边界

第一, v3 的 scaling law 来自 OMat24 validation energy MAE 的 IsoFLOP 最优前沿, 不是 31 数据集预训练后的 zero-shot scaling law. 第二, 论文比较的 LAM 训练域并不相同, DPA-3.1-3M 在 catalysis 与 molecules 上拥有更直接的训练域覆盖. 第三, OMat encoding 与两套 PBE relabeling 属于测试协议的一部分, 不是完全不使用 domain knowledge 的部署. 第四, dataset encoding 显著减少参数, 但 one-hot 输入和 per-dataset energy bias 仍会随数据集数量增长, 因而严格的参数完全独立主张过强. 第五, 论文所写 switch function 在有限 cutoff 处只达到数值上极小, 并非数学上精确为零. 第六, zero-shot 静态 RMSE 与 property error 的相关性不能替代长时间稳定性和任务专用验证.

## 原始资料

- [arXiv:2506.01686v3](https://arxiv.org/abs/2506.01686v3).
- [DeePMD-kit](https://github.com/deepmodeling/deepmd-kit).
- [OpenLAM-v1 data card](https://www.aissquare.com/datasets/detail?pageType=datasets&name=OpenLAM-TrainingSet&id=308).
- [DPA-3.1-3M model](https://www.aissquare.com/models/detail?pageType=models&name=DPA-3.1-3M&id=343).
