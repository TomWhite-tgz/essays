---
title: 声子, 位移与假性改善
description: MDR Phonon 结果, 有限差分位移依赖和直接力模型的声子伪影.
---

# 声子, 位移与假性改善

## MDR Phonon 测什么

MDR Phonon 基准包含约 10000 种材料, 报告最大声子频率 $\omega_{\max}$, 振动熵 $S$, Helmholtz free energy $F$ 和定容热容 $C_V$ 的 MAE. 论文按原协议使用 0.01 Å 位移和 Phonopy 的有限差分超胞法.

| 模型 | MAE($\omega_{\max}$), K | MAE($S$), J/K/mol | MAE($F$), kJ/mol | MAE($C_V$), J/K/mol |
| --- | ---: | ---: | ---: | ---: |
| MACE | 61 | 60 | 24 | 13 |
| SevenNet-l3i5 | 26 | 28 | 10 | 5 |
| eSEN-30M-MP | **21** | **13** | **5** | **4** |
| Orb MPTrj, 0.01 Å | 309 | 476 | 64 | 181 |
| Orb MPTrj, 0.2 Å | 61 | 34 | 11 | 8 |
| eqV2-S-DeNS, 0.01 Å | 280 | 224 | 54 | 94 |
| eqV2-S-DeNS, 0.2 Å | 58 | 26 | 8 | 8 |

在 compliant 组, eSEN 四项均最低. non-compliant 组中, eSEN-30M-OAM 为 15, 10, 4, 3, 而 SevenNet-MF-ompa 为 15, 8, 3, 3. 所以源码 caption 中 "SOTA in both categories" 应理解为并列或接近最优, 不是 non-compliant 四项独占第一.

## 正确的位移极限

有限差分估计 Hessian 的基本形式是

$$
\dfrac{\partial F_i}{\partial r_j}
\approx\dfrac{F_i(\bm r+\delta\bm e_j)-F_i(\bm r-\delta\bm e_j)}{2\delta}.
$$

对光滑且数值稳定的 PES, 减小 $\delta$ 应逐步逼近局部导数, 直到浮点误差占主导. eSEN 的 Si, CsCl, AlN 声子带随位移减小而收敛.

![eSEN 声子带收敛](/images/esen/phonon_bands.png)

## 为什么直接力模型增大位移后反而变好

若预测力含高频噪声 $\epsilon(\bm r)$, 有限差分误差中出现

$$
\dfrac{\epsilon(\bm r+\delta\bm e_j)-\epsilon(\bm r-\delta\bm e_j)}{2\delta}.
$$

当噪声幅度不随 $\delta$ 同步减小时, 分母使小位移下的误差放大. 增大到 0.2 Å 相当于用更宽的差分尺度平滑噪声, 因而表中的热力学 MAE 大幅下降. 但它不再忠实探测极小值处的局部 Hessian.

![位移对声子误差的影响](/images/esen/phonon_atomdisp.png)

eSEN 与 MACE 的误差随位移基本不变或略增, eqV2 则随位移增大而显著下降. 这是诊断信号, 不是应该为每个模型寻找最佳位移的普通超参数曲线.

## 标量热力学为何能掩盖错误色散

直接力模型在 0.2 Å 下可得到不错的 $S$, $F$ 和 $C_V$, 同时仍有错误的色散关系, 虚频和缺失声学支. 原因是这些标量来自声子 DOS 的 Boltzmann 加权积分. 局部频率误差和细小结构可在积分中平均掉, 300 K 下低频模的权重又更重要.

所以存在三个递进标准:

1. 热力学积分标量接近.
2. DOS 的整体轮廓接近.
3. 各波矢和各分支的色散, 声学和则规则, 位移收敛均正确.

MDR 的四个标量主要覆盖前两层, 不能完全证明第三层.

## Zero-net-force 能修复多少

声学模在 $\Gamma$ 点应线性趋近 0. 直接力模型的非零净力会破坏该性质. 强制 $\sum_i\bm F_i=0$ 能恢复声学支的基本行为, 但不能保证力场是某个标量能量的梯度, 也不能消除小位移虚频或错误色散. 论文附录的 eqV2 对照清楚地区分了平移约束与完整保守性.

## 数据 level-of-theory 混杂

只在 OMat24 上训练, 尚未用 sAlex/MPTrj 微调的 eSEN 可得到 7, 7, 2, 2 的更低误差. 作者没有把它放进直接排名, 因为 OMat24 的 DFT 设置与 MDR 参考不完全相同. 论文把差异联系到 sAlex 和 MPTrj 的 softening 问题. 这说明声子 benchmark 不只测试网络, 也测试训练标签对应的电子结构协议.

