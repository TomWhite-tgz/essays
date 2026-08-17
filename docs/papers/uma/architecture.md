---
title: eSEN backbone 与全局条件
description: UMA 的 equivariant message passing, charge, spin, task 输入与 conservative outputs.
---

# eSEN backbone 与全局条件

## Backbone

UMA 基于 eSEN, 使用 spherical-harmonic node embeddings 的 equivariant GNN. 每个 message-passing layer 包含:

1. Edge-wise eSCN/SO2 convolution.
2. Node-wise feed-forward block.
3. Residual connections 与 normalization.

邻居 cutoff 为 6 Å. Message passing 让多层网络的 receptive field 大于单层 cutoff, 但前提是局部图存在连接路径. 两个 fragment 若一开始相距超过 cutoff 且没有中间原子, 不会因堆层而产生相互作用.

![UMA 与 MoLE 总体架构](/images/uma/fig2.png)

## 3 类全局条件

除 atomic numbers 与 positions 外, UMA 接收:

- Total charge.
- Total spin multiplicity.
- DFT task ID.

每项先生成与 spherical channels 同宽的 embedding, 拼接后经过 1-layer feed-forward network. 输出在每层加入 degree $L=0$ 的 node channels. 同一全局 embedding 也送入 MoLE router.

## 为什么只加到 $L=0$

$L=0$ channel 是 rotation-invariant scalar. Charge, spin multiplicity 与 task ID 本身不随坐标旋转, 加入 scalar channel 不会破坏 equivariance. 若把它们随意注入 $L>0$ channels, 必须额外指定正确的 transformation law.

## Task-conditioned PES

UMA 不是对同一结构只输出一个 universal energy. 用户必须选择 `omat`, `omol`, `oc20`, `omc` 或 `odac` 等 task, 模型才知道目标 DFT reference.

这与 DPA3 dataset encoding 的功能相似, 但 UMA 的 task embedding还参与 MoLE routing. Task 不仅改变 output calibration, 还改变每个 linear layer 的有效权重.

## Output 与 conservativeness

Conservative UMA-S/M 先预测标量 energy, 再以 autograd 计算 force 与 stress. 因而:

$$
\boldsymbol F_i=-\nabla_{\boldsymbol r_i}E.
$$

UMA-L 保留 direct force prediction, 主文 Table 1 明确标为 non-conservative. 论文在 NVE, phonon 与 optimization 任务中观察到 S/M 往往优于 L, 说明参数规模不能补偿物理输出结构的差异.

## UMA-S/M/L 的容量轴不相同

| Hyperparameter | UMA-S | UMA-M | UMA-L |
| --- | ---: | ---: | ---: |
| MoLE experts | 32 | 32 | Dense |
| Layer blocks | 4 | 10 | 16 |
| $L_{\max}$ | 2 | 4 | 6 |
| $M_{\max}$ | 2 | 2 | 2 |
| Channels | 128 | 128 | 256 |
| Radial bases | 64 | 128 | 256 |

因此 S 到 M 到 L 同时改变 depth, angular degree, width, radial resolution 与 expert structure. 家族结果不能用于精确识别某一个超参数的因果贡献.

## 离散 charge/spin 的局限

每个见过的 charge 或 spin 值使用独立 embedding. 未见过的离散值没有连续插值结构. 更严重的是, dissociation 后多个 disconnected fragments 仍共享 system-level charge/spin, 模型不能决定电子与自旋应怎样分配到不同 fragment. UMA-1.2 diatomic 页面直接展示了这一失效.
