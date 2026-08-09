---
title: 5. 迁移与定制
description: MatterSim 的主动学习, 跨理论层级微调和结构到性质迁移.
---

# 5. 迁移与定制

MatterSim 的 "通用" 不是要求一个冻结模型完美覆盖任何体系. 更实际的设计是先训练一个广覆盖起点, 再用少量目标数据完成两种适配:

::: details 英文原文: 97% 数据节省怎样理解
> "For example, to simulate liquid water, only 3% of the data is needed to customize MatterSim to obtain the results of a specialized model trained from scratch, and to reproduce the experimental structural and transport properties of water."

这句话比较的是液态水特定实验中的 finetune-30 与 scratch-900, 不是对任意材料和任意任务的普遍保证. 30 个 rev-PBE0-D3 构型足以让部分结构统计量接近使用 900 个构型从头训练的模型, 但扩散系数仍有明显差距. 原文见 [Introduction](https://arxiv.org/pdf/2405.04967v2).
:::

1. 在新的构型区域补数据, 修正势能面的局部覆盖.
2. 使用更高层级理论的数据微调, 改变势能面的参考标尺.

## 主动学习复杂体系

::: details 英文原文: 为什么预训练模型只需补少量数据
> "Considering that the pretrained MatterSim model covers wide ranges of atomic configurations, the idea is that only a small amount of new data is needed to supplement the model to capture the OOD configurations. We show that with the help of a model ensemble, MatterSim provides confidence estimates in simulating any system without performing actual first-principles computations. More importantly, whenever the pretrained model is deemed unconfident, MatterSim only requires a small fraction of the trajectory being labeled by first-principles computations as additional training context to reach the same level of accuracy compared with training from scratch."

第一句给出数据效率的前提: 预训练已经覆盖大量原子环境, 新数据只需补目标体系超出覆盖的部分. 第二句说明 ensemble 的作用是估计置信度, 不是替代最终 DFT 真值. 第三句才是主动学习的节省来源: 只标注低置信度轨迹片段, 而不是整条轨迹.

原文定位: 主文 Results, MatterSim as an active learner, 第 1 段.
:::

作者选择 3 个体系测试主动学习:

- 离子超导体 $\mathrm{Li_2B_{12}H_{12}}$.
- 熔融硼.
- 熔融磷.

预训练模型先沿 AIMD 轨迹预测, 5 个 ensemble 成员评估力不确定性. 超过阈值的构型接受 DFT 标注并加入训练.

对 $\mathrm{Li_2B_{12}H_{12}}$, 零样本 MatterSim 的力 MAE 为 30.8 meV/Å. 加入 100 个主动选择的构型后, MAE 降到 18.3 meV/Å. 从头训练要达到相近精度需要约一个数量级更多数据. 主文把结果概括为只使用从头训练约 15% 的数据.

![主动学习与液态水微调](/images/mattersim/adaptation.png)

<p class="figure-note">原论文图 6. 左半展示主动学习如何选择高不确定性结构, 右半展示液态水微调后的 RDF 和 ADF.</p>

这项实验说明预训练已经学到许多可复用的局部化学环境. 新数据不必从零建立所有键合模式, 只需修正目标体系特有的区域.

## 为什么 PBE 水会出错

MatterSim 主模型主要学习 PBE 或 PBE+U. PBE 对液态水的氢键网络存在已知偏差, 会产生过度结构化的径向分布. 因而即使模型完全复现 PBE, 与实验仍可能不一致.

这个例子揭示两个误差层次:

$$
\begin{aligned}
\text{总误差}
&\approx\text{机器学习近似误差} \\
&\quad+\text{参考电子结构理论误差}.
\end{aligned}
$$

增加更多 PBE 数据主要降低第一项, 不能根治第二项. 作者因此使用 rev-PBE0-D3 级别的液态水数据微调.

## 液态水实验怎样设计

已有数据包含 1000 个 rev-PBE0-D3 液态水构型. 作者保留 100 个作验证, 其余 900 个作为候选训练数据, 比较 3 个模型:

| 名称 | 初始化 | 训练数据 |
| --- | --- | ---: |
| zero-shot | PBE 预训练 MatterSim | 0 个水构型 |
| scratch-900 | 随机初始化 | 900 个 rev-PBE0-D3 水构型 |
| finetune-30 | PBE 预训练 MatterSim | 30 个 rev-PBE0-D3 水构型 |

微调时重置预测头, backbone 学习率为 $10^{-4}$, 新预测头学习率为 $2\times10^{-3}$. 训练在 151 epochs 早停, 验证能量 MAE 为 2.1 meV/atom, 力 MAE 为 58.9 meV/Å.

之后使用 512 个水分子组成的立方盒, 边长 24.68 Å, 在 298 K 的 NVT 系综下运行最长 1 ns 的 MD. 时间步为 0.5 fs, 前 200 ps 丢弃作为平衡阶段.

## 为什么 RDF 是关键证据

径向分布函数 $g_{\alpha\beta}(r)$ 描述在某种原子周围距离 $r$ 处找到另一种原子的相对概率. 液态水中的 $g_\mathrm{OO}(r)$, $g_\mathrm{OH}(r)$ 和 $g_\mathrm{HH}(r)$ 直接反映局部氢键结构.

作者发现 finetune-30 与 scratch-900 的 RDF 基本无法区分. 相反, 使用同样 30 个构型从头训练的模型在 $g_\mathrm{OO}(r)$ 的约 1.1 Å 位置产生非物理峰. 即使从头训练使用 800 个构型, 该峰仍存在, 到 900 个构型才消失.

![30 个构型从头训练得到的非物理 RDF](/images/mattersim/water-scratch-30.png)

<p class="figure-note">补充材料图 S46. 不同随机种子的 scratch-30 模型都产生约 1.1 Å 的非物理 O-O 峰, 说明问题不是一次偶然初始化.</p>

这比只比较验证集 MAE 更有说服力. 两个模型可以具有相近短程预测误差, 但长时间动力学会把细小系统偏差积累成完全不同的结构分布.

## 扩散系数

原始扩散系数由 Einstein 关系得到:

$$
\mathcal{D}_\mathrm{raw}
=\dfrac{1}{6}
\lim_{\tau\to\infty}
\dfrac{\mathrm{d}\lambda}{\mathrm{d}\tau},
$$

其中 $\lambda$ 是均方位移, $\tau$ 是相关时间. 对有限尺寸立方盒, 作者加入流体动力学修正:

$$
\mathcal{D}_\mathrm{corrected}
=\mathcal{D}_\mathrm{raw}
+\dfrac{k_\mathrm{B}T\varepsilon}{6\pi\eta L}.
$$

finetune-30 的修正扩散系数为 $1.862\times10^{-5}$ cm²/s, 实验值约为 $2.3$ 至 $2.4\times10^{-5}$ cm²/s. scratch-900 的修正结果为 $2.402\times10^{-5}$ cm²/s.

因此 "30 个样本达到 900 个样本的相同性能" 对 RDF 和 ADF 更成立, 对扩散系数则仍有明显差距. 论文主文也承认 finetune-30 相对实验误差低于 20%, 并没有声称扩散系数完全等同于 scratch-900.

此外, 这些经典核 MD 没有包含核量子效应. 作者指出 $g_\mathrm{OH}$ 和 $g_\mathrm{HH}$ 第一峰展宽不足与这一缺失有关.

## 结构到性质的迁移

::: details 英文原文: 势函数预训练为什么能迁移到性质预测
> "Such data contains the rich dynamics of off-equilibrium systems, presenting a wealth of complex information for deep learning models to learn from. This pre-training enables the model to extract expressive features of materials to accommodate domain-specific property data, facilitating the application to a wide range of downstream tasks beyond atomistic simulations."

作者把迁移能力归因于非平衡数据中包含的丰富局部环境, 而不只是模型参数量. 这些环境先用于学习能量, 力和应力, 随后形成的结构表征再接新的 readout head. 因而下游微调不是从原子序数和坐标重新学习全部化学规律, 而是在已有表征上学习特定性质的映射.

原文定位: 主文 Results, MatterSim as a direct property predictor, 第 1 段.
:::

MatterSim 还把原子节点特征汇聚成结构表征. 对包含 $N$ 个原子的图, 可以使用求和或均值 readout:

$$
\boldsymbol{\kappa}_{\mathcal{G}}
=\begin{cases}
\displaystyle\sum_{i=1}^{N}\boldsymbol{v}_i,
&\text{求和};\\
\dfrac{1}{N}\displaystyle\sum_{i=1}^{N}\boldsymbol{v}_i,
&\text{均值}.
\end{cases}
$$

再接 MLP 直接预测带隙, 模量, 折射率, 最高光学声子频率或剥离能. Graphormer 微调结果如下:

| 任务 | 从头训练 | MatterSim 微调 | 当时的 specialized model |
| --- | ---: | ---: | ---: |
| MP Gap, eV | 0.3031 | **0.1290** | 0.1559 |
| $\log G_\mathrm{VRH}$ | 0.0895 | **0.0608** | 0.0670 |
| $\log K_\mathrm{VRH}$ | 0.0687 | **0.0488** | 0.0491 |
| Dielectric | 0.3823 | **0.2516** | 0.2711 |
| Phonons, cm⁻¹ | 65.8220 | **26.0220** | 28.7606 |
| jdft2d, meV/atom | 47.8040 | **32.7620** | 33.1918 |

预训练同时改善 M3GNet 和 Graphormer, 说明收益不只来自大模型架构. 不过论文也提到, 写作期间出现的多任务预训练模型已经在这些任务上取得更好结果. 所以这里更合理的结论是 "原子势预训练产生可迁移表征", 而不是 "MatterSim 永久占据所有 Matbench 任务第一".

## 本章结论

<div class="verdict">
迁移实验展示了三种不同价值. 主动学习节省目标构型区域的 DFT 标注, 跨理论层级微调纠正 PBE 本身的系统偏差, 性质微调复用大规模原子环境表征. 液态水 RDF 是本章最有说服力的结果, 因为它验证了长时间模拟产生的分布, 而不只是随机测试帧上的 MAE.
</div>
