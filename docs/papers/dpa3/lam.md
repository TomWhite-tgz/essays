---
title: DPA-3.1-3M 与 zero-shot 证据
description: OpenLAM-v1 预训练, 12 个下游数据集与跨模型公平性审计.
---

# DPA-3.1-3M 与 zero-shot 证据

## 预训练配置

DPA-3.1-3M 使用 $K=2$, $L=16$, 约 3.26M 参数. 它在 OpenLAM-v1 的 31 个数据集上训练 4M steps, 使用 128 GPUs. 数据包括 OMat24, OC20, SPICE2 以及较小的 metals, alloys 与 organic reactions 数据.

由于数据量和重要性不同, 每个数据集有人工设定的 sampling weight. 这避免大数据集完全支配训练, 也引入设计者对任务优先级的先验.

## Zero-shot 如何定义

测试集来自 12 个独立构建的数据集, 每个最多随机抽样 1000 frames. 测试前不对 DPA-3.1-3M 做额外训练.

能量有任意 reference offset, 因而评测先用 composition-linear dummy model 处理能量基线. Force 与 virial 直接评估. 最终以 equal-weight logarithmic average 聚合各数据集 RMSE.

## 总体结果

![DPA-3.1-3M zero-shot 结果](/images/dpa3/fig5.png)

| Model | Params | Energy LWARMSE | Force LWARMSE | Virial LWARMSE |
| --- | ---: | ---: | ---: | ---: |
| DPA-3.1-3M (OMat) | 3.26M | **6.6** | **130.6** | 98.1 |
| DPA-2.4-7M | 7M | 9.3 | 174.0 | 169.9 |
| MACE-MPA-0 | 9.06M | 12.5 | 229.7 | 203.7 |
| Orb-v3 | 25.5M | 8.7 | 171.0 | 109.4 |
| SevenNet-MF-ompa (OMat) | 25.7M | 11.0 | 192.8 | **92.4** |
| MatterSim-v1-5M | 4.55M | 12.9 | 236.6 | 148.3 |
| GRACE-2L-OAM | 12.6M | 10.5 | 209.4 | 148.3 |

Energy 与 virial 单位为 meV/atom, force 为 meV/Å. DPA-3.1-3M 的 overall energy 与 force 最低, SevenNet 的 virial 最低.

## 分领域看会发生什么

- Catalysis. DPA-3.1-3M 的 energy/force 最低, virial 次于 SevenNet.
- Molecules. DPA-3.1-3M 的 energy/force 最低.
- Inorganic materials. Orb-v3 的 force 最低, Orb-v3 与 SevenNet 的 energy 略低于 DPA-3.1-3M.

这与训练域构成一致. OpenLAM-v1 同时含 catalysis 与 molecule data, 其他多数 baselines 主要由 inorganic materials 数据训练. 因而 Figure 5 对 DPA 系列更接近 in-domain OOD, 对其他模型则常是 out-of-domain OOD.

## XC alignment 不是无关细节

ANI-1x 原为 $\omega$B97X/6-31G*, AIMD-Chig 原为 M06-2X/6-31G*. 作者将两者以 PBE 重新标注, 降低与多数 baseline 训练标签的 XC mismatch. 对 DPA-3.1-3M 与 SevenNet-MF-ompa, 推理还显式选择 OMat24 encoding.

因此 zero-shot 指没有 gradient update, 不等于不使用任何测试域先验. 评测者知道标签 functional 并选择 encoding, 还对两项数据做 relabeling. 这对比较相同 PBE reference 的模型是合理控制, 但它不同于用户拿到任意未知体系后盲选 checkpoint 的场景.

## 未纳入 UMA

作者说明 UMA 当时在其机构所在地中国不可访问, 因而未进入比较. 这是真实可复现性约束, 也意味着论文的 state-of-the-art 范围是所列且可访问的模型, 不是 2026 年所有 LAM 的完整排序.

## Zero-shot 数字意味着什么

较低 RMSE 意味着更好的初始化点, 可能减少 fine-tuning 数据, 但不能直接推出 out-of-the-box MD 已可靠. 每个 dataset 最多 1000 静态 frames, 未报告长轨迹稳定性, rare-event coverage 或 simulation observable. 对应用而言, zero-shot benchmark 是筛选信号, 不是生产资格证.
