---
title: MAD 数据集与一致 DFT
description: 95,595 个构型, 85 元素, 8 个子集与统一 PBEsol 标注协议.
---

# MAD 数据集与一致 DFT

## 数据哲学

MAD 是 Massive Atomistic Diversity. 它刻意不追求最大 frame count, 而追求三个目标:

1. 同时覆盖 organic, inorganic, 0D, 2D, surface 与 bulk.
2. 加入高度 distorted 与 unusual configurations, 支持有限温采样和外推.
3. 所有构型使用同一套稳健 DFT protocol, 保持 coherent structure-energy mapping.

## 八个子集

| Subset | Structures | 构造方式 |
| --- | ---: | --- |
| MC3D | 33,596 | Materials Cloud 3D crystals |
| MC3D-rattled | 30,044 | 原子坐标加入标准差为 covalent radius 20% 的 Gaussian noise |
| MC3D-random | 2,800 | 保留晶格几何, 随机替换 85 元素并按原子体积缩放 cell |
| MC3D-surface | 5,589 | 随机低 Miller index 平面切割 surface slab |
| MC3D-cluster | 9,071 | 从晶体切出 2-8 atoms 的局域 cluster |
| MC2D | 2,676 | Materials Cloud 2D crystals |
| SHIFTML-molcrys | 8,578 | Molecular crystals, 含 relaxed 与 thermal distortions |
| SHIFTML-molfrags | 3,241 | Neutral molecular fragments |

总数为 95,595, 覆盖 atomic number 1-86 中除 Astatine 外的 85 种元素. 该数字是 DFT 成功收敛并经过 force filtering 后的结果.

## 高畸变不是噪声

MC3D-rattled 和 MC3D-random 让模型看到 equilibrium database 中罕见的短键, 异常配位与不寻常元素组合. 这些构型未必具有可合成意义, 但能约束 PES 在 MD 可能访问区域的形状.

过滤阈值为:

- MC3D-rattled 与 MC3D-random: 最大力 100 eV/Å.
- 其他子集: 最大力 50 eV/Å.

MC3D-random 只有约 55% DFT convergence, 其他子集超过 95%. 这既反映随机构型的难度, 也意味着最终 random subset 被电子结构收敛性选择过, 并非原始随机分布的无偏样本.

## 统一 DFT protocol

所有 MAD, benchmark recomputation 与六个专用数据集使用:

- Quantum ESPRESSO 7.2 加 SIRIUS.
- Non-magnetic PBEsol.
- SSSP v1.2 efficiency pseudopotentials.
- 全 85 元素共同采用 110 Ry wavefunction cutoff 与 1320 Ry charge-density cutoff.
- Marzari-Vanderbilt-DeVita-Payne cold smearing, spread 0.01 Ry.
- Periodic dimensions 使用 $\Gamma$-centered 0.125 Å$^{-1}$ grid.
- 2D 使用 Sohier-Calandra-Mauri Coulomb truncation, 0D 使用 Martyna-Tuckerman correction.
- Non-periodic directions 加 25 Å vacuum.

采用全元素最严格公共 cutoff 的理由是消除 composition-dependent numerical discontinuity. 若每种结构使用其元素集合的最大推荐 cutoff, 加入一个新元素可能改变整个 total energy baseline.

![MAD 与推荐 cutoff 的孤立原子能差](/images/pet-mad/fig-s3.png)

## 一致性不等于实验准确性

Non-magnetic PBEsol 忽略 spin polarization, strong correlation 与 dispersion. 作者明确选择它是为了跨 85 元素稳定且一致地收敛, 不是声称它对所有材料最准确.

因此模型目标是

$$
E_{\mathrm{PET-MAD}}\approx E_{\mathrm{PBEsol,MAD}},
$$

不是直接逼近实验 free energy 或 exact Schrödinger solution. 液态水过度结构化, GaAs 熔点低约 340 K 和 BTO transition temperature 偏低, 都主要显示 reference limitation.

## Split 的潜在相关性

每个子集先独立随机 shuffle, 再按 80/10/10 分为 train, validation, test, 最后合并. 这种 structure-level split 容易让同一 MC3D parent 的原晶体与衍生 rattled, surface 或 cluster 分落不同 splits.

所以 MAD test error 证明对同一数据生成机制的泛化, 不足以证明对新 prototype, new composition family 或 new chemical process 的严格 OOD 泛化. 外部七数据集 benchmark 和六个案例提供了更强但仍不完备的补充证据.

