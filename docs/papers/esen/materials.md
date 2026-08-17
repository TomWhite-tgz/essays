---
title: 材料稳定性与热导率证据
description: eSEN 在 Matbench Discovery compliant 与 non-compliant 榜单中的结果.
---

# 材料稳定性与热导率证据

## 同一个基准包含两种公平性问题

Matbench Discovery 通过结构弛豫和能量预测判断 0 K 热力学稳定性. F1 是主要排序指标, RMSD 衡量弛豫结构相对 DFT 参考的偏差. 同一套评测还用二阶, 三阶 force constants 和 Wigner transport equation 计算热导率, 主要误差为 $\kappa_{\mathrm{SRME}}$.

compliant 榜只允许 MPTrj 或其子集作为训练数据, 更适合比较架构. non-compliant 榜允许更大或不同数据, 衡量的是模型加数据的系统能力.

## Compliant 结果

eSEN-30M-MP 在 MPTrj 上进行 60 epochs 直接力预训练和 40 epochs 保守微调.

| 指标 | eSEN | eqV2 S DeNS | SevenNet-l3i5 | GRACE-2L | MACE-MP-0 |
| --- | ---: | ---: | ---: | ---: | ---: |
| F1, 越高越好 | **0.831** | 0.815 | 0.760 | 0.691 | 0.669 |
| Energy MAE, eV/atom | **0.033** | 0.036 | 0.044 | 0.052 | 0.057 |
| $R^2$, 越高越好 | **0.822** | 0.788 | 0.776 | 0.741 | 0.697 |
| $\kappa_{\mathrm{SRME}}$, 越低越好 | **0.340** | 1.676 | 0.550 | 0.525 | 0.647 |
| RMSD, 越低越好 | **0.0752** | 0.0757 | 0.0847 | 0.0897 | 0.0915 |

论文强调 eSEN 同时在稳定性 F1 和热导率误差上领先. eqV2 的 F1 很接近, 但 $\kappa_{\mathrm{SRME}}$ 为 1.676. 这正好体现一阶任务表现强不保证依赖高阶导数的输运性质可靠.

附录还报告, 把 eSEN-30M-MP 热导率计算的原子位移从 0.03 Å 调到 0.05 Å, $\kappa_{\mathrm{SRME}}$ 可由 0.340 降到 0.298. 主表保留默认协议的 0.340, 因而跨模型比较没有用该调参结果替换.

## Non-compliant 结果

eSEN-30M-OAM 先在 OMat24 预训练, 再用 sAlex 与 8 倍重采样的 MPTrj 混合数据微调 1 epoch.

| 指标 | eSEN-OAM | eqV2-M-OAM | Orb v3 | SevenNet-MF | MatterSim-v1-5M |
| --- | ---: | ---: | ---: | ---: | ---: |
| F1 | **0.925** | 0.917 | 0.905 | 0.901 | 0.862 |
| Energy MAE | **0.018** | 0.020 | 0.024 | 0.021 | 0.024 |
| $R^2$ | 0.866 | 0.848 | 0.821 | **0.867** | 0.863 |
| $\kappa_{\mathrm{SRME}}$ | **0.170** | 1.771 | 0.210 | 0.317 | 0.574 |
| RMSD | **0.0608** | 0.0691 | 0.0750 | 0.0639 | 0.0733 |

原论文完整表中 DPA3-v2-OpenLAM 的 $R^2=0.869$ 才是该行最高值, eSEN 并非每项都第一. eSEN 的主张是 F1, $\kappa_{\mathrm{SRME}}$ 和 RMSD 的联合领先.

## 相关性证据怎样读

![测试误差与物性指标相关性](/images/esen/ours_corr.png)

Figure 6 比较 eSEN 各变体. Box 表示通过守恒测试, cross 表示未通过. 守恒子集内, test energy MAE 与多个物性指标的关系更单调.

但这里存在筛选效应: 守恒测试与下游误差都可能共同受 PES 光滑性影响. 因而合理结论是 "守恒测试可提高 energy MAE 作为开发代理指标的可信度", 而不是 "守恒导致相关性" 或 "通过后只看 MAE 就足够".

## 测试集本身的边界

MPTrj 没有官方 test split, 且不同模型使用不同子集. Figure 1, Figure 6 和附录相关图的横轴 energy MAE, 实际是在随机抽取的 5000 个 sAlex 构型上统一计算. 这改善了测量一致性, 但 sAlex 仍不是所有下游任务的分布代表, 也不能消除训练集差异.

