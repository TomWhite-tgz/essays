---
title: 物性, 声子与分子泛化
description: MatCalc, MDR, SPICE 与分子 zero-shot 结果的证据边界.
---

# 物性, 声子与分子泛化

## MatCalc 物性

MatCalc 比较 equilibrium distance $d$, formation energy $E_f$, bulk modulus $K$, shear modulus $G$, heat capacity $C_V$ 与 force correlation $f$. 使用 MPTrj 的 MatRIS-M 在 6 项中有 5 项达到最好或第二, 对应作者所谓 83% SOTA or near-SOTA.

| 模型 | $d$ | $E_f$ | $K$ | $G$ | $C_V$ | $f$ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MatRIS-M, MPTrj | 0.32 | 0.041 | 12.4 | 16.4 | 7.39 | 0.983 |
| MatRIS, OAM | 0.316 | 0.025 | 10.6 | 13.3 | 3.97 | 0.985 |

MatPES 专用训练的 1.4M MatRIS 在 $E_f$, $K$, $G$ 上很强, 但 equilibrium distance error 为 0.54. 这再次说明一个物性上的优势不能自动推广到所有量.

## MDR 声子与热力学

MDR 使用约 10k 个 structures. 结构先以 FIRE relaxation 到最大力 $0.005\,\mathrm{eV/Å}$, 再以 $0.01\,\text{Å}$ displacement 计算 phonons 和 300 K thermodynamic quantities.

![MDR 声子与色散评测](/images/matris/MDR_benchmark.png)

OMat24 预训练并经 sAlex 与 MPTrj fine-tune 的模型在最大频率, entropy, free energy 与 heat capacity 上报告 7.08, 7.12, 2.12, 1.91 的误差. 图中的标签写 MatRIS-10M-OAM, 正文一处写 MatRIS-10M-OMat, 应视为命名不一致. Si, BeSe, CsCl 与 GaAgS2 的 dispersion curves 是有价值的 qualitative evidence, 但 4 个例子不能代替整个测试集的 branch-resolved statistics.

## 分子 zero-shot

MatRIS-M 在 SPICE-MACE-OFF23 的 951,005 个 configurations 上训练. 在 TorsionNet500 上, energy MAE, RMSE 与 barrier error 分别为 0.04, 0.07, 0.07, negative activation barriers 为 0. DPA3 对应为 0.06, 0.09, 0.09, 0.

在 MD22, ANI-1x 与 AIMD-Chig 上, MatRIS 在 6 个 energy-force 指标中 5 项第一, ANI-1x force 第二. v3 的正确 energy MAE 如下:

| 数据集 | MACE-OFF-L | MatRIS-M |
| --- | ---: | ---: |
| MD22 | 2.29 | 2.23 |
| ANI-1x | 5.82 | 4.15 |
| AIMD-Chig | 8.25 | 1.55 |

这些能量数值在 v1 中曾错误写成约 0.01 到 0.4, v2 已修正. 作者还说对不同 DFT functionals 的 inconsistency 做了校正, 却没有给出充分的 transformation 或 reference fitting 细节. 因此排名可按论文报告引用, 但严格复现仍缺一环.

