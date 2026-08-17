---
title: PET 架构, 训练与 LoRA
description: Point Edge Transformer 的 directed-edge tokens, unconstrained symmetry 与训练配置.
---

# PET 架构, 训练与 LoRA

## Directed-edge representation

PET 为 cutoff 内每条 directed bond $i\to j$ 维护 token $f_{ij}^{l}$. 在 message-passing layer $l$ 中, 中心原子 $i$ 收集全部 incoming tokens $\{f_{ji}^{l}\}_j$, 由 transformer 做 permutation-covariant sequence-to-sequence 更新, 输出 $\{f_{ij}^{l+1}\}_j$.

几何与 chemical species 被编码到 token 更新中. 每层和每条 bond 的表示再经过 feed-forward network, 全部求和产生能量. 论文把单层 PET 描述为具有近乎无限 body order 与 angular resolution 的 universal approximator, 这是架构表达力陈述, 不等于有限宽模型已学习所有多体项.

## PET-MAD 配置

Supplementary Figure S1 对 architecture 做 accuracy-speed Pareto search.

![PET-MAD architecture Pareto frontier](/images/pet-mad/fig-s1.png)

最终配置:

| Hyperparameter | Value |
| --- | ---: |
| Cutoff | 4.5 Å |
| Message-passing layers | 2 |
| Transformer layers per message pass | 2 |
| Token size | 256 |
| Attention heads | 8 |
| Output MLP width | 512 |
| Parameters | 约 3.3M |

## 不硬编码旋转等变

PET 通过 rotation augmentation 近似学习 symmetry. 作者用 order-9 Lebedev-Laikov grid 旋转每个 MAD test structure, 以 energy predictions 的 standard deviation 衡量 rotational discrepancy.

PET-MAD 在大多数子集低于 1 meV/atom, 且比实际 prediction error 小 1-2 orders of magnitude. MC3D-random 与 MC3D-cluster 较高. Orb-v2 的 discrepancy 更大, 有时与模型误差相当.

这一结果证明 PET-MAD 在所测旋转 grid 与数据域上近似 invariant, 不提供所有输入上的 exact invariance guarantee.

## 训练配置

- 8 NVIDIA H100 GPUs.
- Batch size 24 structures/GPU.
- 1500 epochs, 约 40 hours.
- Adam, initial learning rate $10^{-4}$.
- 每 250 epochs 将 learning rate 减半.
- Energy 与 force RMSE loss, energy contribution scaling 0.1.

Train MAE 为 7.3 meV/atom 与 43.2 meV/Å, validation MAE 为 14.7 meV/atom 与 72.2 meV/Å. 原文不同位置对 MAD test error 报告 17.6/65.1 和 15.1/72.3 两组数, 它们对应 benchmark table 与 supplementary fine-tuning context, source 没有解释差异. 本站不将它们混成单一值.

## LoRA fine-tuning

Base weights frozen, 每个 attention block 加入两个低秩矩阵. 对原 weight $W$, 更新可写作

$$
W'=W+sBA,
$$

其中 rank $r\ll\min(d_{\mathrm{in}},d_{\mathrm{out}})$. 论文默认 $r=8$, scaling parameter 0.5.

LoRA 的优势是低数据时参数少, 训练快, 并缓解 catastrophic forgetting. 但它不是零遗忘. Supplementary Table II 显示各专用 LoRA model 回到 MAD test 时 energy MAE 为 44.4-284.8 meV/atom, 明显高于 base PET-MAD 的 15.1.

## 两种 force heads

默认 conservative force 由 energy backpropagation 得到. 作者另训练 direct-force head, 推理快 2-3 倍. 它不保证

$$
\widehat{\bm F}=-\nabla_{\bm r}\widehat E,
$$

因此只把它作为加速组件, 并在补充材料用 BMIM-Cl 证明直接部署会破坏采样. [Direct-force 专页](/papers/pet-mad/direct-force) 详述 MTS 修复.

