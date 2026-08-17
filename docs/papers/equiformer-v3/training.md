---
title: 数据, 训练与 DeNS
description: 汇总 EquiformerV3 在 OC20, OMat24 和 Matbench 上的训练 protocol.
---

# 数据, 训练与 DeNS

## 三类数据

| 数据 | 内容 | 本文用途 |
| --- | --- | --- |
| OC20 S2EF-2M | Catalyst adsorbate relaxation frames, RPBE | 架构 sequential ablation |
| OMat24 | 超过 110M non-equilibrium crystal structures, PBE | 大规模预训练与 validation MAE |
| MPtrj 与 subsampled Alexandria | Materials trajectories 与 crystals | Matbench Discovery domain adaptation |

仓库 preprocessing 会删除 MPtrj 中 cutoff 6 A 内没有 neighbor 的 structures, 并重建记录 edge count 的 `metadata.npz` 用于 load balancing. 这属于复现 protocol 的一部分, 不能只下载原始 JSON 后直接训练.

## Direct 与 gradient 两阶段

Direct pre-training 同时预测 energy, force 与 stress heads, 可加 dropout, stochastic depth 与 DeNS. Gradient fine-tuning 从 pretrained weights 初始化, 关闭这些 regularizations, 并通过 energy derivatives 得到 force 与 stress.

论文说明 gradient stage 用 force statistics 同时 normalize energy 与 stress labels. 因此 direct 与 gradient rows 的 energy 和 stress MAE 差异混合了 parameterization 与 normalization change.

## DeNS

Denoising non-equilibrium structures 对 positions 添加噪声并要求模型复原或预测相关 denoising target. 它作为 auxiliary task 扩充 local perturbations, 与 force learning 对 position sensitivity 的需求一致. V3 使用 DeNS, 但论文没有在 OMat24 主表单独消融 DeNS, 因而不能从主表量化它与新架构各自的贡献.

## 代表性超参数

### OC20 S2EF-2M

- 8 blocks, $L_{\max}=6$, $M_{\max}=2$, 128 channels.
- Cutoff 12 A, maximum 20 neighbors.
- Batch 64, 12 epochs, AdamW, peak learning rate $2\times10^{-4}$.
- Energy coefficient 4, force coefficient 100.
- Attention grid $(8,20)$, FFN grid $(20,20)$.

### OMat24

- 7 blocks, $L_{\max}=4$ 或 6, cutoff 6 A, maximum 300 neighbors.
- Direct 4 epochs, gradient fine-tuning 2 epochs, batch 512.
- Energy 与 force coefficients 均为 20, stress coefficient 5.
- 32 H100 GPUs.

## 可复现性成本

公开仓库包含 configs, launch scripts, preprocessing utilities, model code, equivariance tests 与 Matbench evaluation scripts. 但 YAML 中仍有作者机器的 absolute dataset 和 checkpoint paths, 使用者必须手工替换. README 提供分布式 launch 步骤, 并不提供小规模 end-to-end smoke dataset.

