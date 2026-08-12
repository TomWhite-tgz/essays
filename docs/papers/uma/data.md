---
title: 5 个训练数据域与 DFT tasks
description: 459M structures 的组成, 采样比例, 标签协议与数据覆盖边界.
---

# 5 个训练数据域与 DFT tasks

## Task 不是一个普通分类标签

UMA 将 task 定义为 chemical domain 加对应 DFT settings. 相同原子种类与坐标在不同 task 下可以有不同能量和力, 因为 functional, dispersion, pseudopotential 与 calculator 不同. 因此 task input 实际选择要模拟的 reference PES.

## v1/v1.1 的 5 个核心数据集

Appendix Table 11 给出的有效训练集为:

| Dataset | Domain | Structures | Labels | Elements | Avg atoms | Force RMS | Sampling ratio |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: |
| OMat24 | Materials | 100824585 | E/F/S | 89 | 19 | 2.83 | 4 |
| OMol25 preview | Molecules | 75889983 | E/F | 83 | 52 | 0.985 | 4 |
| OC20++ | Catalysis | 229054043 | E/F | 56 | 77 | 0.624 | 1 |
| OMC25 | Molecular crystals | 24870226 | E/F/S | 12 | 130 | 0.103 | 2 |
| ODAC25 subset | MOFs | 28517826 | E/F | 70 | 178 | 0.046 | 1 |
| Total |  | 459156663 |  |  |  |  |  |

E/F/S 分别表示 energy, force 与 stress. Force RMS 跨域相差约 60 倍, 说明直接混合 raw loss 会让材料数据支配梯度.

## OMat24

OMat24 使用 VASP 与 PBE, 含 100M structures, 89 elements. 它与 Materials Project 的 pseudopotential version 和部分元素赝势不同. 论文因此在 public materials benchmarks 前, 额外用 MPtrj 与 sAlex fine-tune 以对齐 reference settings.

这意味着主文 Table 4 的 Matbench, phonon 与 elasticity 不是纯预训练 zero-shot 结果.

## OMol25 preview 与 full release

OMol25 使用 ORCA 的 $\omega$B97M-V/def2-TZVPD, 覆盖 biomolecules, electrolytes, metal complexes 与 neutral organics. 最初 UMA 训练时只获得约 75M samples, 约为完整数据的 70%, 源码称 OMol-preview.

UMA-1 与 1.1 改用 2025-05-14 的 full OMol25. 因而旧 UMA-S/M/L ablation 与最终 UMA-S-1.1/M-1.1 benchmark 不是完全相同训练集.

## OC20++

OC20++ 使用 VASP 与 RPBE. 除 OC20 All, MD 与 Rattled 外, 还加入 14M clean surfaces 和 22M multi-adsorbate structures. Clean surface 数据对 total-energy difference 形式的 adsorption energy 尤其关键.

## OMC25

OMC25 使用 VASP, PBE 与 D3, 含约 25M molecular crystal structures, 12 elements, 每个 structure 最多 300 atoms. Structures 来自 Genarris packings 与 relaxation trajectories.

它是论文发布时仍配套 upcoming publication 的新数据域. 论文同时用作者自己训练的 eSEN-S-OMC 作 single-task baseline, 外部独立复现证据相对少.

## ODAC25 subset

ODAC25 面向 MOF 中 $\mathrm{CO_2}$ 与 $\mathrm{H_2O}$ adsorption, 使用 VASP, PBE 与 D3. UMA 实际只使用与 ODAC23 重叠且提升 k-point density 的约 29M subset, 不是完整 78M ODAC25.

## Sampling ratio 改变有效训练分布

初版比例为 OMat:OMol:OC20:OMC:ODAC 等于 4:4:1:2:1. 这不是按 structures 数量自然混合. 例如 OMat 与 OMol 被显著 oversample, OC20 虽 raw size 最大却权重较低.

Figure 1 的 500M unique structures 描述数据仓库规模, scaling section 的 50B atoms per epoch 描述按 sampling schedule 走完一次有效 epoch 的 token-like workload. 两个数字不是矛盾, 但不可互换.

## Pair coverage 不等于 configuration coverage

Figure 1 显示几乎全部非放射性 element pairs 出现过. 这只证明二元共现覆盖, 不证明:

- 每个 oxidation state, coordination 或 phase 都被覆盖.
- 高阶 chemical environment 充分.
- Long-range charge transfer 与 dissociation 被覆盖.
- 每项 DFT task 都见过相同元素组合.

UMA-1.1 的 diatomic 失败正好说明, element-pair coverage 很广仍可能缺少最基础的 bond-dissociation path.
