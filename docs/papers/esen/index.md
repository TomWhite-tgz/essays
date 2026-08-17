---
title: eSEN 精读总览
description: 平滑且富表达力的原子间势, 能量守恒测试与物性预测证据链.
---

# eSEN 精读总览

## 我们读的是哪个版本

本组页面精读 *Learning Smooth and Expressive Interatomic Potentials for Physical Property Prediction*. 作者为 Xiang Fu 等, 论文发表于 ICML 2025, PMLR 267:17875-17893. 数学结构与原始图件取自 arXiv:2502.12147v2 的 TeX 源码, 页码与最终编号按 19 页 PMLR 终稿核对.

## 论文真正问了什么

这篇论文不只是提出一个新 MLIP. 它先挑战一种常见评估逻辑:

> 静态测试集上的 energy/force MAE 更低, 是否就意味着结构弛豫, 热导率和声子预测更可靠?

作者的答案是: 不一定. 测试误差只观察有限个构型上的函数值与一阶导数, 而真实工作流会反复调用模型, 甚至依赖 PES 的二阶和三阶导数. 一个模型可以在测试集上很准, 同时具有不连续, 高频振荡或非保守的力场.

论文提出一个中间门槛: 在预先固定的 OOD NVE 模拟协议下检查能量守恒. 通过该测试的模型中, 测试集 energy MAE 与下游物性误差呈现更稳定的相关性. eSEN 则把这个诊断结论转化为模型设计.

![论文总览图](/images/esen/teaser.png)

图 1 把证据链压缩成四格. 直接力模型 Orb, eqV2 和 CHGNet 在 NVE 中漂移. 只看 energy MAE 时, 全部模型与下游指标的关系混乱; 先筛出实际守恒模型后, Matbench Discovery F1, 热导率误差和振动熵误差才更一致地随 energy MAE 改善.

## 一句话理解 eSEN

eSEN 是一个从标量总能量反向求力的等变消息传递网络. 它不用离散球面网格执行非线性, 不限制最大邻居数, 在截断处使用 envelope, 并限制径向基的高频容量, 从而同时追求表达力, 严格等变和光滑 PES.

## 逐章阅读路线

1. [从静态误差到物性要求](/papers/esen/problem), 区分函数值, 一阶导数和高阶导数任务.
2. [守恒力与能量漂移界](/papers/esen/theory), 逐式解释 Equation 1-2.
3. [eSEN 架构与训练策略](/papers/esen/model), 解读 Figure 2, 直接力预训练和保守微调.
4. [三类平滑性设计与消融](/papers/esen/smoothness), 解读 Figures 3-4 与 Table 1.
5. [材料稳定性与热导率证据](/papers/esen/materials), 解读 Tables 2-3.
6. [声子, 位移与假性改善](/papers/esen/phonons), 解读 Figure 5, Table 4 和附录图.
7. [分子测试误差, 效率与批判](/papers/esen/critique), 解读 Table 5, Figure 6 与证据边界.
8. [原文定位索引](/papers/esen/source-map), 汇总章节, 公式, 图表与附录.

## 先记住 5 个边界

第一, 保守力是实际能量守恒的必要条件, 不是充分条件. PES 不够光滑时, 有限步长积分仍会漂移. 第二, NVE 测试是给定体系, 初态, 温度, 时长, 积分器和步长下的经验测试, 不是全构型空间证明. 第三, 论文展示的是筛选后的相关性增强, 不是证明 energy MAE 因果决定物性误差. 第四, non-compliant 榜允许不同训练数据, 只能评价系统级结果, 不能把差异全归因于架构. 第五, 声子热力学标量可因 DOS 积分而掩盖色散错误, 指标好不等于每条声子支正确.

## 关键结果

| 设置 | eSEN 结果 | 应如何理解 |
| --- | ---: | --- |
| Matbench compliant F1 | 0.831 | 同为 MPTrj 训练条件下最高 |
| Matbench compliant $\kappa_{\mathrm{SRME}}$ | 0.340 | 同时兼顾稳定性与热导率 |
| Matbench non-compliant F1 | 0.925 | 训练数据扩大后的系统结果 |
| MDR phonon compliant MAE($S$) | 13 J/K/mol | 优于表中其他 compliant 模型 |
| 直接力预训练加保守微调 | 训练墙钟时间降低 40% | 保留训练效率, 最终恢复保守力 |

## 原始资料

- [arXiv:2502.12147v2](https://arxiv.org/abs/2502.12147).
- [PMLR 终稿与 BibTeX](https://proceedings.mlr.press/v267/fu25h.html).
- [OpenReview 记录](https://openreview.net/forum?id=R0PBjxIbgm).
- [FAIR-Chem 代码库](https://github.com/facebookresearch/fairchem).

