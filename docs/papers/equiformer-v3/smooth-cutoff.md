---
title: 平滑 cutoff attention
description: 解释为何 envelope 必须同时进入 softmax 分母与 value message.
---

# 平滑 cutoff attention

## 普通 graph softmax 的断点

普通 attention 为

$$
a_{ij}=\dfrac{\exp(z_{ij})}{\displaystyle\sum_{k\in\mathcal N(i)}\exp(z_{ik})},\qquad \mathbf m_{ij}=a_{ij}\mathbf v_{ij}.
$$

即使只在 message 上乘一个 cutoff envelope, 当 neighbor $k$ 跨过 $r_c$ 时, 它仍会从 softmax denominator 突然消失. 于是其他所有 $a_{ij}$ 都发生跳变. 这对 single-point MAE 未必明显, 但会污染 force derivatives 与 higher-order force constants.

## 双重 envelope

令 $e(r)$ 在 cutoff 处平滑趋于 0. V3 定义

$$
a_{ij}=\dfrac{e(r_{ij})\exp(z_{ij})}{\displaystyle\sum_{k\in\mathcal N(i)}e(r_{ik})\exp(z_{ik})},
$$

并令

$$
\mathbf m_{ij}=a_{ij}\left(e(r_{ij})\mathbf v_{ij}\right).
$$

第一个 envelope 让 softmax measure 随 neighbor 消失而连续, 第二个让 value contribution 本身也归零. 因此有效 message 含 $e(r_{ij})^2$, 不是只乘一次 envelope.

## 代码证据

公开实现的 `GraphSoftmax.forward` 接受 `exp_rescale`, 在 exponentiation 后且 aggregation denominator 前乘入 envelope. Attention path 随后再次缩放 value 或 attention output. 这与论文公式一致.

## 实验怎样解释

OC20 direct prediction 中, 加 smooth cutoff 后 energy MAE 209 到 213 meV, force MAE 18.96 到 18.82 meV/A, training time 不变. 因而论文没有证明它提升 single-point accuracy. 它的主要证据来自 Matbench Discovery: 与缺少此设计的 EquiformerV2 相比, $\kappa_{\mathrm{SRME}}$ 从 1.676 降到 0.275.

但这个跨模型差异同时包含 normalization, activation, training 与 data pipeline 改动. 更强的因果证据应是同一 gradient model 在 NVE drift, phonon, second/third-order force constants 上只切换 cutoff design.

## 数值边界

代码为 softmax denominator 加 `eps`. 当一个 node 的所有 envelopes 都接近 0 时, 这避免除零, 但也改变严格归一化. 实际 graph construction 与 cutoff neighbor policy 必须保证中心原子有合理邻域, 不能仅依靠公式解决空 neighborhood.

