---
title: 局限与审读结论
description: DPA3 的最强贡献, 公平性边界, scaling 证据与源码级问题.
---

# 局限与审读结论

## 最强贡献

DPA3 最有价值的地方不是单一 leaderboard 名次, 而是把 architecture scaling 与 heterogeneous-label multi-task training 放进同一设计:

1. LiGS 显式组织 bond 与 angle relation.
2. Trainable residual step 加 SiLUT 使更深模型在已测区间持续改善.
3. Dataset encoding 以较小参数开销取代完整 per-dataset heads.
4. Energy-gradient force 保留 conservative structure.

Supplementary ablation 能把 residual, activation 和 normalization 的效果分开, 这是 scaling 主张中最扎实的机制证据.

## Scaling law 的范围比标题窄

Figure 4 支持 OMat24 单 epoch validation energy MAE 在百万参数和千万级 configurations 区间遵循幂律前沿. 它没有展示:

- OpenLAM-v1 31-task zero-shot error 随参数与数据规模的曲线.
- Force, virial 或 MD stability 的 IsoFLOP scaling.
- 多次随机重复, error bar, fit uncertainty 或 held-out extrapolation.
- 更大参数区间是否出现 saturation.

因此 DPA3 是在有限区间内显示出清晰 scaling behavior 的 LAM architecture, 不是已经证明任意扩张都持续获益.

## LAM 比较存在训练域不对齐

DPA-3.1-3M 的训练数据直接跨 catalysis, inorganic materials 与 molecules. 多数 baseline 主要由 inorganic datasets 训练. Figure 5 的 overall 优势同时包含 architecture, parameterization, dataset breadth, sampling weights 与 XC alignment 的影响.

论文主动给出 domain-wise 结果并承认这一点, 是重要优点. 最公平的架构因果比较仍应在同一训练数据, label protocol, compute 与 tuning budget 下重训全部模型.

## Zero-shot 仍使用测试协议先验

作者为 ANI-1x 与 AIMD-Chig 重新做 PBE labels, 并对 multi-task models 选择 OMat encoding. 这使 reference 更一致, 但 zero-shot 的含义应限定为 no parameter update. 它不是 unknown-domain blind deployment.

每个下游数据集最多 1000 个静态 frames, 也无法暴露长轨迹中的 rare instability. 静态 RMSE 低只说明更好的起点.

## Dataset encoding 主张过强

Table S-11 确实显示 3.26M encoding model 可接近 7.69M separate-head model. 但论文所说 complexity independent of dataset count 与 one-hot 输入不完全相容. One-hot width, embedding table 或 dataset-conditioned input weights, 以及 $e_m(Z)$ 都至少有一部分随任务数增长.

应把结论改写为 parameter overhead grows much more slowly than duplicating fitting heads.

## Smoothness 的公式级缺口

Equation 9 的 cutoff 内分支在 $r=r_c$ 只达到很小的非零值, cutoff 外被设为精确 0. 以默认参数计算约为 $7.8\times10^{-7}$. 因而论文写出的函数不是严格连续的 compact-support switch.

这可能在实际 precision 中无害, 但 rigorous smoothness 需要以下之一:

- 将内支平移或归一化, 使 cutoff 处精确为零.
- 使用已知所有目标阶导数在 cutoff 消失的 envelope.
- 报告跨 cutoff 的数值 NVE stress test, 说明残余跳变小于实际容差.

## Property correlation 的因果表述

Supplementary Figure S-1 显示同一 DPA3 family 中 WBM energy MAE 与 4 个 MDR phonon-property MAE 近似线性相关. 论文将这种关系与 strict conservativeness 联系起来, 但当前实验没有 conservative/non-conservative matched control, 不能在本文内部单独识别因果.

相关性可以支持 energy MAE 是此处有用 proxy, 不能推出所有下游性质都由该误差单调决定.

## 可复现性仍缺什么

论文公开 DeePMD-kit 实现, OpenLAM-v1, pretrained model, processed datasets 与 evaluation scripts, 基础可用性较好. 但正文与 Supplementary Information 未完整给出:

- OMat24 6 档 IsoFLOP 的逐实验数值和随机种子.
- Scaling fit 的置信区间与 parabola minima uncertainty.
- SiLUT 中 $a,b$ 对每个 $t$ 的显式解.
- Loss 的完整数学式, Huber transition 与全部 multi-task sampling weights, 后者需跳转 data card.
- Zero-shot 每个随机下采样的种子敏感性.

## 最终判断

DPA3 提供了一条可信且工程上有吸引力的路线: 不依赖高阶 equivariant tensor channel, 而以 LiGS 上的 invariant message passing, 深层稳定化与 dataset conditioning 构建 LAM.

目前证据最充分支持的是 task-specific parameter efficiency, 有限区间 OMat24 scaling, 以及 OpenLAM-v1 训练后的强静态 zero-shot accuracy. 尚未充分证明的是严格 cutoff smoothness, 完全与任务数无关的参数规模, 统一控制数据后的架构优势, 以及 zero-shot checkpoint 在长期模拟中的普遍可靠性.

因此它应被视为值得扩大的 LAM backbone, 而不是已完成 universal PES 目标的终点.
