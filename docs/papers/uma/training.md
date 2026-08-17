---
title: 两阶段训练, 能量参考与算力
description: Direct-force BF16 pretraining, FP32 conservative fine-tuning, label normalization 与训练成本.
---

# 两阶段训练, 能量参考与算力

## 初版两阶段策略

UMA-S 与 UMA-M 先训练 direct-force model, 再移除 force head, 用 energy autograd fine-tune 为 conservative model.

| Setting | Pretraining | Fine-tuning |
| --- | --- | --- |
| Precision | BF16 | FP32 |
| Max neighbors | 30 | 300 |
| Force | Direct | Autograd |
| Stress | None | Autograd |
| Optimizer | AdamW | AdamW |
| Max learning rate | $8\times10^{-4}$ | $4\times10^{-4}$ |
| Energy loss coefficient | 10 | 20 |
| Force loss coefficient | 30 | 2 |
| Stress loss coefficient | - | 1 |

Direct-force stage 省去 force 对 coordinates 的二阶反向传播路径. Fine-tuning 才恢复 conservative force 与 stress.

## BF16 的交换

作者观察 BF16 比 AMP-FP16 在跨域训练中稳定, 但单独使用会令 accuracy 下降约 20%-50%, 具体取决于 task 与 property. 用少于 1% data 的 FP32 fine-tuning 可几乎恢复.

这是一项工程经验主张, 论文没有给对应逐任务 ablation table. 最终 conservative checkpoint 的高精度依赖第二阶段, 不能拿 BF16 direct checkpoint 直接做物性模拟.

## Max-atom batching

不同数据集的 average atoms 从 19 到 178, edge count 还随密度变化. 固定 structures per batch 会造成显存高度波动. UMA 改为随机装入 structures, 直到接近 max atoms 上限.

Global batch size 为 UMA-S 88k atoms, UMA-M/L 44k atoms. 这提高显存可预测性, 但 batch 中实际 edges 数仍会随结构密度变化.

## Neighbor switching

Pretraining 每个 atom 最多保留 30 neighbors, conservative fine-tuning 增至 300, 近似 infinite neighbors. 作者称最终 performance, energy conservation 与 smoothness 未受 pretraining truncation 影响.

该策略节约大量算力, 但论文未展示 matched ablation. 在 cutoff 内 neighbor ranking 随几何变化时, pretraining direct model 仍可能接触不连续图, 最终 smoothness 主要依赖 fine-tuning protocol 修复.

## Energy reference

不同 DFT task 的绝对能量尺度先转成 heat-of-formation reference:

$$
E_{\mathrm{ref}}
=E_{\mathrm{DFT}}
-\sum_{i=1}^{N}\left(E_{i,\mathrm{DFT}}-\Delta H_{f,i}\right).
$$

$E_{i,\mathrm{DFT}}$ 使用每个 dataset 自己的 DFT settings 计算孤立原子, $\Delta H_{f,i}$ 来自 Mendeleev. 之后再加一个沿用 OC22 protocol 的 linear reference.

这使 UMA 能用 single energy head, 但仍需要 task-specific isolated-atom references. Reference alignment 消除大部分 arbitrary offset, 不会让不同 functionals 的 PES 变成同一个 physical target.

## Target normalization

所有 targets 使用:

$$
x'=\dfrac{x-\mu}{\sigma},
\qquad
\mu=0,
$$

其中 $\sigma$ 取 force RMS. Combined dataset 的 force RMS 按 systems 数加权平均各 dataset RMS. 同一 scale 用于 energy, force 与 stress 是一种经验 normalization, 不是量纲分析上的自然归一化.

## 训练并行与算力

大模型训练组合 graph parallelism, MoLE layers 上的 FSDP, DDP, activation checkpointing 和 distributed checkpointing.

| Model | Stage | GPUs | Days | GPU |
| --- | --- | ---: | ---: | --- |
| UMA-S | Direct pretrain | 128 | 5 | H200 140GB |
| UMA-S | Conservative fine-tune | 256 | 5 | H200 140GB |
| UMA-M | Direct pretrain | 128 | 14 | H200 140GB |
| UMA-M | Conservative fine-tune | 256 | 14 | H200 140GB |
| UMA-L | Direct pretrain | 128 | 25 | H100 80GB |
| UMA-L | Stress plus FP32 fine-tune | 128 | 6 | H100 80GB |

仅按 GPU-days 粗算, S 约 1920 H200 GPU-days, M 约 5376 H200 GPU-days, L 约 3968 H100 GPU-days. 硬件不同, 不能直接相加为统一 FLOPs.

## UMA-S-1.2 改变了训练范式

UMA-S-1.2 两阶段都使用 FP32, 300 neighbors, autograd force 与 stress. 它不再采用 direct-force BF16 pretraining. 同时 experts 从 32 增至 64, radial bases 从 64 减至 32, 使用 task-specific output heads, 加入 charge balancing 与 single-atom predictions.

因此论文关于两阶段训练节省算力的论证适用于初版 S/M, 不适用于 1.2 的 end-to-end conservative training.
