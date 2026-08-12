---
title: 跨数据集 benchmark 与速度
description: PET-MAD 在七数据集上的 accuracy, DFT reference consistency 与 H100 throughput.
---

# 跨数据集 benchmark 与速度

## 先解决 reference mismatch

Matbench Discovery 的 reference settings 与 MAD 不同. 作者随机抽取 555 个不含 lanthanides/actinides 的 WBM structures, 用 MAD DFT 重新计算. 对每个模型, 尽量选择与其训练标签相容的 reference.

![一致与不一致 Matbench reference](/images/pet-mad/fig-s2.png)

PET-MAD 对原 Matbench energy above hull 的 MAE 为 138 meV/atom, 对 MAD-consistent reference 降至 41 meV/atom. 约 3 倍差异主要来自 baseline DFT, 不是网络本身. 作者因此没有把 PET-MAD 加入官方 Matbench leaderboard.

## Table I

数值为 energy MAE, meV/atom, 与 force MAE, meV/Å.

| Dataset | PET-MAD | MACE-MP-0-L | MatterSim-5M | Orb-v2 | SevenNet |
| --- | ---: | ---: | ---: | ---: | ---: |
| MAD | **17.6 / 65.1** | 81.6 / 181.5 | 47.3 / 133.7 | 52.9 / 96.2 | 82.1 / 173.5 |
| MPtrj | 22.3 / 77.9 | 15.1 / 50.8 | 21.3 / 61.4 | **5.6 / 21.9** | 9.8 / 25.5 |
| Matbench | **31.3 / --** | 58.5 / -- | 38.2 / -- | 37.9 / -- | 47.5 / -- |
| Alexandria | 49.0 / 66.8 | 65.4 / 79.5 | 21.2 / 39.9 | **13.2 / 10.5** | 47.6 / 70.3 |
| OC20 S2EF | **18.3** / 114.5 | 82.4 / 169.6 | 31.5 / 119.2 | 19.8 / **99.3** | 45.7 / 162.7 |
| SPICE | **3.7 / 59.5** | 10.6 / 166.8 | 21.3 / 145.6 | 59.0 / 140.8 | 11.3 / 139.1 |
| MD22 | **1.9 / 65.6** | 9.4 / 182.9 | 28.6 / 160.4 | 174.3 / 220.7 | 11.1 / 146.2 |

PET-MAD 在 molecular datasets 和 consistent Matbench energy 上突出. Orb 在其训练集 MPtrj 与 Alexandria 上最好. OC20 中 PET-MAD energy 最低而 Orb force 最低. 这不是单模型在全部指标制胜.

## 模型与数据规模

| Model | Parameters | Training structures |
| --- | ---: | ---: |
| PET-MAD | 3.3M | 95.6k |
| MACE-MP-0-L | 15.8M | 1.58M |
| MatterSim-5M | 4.6M | 17M |
| Orb-v2 | 25M | 32.1M |
| SevenNet-l3i5 | 1.17M | 1.58M |

Figure 1 的 Pareto claim 因此是 data efficiency, 不是 absolute SOTA across all datasets.

## MAD 子集揭示 coverage

![MAD 子集误差与旋转 discrepancy](/images/pet-mad/fig2.png)

其他 universal models 在 stable MC3D/MC2D 上相对合理, 在 rattled, random composition, surface, cluster 与 molecular subsets 上误差显著放大. PET-MAD 的优势与其训练覆盖完全吻合, 说明数据生成策略有效; 因为 MAD 同时是 PET-MAD 的训练分布, 这张图不能单独证明 OOD 泛化.

## H100 throughput

![不同模型的推理时间](/images/pet-mad/fig3.png)

测试涵盖 Al, diamond 与 liquid water 的不同 system sizes, 单张 H100, 优先使用 LAMMPS/Kokkos interface. PET-MAD 比所测 conservative models 更快且更省显存. Direct-force PET-MAD 与 Orb-v2 更快, 但虚线结果不能与 conservative MD 等价理解.

速度对比使用 MACE-MP-0 M, MatterSim-1M 与 SevenNet-0 等轻版本, 而 accuracy table 使用更大版本. 两张图回答不同问题, 不应把 accuracy 与 speed 数值拼成同一 checkpoint 的 Pareto 排名.

