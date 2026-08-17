---
title: Problem-oriented benchmarks
description: 分子, 水, 催化, 二维材料, 多孔材料与 Matbench 的精度证据.
---

# Problem-oriented benchmarks

## 一张图覆盖的 5 组任务

Figure 2 汇总 SPICE-MACE-OFF, TorsionNet-500, liquid water/ice, 3 类材料数据与 DPA2 test sets.

![DPA3 task-specific benchmarks](/images/dpa3/fig2.png)

这些模型都针对各自数据重新训练, 所以这里评估的是 architecture capability, 不是一个 pretrained checkpoint 的 universal zero-shot 能力.

## SPICE-MACE-OFF

该数据约有 1M configurations, 以 $\omega$B97M-D3(BJ)/def2-TZVPPD 标注, 按 molecule split 保持 95% train/validation 与 5% test. Supplementary Table S-1 的 logarithmic average 为:

| Model | Params | Energy LWAMAE | Force LWAMAE |
| --- | ---: | ---: | ---: |
| MACE(M) | 2.3M | 0.73 | 15.42 |
| MACE(L) | 6.9M | 0.65 | 11.66 |
| EScAIP | 45M | 0.46 | 5.87 |
| eSEN | 6.5M | **0.14** | **2.58** |
| DPA3-L3 | 0.9M | 0.73 | 14.08 |
| DPA3-L6 | 1.3M | 0.43 | 10.69 |
| DPA3-L12 | 2.5M | 0.36 | 8.74 |
| DPA3-L24 | 4.9M | 0.22 | 5.78 |

Energy 单位为 meV/atom, force 单位为 meV/Å. DPA3-L24 比 MACE(L) 的 energy LWAMAE 低约 66%, 参数还少约 30%. 但 eSEN 在两项汇总误差上仍明显最佳, 所以结果支持 DPA3 的参数效率与 depth scaling, 不支持它在该任务上绝对 SOTA.

## TorsionNet-500

DPA3-L24 在 torsional energy MAE, RMSE 与 barrier MAE 上优于所列 MACE, AIMNet2 和 DPA2-drug. Barrier MAE 相对 MACE(L) 下降约 60%. 原文写 DPA3-L12/L24 的 $\mathrm{NABH}_h=0$, 其定义是 barrier-height error 超过 1 kcal/mol 的数量, 因而这里的 0 表示没有超阈值样本, 不是预测误差为零.

## Water 与 ice 的反例价值

训练只使用全部 140000 frames 中的 133 帧, 不到 0.1%. DPA3-L12 相对 NequIP 的 energy LWARMSE 约低 60%, force LWARMSE 约低 30%. 但 L24 反而不如 L12.

作者将其解释为数据多样性有限导致大模型 overfit. 更重要的是, 同条件训练的 DeepPot-SE 也能接近 NequIP. 因而这个数据集上的 0.1% data-efficiency 结果受 trajectory redundancy 强烈影响, 不能直接外推到独立构型空间.

## 催化, bilayer graphene 与 zeolite

DPA3-L6 已在多数指标上优于 NequIP 与 AlphaNet. L12/L24 在 formate decomposition 与 defected bilayer graphene 上继续改善. Zeolite 中误差随深度下降, 但 DPA3-L24 仍略逊 AlphaNet.

这个例外很有信息量. 论文没有把每个任务都包装成胜利, 而是显示显式高阶 graph 与深度并不能保证每个系统的最优结果.

## DPA2 test sets

18 个数据集合计约 5.12M structures, 涵盖 alloy, cathode, semiconductor, drug, catalysis 与 hydrocarbon pyrolysis. DPA3-L24 的 energy/force LWARMSE 在汇总指标上最佳. EqV2 在部分 force 项更低, 但使用单独 direct-force prediction, 不具备同样的 conservative guarantee.

LWARMSE 本质是 weighted geometric mean:

$$
\operatorname{LWARMSE}
=\exp\left(
\dfrac{\sum_i w_i\log\operatorname{RMSE}_i}{\sum_i w_i}
\right).
$$

它降低极端大误差对汇总数的支配, 也可能掩盖单个灾难性子集. 因此 Supplementary Table S-5 的逐数据集数值比单一柱状图更适合部署前审计.

## Matbench Discovery

Table 1 只比较 compliant models, 即训练数据协议满足 leaderboard 约束. DPA3-L24 的 CPS 为 0.717, 排第二, 低于 eSEN-30M-MP 的 0.797, 略高于 SevenNet-l3i5 的 0.714. DPA3 只有 4.92M 参数, 但 CPS 已显式把 accuracy 与多个下游指标混合, 不能简化为单位参数精度排序.

## 证据总结

Task-specific 结果最强地支持两个结论: DPA3 能在多类数据上训练到有竞争力的静态精度, 并且多数任务随 depth 改善. 它们不证明同一个 checkpoint 同时掌握这些体系, 后一主张必须看 DPA-3.1-3M 的 zero-shot 实验.
