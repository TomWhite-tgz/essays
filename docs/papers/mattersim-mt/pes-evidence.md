---
title: 4. 势能面能力与迁移
description: 审查 MatterSim-MT 的声子, 自由能, 高压相图, 主动学习和微调证据.
---

# 4. 势能面能力与迁移

## 为什么先验证传统 MLIP 能力

多任务输出只有在轨迹本身可信时才有意义. 如果能量面错误, 原子会访问错误构型, 此时沿轨迹预测的电荷和磁矩即使逐点误差不大, 整个物理过程仍可能错误. 因此论文先把 MatterSim-MT 当作传统机器学习原子间势, 检查它是否能预测结构, 动力学和热力学.

![MatterSim-MT 的势能面案例与迁移结果](/images/mattersim-mt/pes-capabilities.png)

<p class="figure-note">原论文图 2. 从左到右展示 La-H 高压稳定性, MgO 相边界, Li2B12H12 主动学习和液态水跨理论层级微调.</p>

## 基础误差表并不是全胜

补充材料在 5 个数据集上比较能量, 力和应力 MAE. MatterSim-MT-10M 在 MPF-TP, Random-TP, Extended-TP 和 HEX 的能量误差上最好, 在 MPF-TP, Extended-TP 与 HEX 的应力误差上最好. 但 OMat24 在 MPF-Alkali-TP 的三项指标, 以及多个集合的力误差上更低.

几个代表数字如下:

| 测试集 | 指标 | MatterSim-MT-10M | 最佳对照 | 审读 |
| --- | --- | ---: | ---: | --- |
| MPF-TP | Energy, eV/atom | 0.042 | 0.126 | MatterSim-MT 最低 |
| MPF-TP | Force, eV/Å | 0.530 | 0.233 | OMat24 更低 |
| Extended-TP | Energy, eV/atom | 0.054 | 0.781 | MatterSim-MT 最低 |
| Extended-TP | Stress, GPa | 3.274 | 65.847 | MatterSim-MT 最低 |
| HEX | Stress, GPa | 8.536 | 20.902 | MatterSim-MT 最低 |

Extended-TP 上部分基线出现极大误差, 说明极端构型会让分布外模型发生灾难性失效. 这支持扩大温压与非平衡覆盖的必要性. 但这些 benchmark 多数由作者内部流程生成, 只有 HEX 是公开数据, 因此读者需要把 "在作者目标分布上优势明显" 与 "在所有公共材料任务上普遍最好" 区分开.

## 声子检验势能面的二阶局部形状

有限位移法对原子施加小位移, 用预测力估计二阶力常数. 最大声子频率 MAE 为 1.016 THz, 优于表中其他模型. 最大声子群速度 MAE 为 22.895 km/s, 也低于对照模型的 39.930 至 168.386 km/s.

::: details 英文原文: 声子与群速度结果
> "For phonon frequency prediction, MatterSim has achieved an accuracy of slightly above 1 THz. In addition, the phonon group velocities predicted with MatterSim are 3–5-fold better than those of other models."

最大频率主要检查最高曲率模式, 群速度则是频率对波矢的导数, 对色散关系的形状更敏感. 两项同时改善说明模型不只拟合单点能量, 也较好地恢复了局部曲率及其在 Brillouin zone 中的变化. 但这里的参考 PhononDB 使用 PBEsol, 而主预训练主要使用 PBE, 所以剩余误差混合了模型误差和理论设置差异.

原文定位: 补充材料 Benchmarks, Phonons and group velocities.
:::

## 从声子到有限温自由能

准谐近似允许声子频率随体积变化. 对每个体积计算静态能量与振动贡献, 再在给定温度与压力下对体积取最小值:

$$
G(T,P)=\min_V\left[U(V)-TS(T,V)+PV\right].
$$

论文用 300 K 到 900 K 的 Gibbs 自由能变化与 DFT 比较. MatterSim-MT-10M 的 $\Delta\Delta G$ MAE 为 18.504 meV/atom, 低于对照模型. 1.3 B 版本进一步降到 9.62 meV/atom.

这里的证据比单纯能量 MAE 更强, 因为误差会经过结构松弛, 多个体积, 有限位移, 声子谱和温度积分逐层传播. 一个在单点测试上看似很小的系统偏差, 可能在自由能差中累积并改变相稳定性排序.

## La-H 凸包检验压力依赖的相稳定性

对 La-H 体系, 作者计算不同压力下的形成焓凸包. MatterSim-MT 预测 $\mathrm{LaH}_{10}$ 在约 150 GPa 稳定, 并再现 $\mathrm{LaH}_2$ 在一段压力区间内去稳定的行为.

::: details 英文原文: LaH10 案例的核心结果
> "A comparison with several publicly available foundational uMLIPs on the La-H convex hull (Fig. S11) shows that MatterSim-MT faithfully reproduces stabilization of LaH10 under pressure at ∼150 GPa, while others either predict premature stabilization or exhibit qualitatively different behavior at elevated pressures."

这个案例检验的不是一个结构的绝对能量, 而是多个化学计量比和多个候选相之间随压力变化的相对焓. 任何成分相关的系统偏差都可能改变凸包. MatterSim-MT 能给出正确的稳定化趋势, 与其训练集中广泛的高压和短原子间距构型相呼应.

原文定位: 主文 MatterSim-MT as a machine learning interatomic potential, La-H 段落.
:::

论文称传统 DFT 或实验需要数月, MatterSim-MT 在数分钟内完成预测. 这是势模型相对于 DFT 的合理速度优势, 但正文没有在该处给出硬件, 候选结构数量和完整 wall-clock 对照. 因此, "分钟" 应视为案例量级描述, 不应脱离计算设置变成通用加速比.

## MgO 相边界检验温度与压力共同作用

MgO 在高压下从 B1 转变为 B2 结构. 论文把相边界延伸到 10000 K 与 500 GPa, 并与实验及 DFT 结果比较. 这已经超过训练时明确列出的 5000 K, 因而高温端包含外推.

相边界依赖两相 Gibbs 自由能之差为 0 的位置. 模型需要同时处理:

1. 两个晶体结构的静态焓.
2. 不同体积下的声子与振动熵.
3. 高压下能量对体积的陡峭响应.
4. 高温下自由能差的小量相减.

论文图中的边界形状与 DFT 和实验总体一致, 而若干公共 uMLIP 没有捕捉到温度依赖. 这是 MatterSim-MT 高温高压数据覆盖最有说服力的工作流级证据之一. 但极高温下准谐近似自身忽略强非谐与熔化效应, 模型势能面准确不等于近似理论在全部相区都准确.

## 主动学习是扩展, 不是重新预训练

论文在熔融磷, 熔融硼和 $\mathrm{Li}_2\mathrm{B}_{12}\mathrm{H}_{12}$ 上测试不确定性驱动主动学习. 以最后一个体系为例, 主动学习模型只使用从头训练数据量的 6.6%, 就达到相近的力误差.

::: details 英文原文: 主动学习的数据效率
> "As shown in Fig. 2(c,d), the actively learned model matches the accuracy of a model trained from scratch while requiring only a fraction of the data—just 6.6% for Li2B12H12—confirming the broad configurational coverage of the pretrained model."

6.6% 说明预训练提供了很强的起点, 新标签主要修补特定体系轨迹中出现的局部盲区. 但它不是说任何新体系都固定只需 6.6% 数据. 所需比例取决于新体系与预训练分布的距离, 目标轨迹长度, 不确定性阈值和期望误差.

原文定位: 主文 MatterSim-MT as a machine learning interatomic potential, active learning 段落.
:::

## 液态水检验跨理论层级迁移

预训练使用的 PBE 对液态水通常过度结构化. 作者用 rev-PBE0-D3 数据微调 MatterSim-MT, 只需 60 个构型, 就得到与 900 个构型从头训练模型相近的径向和角分布. 自扩散系数预测为 $0.193\pm0.011$ Å$^2$/ps, 实验范围约为 0.23 至 0.24 Å$^2$/ps.

::: details 英文原文: 60 个构型与 900 个构型的比较
> "With only 60 configurations, the fine-tuned model predicts the structural and dynamical properties of water as accurate as a model trained from scratch on 900 configurations."

这个结果说明 backbone 学到的一部分局域几何表示可以跨越交换相关泛函迁移. 但微调后的目标仍是 rev-PBE0-D3, 与实验的一致性取决于该理论层级本身. 模型没有通过微调直接学习实验, 所以 20% 左右的扩散系数偏差不应全部归因于机器学习误差.

原文定位: 主文 MatterSim-MT as a machine learning interatomic potential, 最后一段.
:::

## 本章结论

势能面部分的证据链较完整: 单点误差, 声子导数, 自由能积分, 高压相稳定性, 主动学习和跨理论层级微调覆盖了不同失效模式. 最强结论是模型在作者设计的高温高压与非平衡分布上明显稳健, 并能作为新体系的有效初始化. 更宽泛的 "所有材料和条件下通用最优" 则没有被这些实验直接证明.
