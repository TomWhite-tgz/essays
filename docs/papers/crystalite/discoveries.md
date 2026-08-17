---
title: 生成晶体案例
description: 9 个 Crystalite SUN examples 的证据含义与不能推出的结论.
---

# 生成晶体案例

Appendix G 展示 9 个被 evaluation pipeline 判为 stable, unique and novel 的 crystals. 它们覆盖 oxides, sulfides, alloys 与多元素 compounds.

| | | |
| --- | --- | --- |
| ![Sr4Eu8W4O24](/images/crystalite/Sr4_Eu8_W4_O24.png) | ![LuPt](/images/crystalite/Lu1_Pt1.png) | ![Ga4Cu2S8](/images/crystalite/Ga4_Cu2_S8.png) |
| Sr4Eu8W4O24 | LuPt | Ga4Cu2S8 |
| ![Y2Nb2O8](/images/crystalite/Y2_Nb2_O8.png) | ![V8Fe4O22F2](/images/crystalite/V8_Fe4_O22_F2.png) | ![Tb5Mn2O11](/images/crystalite/Tb5_Mn2_O11.png) |
| Y2Nb2O8 | V8Fe4O22F2 | Tb5Mn2O11 |
| ![Tb3DyAs4Pd4](/images/crystalite/Tb3_Dy1_As4_Pd4.png) | ![Ta3S5](/images/crystalite/Ta3_S5.png) | ![Ti4V2ReSn](/images/crystalite/Ti4_V2_Re1_Sn1.png) |
| Tb3DyAs4Pd4 | Ta3S5 | Ti4V2ReSn |

## 这些图证明什么

它们证明 sampler 能输出视觉上合理的 periodic structures, 并且至少在 paper 的 StructureMatcher, NequIP relaxation 与 phase-diagram pipeline 下通过 SUN filtering. 多种 compositions 也与 main table 的 nonzero novelty 相符.

## 这些图不能证明什么

论文没有为这 9 个 structures 报告 space group, exact relaxed CIF, formation energy, energy above hull, phonons, elastic stability 或 synthesis route. `Novel` 只相对 evaluation reference set, `stable` 只来自 MLIP-based proxy. 因而它们是 qualitative examples, 不是 9 个经 DFT 或实验确认的新材料.

最有价值的 follow-up 是公开每个 candidate 的 generated CIF, relaxed CIF, NequIP energy, compatibility correction, competing phases 与 DFT relaxation result. 只有这样才能判断图中的 geometry 是否在更高保真计算后仍保留.

