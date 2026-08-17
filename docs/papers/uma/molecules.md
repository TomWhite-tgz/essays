---
title: 分子与药物设计证据
description: OMol25 OOD splits, ligand strain, pocket interaction, distance scaling 与优化稳定性.
---

# 分子与药物设计证据

## 最终 v2 使用的模型

主文 active Tables 2 与 4 报 UMA-S-1.1, UMA-S-1.2 和 UMA-M-1.1. 其中 1.1 models 使用 full OMol25 并修复 size-extensivity bug, 1.2 又加入 updated OMol25 与 OPoly26.

早期 UMA-S/M/L 使用约 70% OMol preview 的 rows 仍留在 TeX comments, 不能当作 v2 最终主表.

## OMol25 OOD splits

| Model | OOD-Comp total E / F | PDB-TM total E / F |
| --- | --- | --- |
| UMA-S-1.1 | 73.6 / 8.64 | 92.7 / 15.47 |
| UMA-S-1.2 | **44.2** / 7.62 | 78.9 / 12.69 |
| UMA-M-1.1 | 59.9 / **5.44** | **55.0 / 10.14** |
| eSEN-sm-cons | 1.35 / 7.39 | 0.83 / 12.72 |

Energy 单位为 total meV, force 为 meV/Å. 这里出现一个重要反差: eSEN 的 energy MAE 远低于 UMA, 而 UMA-M force 更低. 正文却称 UMA-S comparable, UMA-M significantly outperforms both models, 若同时考虑 energy 与 force, 这个概括过强.

可能原因包括 reference/size normalization 与旧 size-extensivity bug 的残余影响, 但论文没有在主文解释数量级差异. 不能只看粗体 winner 就忽略 energy regression.

## Practical utility threshold

Table 2 为 OOD-Comp/PDB-TM total energy 给出约 43 meV 的 practical-utility guide. UMA-S-1.2 在 OOD-Comp 为 44.2, 接近阈值, 其余 active UMA energy rows 多数高于阈值. Force 没有给同类 target.

因此 v2 最终 active table 并未证明所有 UMA checkpoints 在这两项 total-energy test 上达到实用阈值.

## Ligand strain 与 pocket interaction

主文 Table 4 为:

| Model | Ligand strain | PDB pocket | Dist-SR | Dist-LR |
| --- | ---: | ---: | ---: | ---: |
| UMA-S-1.1 | 4.86 | 127.7 | 20.4 | 194.7 |
| UMA-S-1.2 | 4.31 | **66.6** | **13.6** | **32.2** |
| UMA-M-1.1 | **2.96** | 76.8 | 15.5 | 138.1 |
| eSEN-sm-cons | 4.66 | 147.3 | 21.6 | 197.0 |

单位为 meV. UMA-M-1.1 的 ligand-strain 最低, 1.2 在 pocket 与 distance scaling 最好. 这显示新数据与新训练 recipe 对 long-range test 的作用可能比 active model size 更大.

## 6 Å cutoff 与 distance scaling

UMA-S 和 eSEN-sm-cons 有相同 local cutoff/receptive-field scheme, UMA 略好不代表真正学会无限程 interaction. 当两个 fragments 超过 6 Å 且图断开, architecture 会把它们视为独立. Dist-LR benchmark 的距离范围与是否始终有连接路径, 决定它能否直接测试这一限制.

## Optimization tasks

Appendix Table 21 包含 repeated-relaxation evaluations. 作者指出 UMA-M 常优于 UMA-L, 可能因为 M conservative 而 L direct-force. 这是一个重要反 scaling 结果: 静态 direct-force loss 更低的巨大模型, 未必产生更好的 iterative geometry optimization.

## NVE

UMA-S-1.1, S-1.2 与 M-1.1 都在 molecular NVE column 标为 conserve. 这支持 conservative implementation 的基本正确性, 但 pass/fail 无法比较不同模型 drift 的细微差别.

## 结论

UMA 在 force, ligand-strain, pocket interaction 与 distance benchmarks 上表现强. 但 v2 active table 的 OMol total-energy MAE 明显落后 specialized eSEN, 所以 single model similarly or better 的概括必须按 observable 拆开.
