---
title: Mixture of Linear Experts
description: MoLE 的数学, 预合并推理, 平滑性, 专家路由与消融证据.
---

# Mixture of Linear Experts

## 从普通 MoE 到 MoLE

普通 sparse MoE 选择少数 nonlinear experts, 分别执行后再组合. UMA 改用 dense mixture of linear experts:

$$
y=\sum_k\alpha_k W_kx,
\qquad
0\leqslant\alpha_k\leqslant1,
\qquad
\sum_k\alpha_k=1.
$$

每个 $W_k$ 是 linear operator, router 产生 softmax weights $\alpha_k$. UMA 将 SO2 convolution 中的一组 linear operations 替换为 MoLE.

## 为什么可以预合并

线性允许交换加权和与矩阵作用:

$$
\sum_k\alpha_kW_kx
=\left(\sum_k\alpha_kW_k\right)x
=W^*x.
$$

若 $\alpha_k$ 在一条 MD trajectory 中不变, $W^*$ 只需在开始前计算一次. 随后的每一步执行与相同 active architecture 的 dense model 接近, 而不需要把所有 experts 都逐次 forward.

Router 只使用 element composition, total charge, spin 与 task ID. 它明确排除 relative positions 和 neighbor features, 所以固定元素组成和全局条件的 relaxations/MD 中 $\alpha_k$ 不变.

## Total 与 active parameters

UMA-S-1.1 约有 150M total params, 但预合并后 active params 约 6M. UMA-M-1.1 约有 1.4B total, active 约 50M. Total params 决定 checkpoint storage 和训练内存, active params 更接近固定体系推理 FLOPs 与 memory traffic.

不能简单说其余参数完全无成本:

- 首次针对一个新 composition/task 需要 router 与 merge.
- Total checkpoint 必须存储或在 merge 前可访问.
- 同一 batch 若包含多种 global condition, 需要多个合并权重或退回 batched expert path.
- 训练仍需处理全部 experts, 并使用 FSDP 降低显存压力.

## 平滑性为何较容易保持

在固定元素组成, charge, spin 与 task 下, $\alpha_k$ 不随坐标改变. 坐标变化只经过原有 equivariant linear operator 与 nonlinear backbone, 不会因为 top-$K$ expert switch 造成 routing discontinuity.

Dense weights 的 convex combination 也保持各 linear equivariant maps 的 equivariance. 这是 MoLE 比 position-dependent sparse routing 更适合 PES regression 的关键理由.

但若 simulation 中改变元素组成, charge, spin 或 task, router 会改变. 论文没有要求跨这些离散条件的 energy continuity, 因为它们代表不同物理体系或不同 PES.

## Expert 数消融

Figure 2 显示 UMA-S 从 1 expert 增至 8 experts 时 validation loss 明显下降, 8 到 32 仍有较小收益, 32 到 128 几乎饱和. 初版 UMA-S/M 选择 32 experts, UMA-S-1.2 改为 64.

该图没有为 64 experts 单独展示相同协议下的 marginal gain. UMA-S-1.2 同时改变训练精度, output heads, radial bases 和数据, 因而不能把其提升单独归因于 expert 数翻倍.

## Single-task, multi-task 与 MoLE

小模型 regime 中, dense multi-task 在 5 个 task 上通常比各自 single-task model 差. 加入 MoLE 后, multi-task UMA-S 可接近或超过 small single-task baselines.

这说明共享 6M active backbone 容量不足时, task-conditioned weight mixture 能缓解 interference. 它不证明 experts 已自然分成可解释的化学模块.

## Expert 可视化

Appendix Figures 5-6 对 32 experts 统计 element-expert 与 task-expert coefficients.

![按元素统计的 expert coefficients](/images/uma/fig5.png)

![按任务统计的 expert coefficients](/images/uma/fig6.png)

OC20 与 OMat24 使用的 experts 较多重叠, OMol25 更独立, OMC25 与 ODAC 使用较少 experts. 这些是 mean routing coefficient 的描述性统计, 不能直接解释某个 expert 学会了哪种 interaction, 也不能建立 expert specialization 的因果性.

## 跨 backbone 消融

Appendix Table 25 将 8-expert MoLE 分别加入 6M eSEN 与 EquiformerV2, 在 OMol direct pretraining 8 epochs 下测相对改善. 两个 backbone 的 subset mean 都改善约 10%, biomolecules 改善 25% 与 21%.

这是 MoLE generality 的有力证据, 但只覆盖 direct-force molecular pretraining, 不包含 conservative fine-tuning, 多任务路由或长轨迹推理.
