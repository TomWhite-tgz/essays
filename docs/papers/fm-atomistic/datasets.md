---
title: 大规模数据版图
description: Perspective Table 1 的分子, 材料与无监督数据集规模和标签协议.
---

# 大规模数据版图

## Table 1 的收录门槛

作者收录两类公开数据:

- 超过 100 万个 3D structures, 且具有 energy 与 force labels.
- 超过 1 亿个 3D structures, 没有量子 energy/force labels 的大规模预训练数据.

表中的 size 是 configurations 或 structures 数, 不是独立 molecules, materials, atoms 或 force components 数. 不同数据集的一条记录信息量差异很大, 因而规模不能直接横比为有效 token 数.

## Molecular labeled datasets

| Dataset | Size | Table 1 level of theory | 主要 sampling |
| --- | ---: | --- | --- |
| OMol25 | 100M | $\omega$B97M-D3/def2-TZVPD | MD, rattling, optimization, reaction pathways |
| QCML | 33.5M | PBE0-D4/NAOs | Chemical graphs, normal modes |
| AIMNet2 | 20M | $\omega$B97M-D3/def2-TZVPP | Normal modes, metadynamics, MD, torsion scans |
| $\nabla^2$DFT | 16M | $\omega$B97X-D/def2-SVP | Relaxation trajectories |
| Transition-1x | 10M | $\omega$B97X/6-31G* | Nudged elastic band |
| ANI-1x/ANI-2x | 8.9M | $\omega$B97X/6-31G* | Dimers, torsions, normal modes, MD, active learning |
| QM7-X | 4.2M | PBE0-MBD | Normal modes |
| SPF | 2.7M | RPBE-D3(BJ)/def2-TZVP | MD, active learning |
| GEMS | 2.7M | PBE0-MBD/def2-TZVPP | SPF, MD |
| SPICE/SPICE2 | 2M | $\omega$B97M-D3(BJ)/def2-TZVPPD | MD, dimer scans |

Table 1 将 OMol25 functional 写作 $\omega$B97M-D3, 但 Section 3.5 写作 $\omega$B97M-V/def2-TZVPD. OMol25 原论文采用后者. 本站保留表格原文并在 source map 标记不一致, 不擅自让两个位置看似一致.

## Materials labeled datasets

| Dataset | Size | Level of theory | 主要 sampling |
| --- | ---: | --- | --- |
| OC20 | 265M | RPBE/PAW | Relaxation, MD, rattling |
| OMat24 | 110M | PBE(+U)/PAW | Rattled Boltzmann, MD, relaxation |
| ODAC23 | 38M | PBE-D3(BJ)/PAW | Relaxation |
| Alexandria | 30M | PBE(+U), SCAN, PBEsol/PAW | Relaxation |
| OC22 | 9.8M | PBE(+U)/PAW | Relaxation |
| MPtrj | 1.6M | PBE(+U)/PAW | Relaxation |

材料数据在元素覆盖上通常比 molecular datasets 广, 可延伸到重元素. 但元素覆盖不是 configuration coverage. 表中许多材料数据仍以 relaxations 为主, 对缺陷, 界面, high-energy collisions 和 rare events 的覆盖有限.

## Unlabeled 或低成本 3D data

| Dataset | Size | Geometry source | 用途 |
| --- | ---: | --- | --- |
| Zinc20/Zinc22 | 4.5B | MMFF94 torsion sampling | 大规模分子构象与低成本属性 |
| Uni-Mol/Uni-Mol2 | 838M | MMFF94, distance geometry, optimization | 3D self-supervised pre-training |

Uni-Mol2 的案例说明, 在 8 亿级 unlabeled conformations 上进行自监督预训练, 可改善 QM9 下游 property prediction. 但 low-cost geometries 的分布由 force field 和 molecule enumeration 决定, 不等于从量子 PES 无偏采样.

## 数据规模至少有六个维度

Perspective 把 "diverse data" 具体拆成:

1. Domain diversity: molecules, solids, interfaces.
2. Element diversity.
3. Charge and spin diversity.
4. Bonding and interaction motif diversity.
5. Configurational diversity: near-minimum 与 far-from-minimum.
6. Label diversity and fidelity.

因此 5 亿构型仍可能在 charge, spin 或 long range 上稀疏. 反过来, 一个较小但专门覆盖 transition states 的数据集, 对 reactivity 可能比大量 relaxation frames 更有增量价值.

## Force range 与过滤悖论

作者建议数据覆盖约 0 至 10 eV/Å 的广泛 force range, 以学习 MD, relaxation 与 reaction pathways. 超过 50 eV/Å 的极端力常被过滤, 因其可能损害训练. 但完全删除高能信息会使模型在原子过近时没有 repulsive wall 约束.

合理策略不是简单保留或删除全部高力点, 而是检查计算是否收敛, 对可靠高能点降权, 并确保部署可能访问的短程排斥区域有受控覆盖.

