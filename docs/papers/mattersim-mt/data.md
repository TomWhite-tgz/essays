---
title: 2. 数据, 主动学习与 scaling
description: 拆解 MatterSim-MT 的 35 M 构型, 多任务标签和 scaling 证据.
---

# 2. 数据, 主动学习与 scaling

## 先看数据账本

论文的数据不是单一来源, 也不是所有任务完整对齐. 补充材料给出的规模如下:

| 标签 | 结构数量 | 标签粒度 | 主要来源 |
| --- | ---: | --- | --- |
| 能量, 力, 应力 | 35 M | 结构标量, 原子向量, 结构张量 | 主动学习与第一性原理计算 |
| Bader 电荷 | 172488 | 每原子标量 | AFLOW |
| 磁矩 | 284195 | 每原子标量 | MPTrj, 假设铁磁序 |
| Born 有效电荷 | 3051 | 每原子 $3\times3$ 张量 | PhononDB 筛选集 |
| 高频介电矩阵 | 3051 | 每结构 $3\times3$ 张量 | PhononDB 筛选集 |

35 M 结构还对应约 450 M 个原子力向量. 这个数字说明平均每个构型有约 13 个原子, 但它不能直接表示化学多样性. 真正关键的是构型怎样从近平衡区域扩展到熔化, 压缩和相变区域.

::: details 英文原文: 数据集的完整数量说明
> "The dataset used to train MatterSim contains 35M structures labeled with energies, forces, and stresses, 172,488 with Bader charges, 3,051 with Born effective charges and dielectric matrices, and 284,195 with magnetic moments under ferromagnetic ordering."

这句话必须整体阅读. 论文标题中的 multi-task 很容易让人误以为 35 M 个结构都有多性质标注, 实际上响应张量数据只有 3051 个结构. 多任务迁移能否成立, 很大程度上取决于共享 backbone 能否把海量几何与势能面信息转化为小数据任务可利用的表示.

原文定位: 补充材料 Training Data, Off-equilibrium materials data, 第 2 段首句.
:::

## 两类 explorer 怎样扩大构型覆盖

数据生成沿用 MatterSim v1 的两类探索器:

- ground-state explorer 面向平衡或近平衡结构, 用多个模型的分歧从公共与内部候选中挑出信息量较高的结构.
- off-equilibrium explorer 面向远离平衡位置的结构, 在 0, 200, 500, 800 和 1000 GPa 下, 分别运行 300, 1000, 2000 和 5000 K 的 NPT 模拟, 每组条件运行 10 ps.

这形成一个闭环:

$$
\text{candidate structures}
\longrightarrow
\text{ensemble prediction}
\longrightarrow
\text{high uncertainty subset}
\longrightarrow
\text{DFT labels}
\longrightarrow
\text{updated model}.
$$

不确定性来自 5 个不同随机初始化模型的分歧. 能量分歧适合较小晶胞的整体异常, 力分歧可以捕捉只有少数原子进入陌生环境的局部异常. 主动学习的意义不是证明被舍弃样本都不重要, 而是在有限 DFT 预算下优先标注当前模型之间意见不一致的区域.

::: details 英文原文: 非平衡探索器的采样条件
> "The off-equilibrium explorer targets materials with off-equilibrium atomistic positions. It conducts molecular dynamics (MD) simulations under a wide range of pressures, including 0, 200, 500, 800, and 1000 GPa. Under each pressure, we simulate each material at 300, 1000, 2000, and 5000 K. For each temperature and pressure, the NPT simulation runs for 10 ps."

这里的温度和压力首先是采样条件, 其作用是把轨迹推到不同原子间距, 配位和相态. 模型真正接收的是这些条件产生的结构图. 论文补充材料把温度与压力列入图的全局状态变量 $\boldsymbol{S}$, 但广泛能力仍主要依赖构型覆盖, 不能把温压范围理解成两个可以脱离结构任意外推的控制旋钮.

原文定位: 补充材料 Materials explorer, Data exploration, 第 2 段.
:::

## effective temperature 只是构型能量尺度

为了把不同数据集放进同一张分布图, 作者定义有效温度. 先计算原始结构的每原子能量 $\varepsilon$, 再固定晶胞松弛原子位置得到 $\varepsilon_0$, 最后计算:

$$
T_\mathrm{eff}=\dfrac{\varepsilon-\varepsilon_0}{k_\mathrm{B}}.
$$

它衡量结构高出局部极小值多少能量. 一个静态随机畸变结构也可以有很高的 $T_\mathrm{eff}$, 即使它从未处于对应温度的热平衡系综.

::: details 英文原文: 作者对 effective temperature 的限定
> "We note that the effective temperature should not be directly interpreted as the physical temperature or the temperature employed in the simulations; instead, it is an intuitive metric to measure the energy distribution of the dataset."

因此, 数据分布图延伸到约 20000 K 不能被解释为模型已经在 20000 K 的物理模拟中验证. 论文主张的采样温度上限仍是 5000 K. 有效温度图能支持的结论只是这套数据包含更多远离局部极小值的高能构型.

原文定位: 补充材料 Training Data, Off-equilibrium materials data, effective temperature 定义之后.
:::

## t-SNE 图能说明什么, 不能说明什么

论文从各元素的原子 embedding 中抽样, 把本工作数据与 MPF2021, MPtrj, Alexandria 和 OMat24 合并后做 t-SNE. 蓝色点在若干区域超出橙色点, 作者据此说明新增数据访问了不同局域环境.

t-SNE 是二维可视化, 它保留局部邻域的能力强于保留全局距离. 因此, 蓝色区域更广可以作为构型多样性的定性证据, 但不能直接证明:

- 任意目标体系都落在训练分布内部.
- 两点在二维图上相近就具有相同误差.
- 覆盖面积更大必然造成所有任务的误差更低.

更可靠的证据仍要来自明确分布偏移的 benchmark, 长轨迹稳定性和下游物理量.

## scaling 图怎样读

![MatterSim-MT 的数据量与模型规模 scaling](/images/mattersim-mt/scaling.png)

<p class="figure-note">补充材料 scaling 图. 小模型较早饱和, 更大的 220 M 与 1.3 B 模型能继续利用增加的数据.</p>

作者训练了约 1 M, 10 M, 220 M 和 1.3 B 参数的版本. 主图展示 1 M, 10 M 和 220 M, 补充图加入 1.3 B. 随数据量增加, 验证损失总体下降; 小于 10 M 的模型较快进入容量瓶颈, 更大模型在 35 M 样本处仍有收益.

::: details 英文原文: 作者为何不在主案例使用最大模型
> "We further demonstrate scaling to 1.3B parameters; however, given the trade-off between computational cost and accuracy, all predictions and simulations in the main text use the 10M-parameter model."

这句话把 scaling 与部署分开. 1.3 B 模型证明增加容量仍能降低某些验证误差, 但 MD 每一步都要调用势函数, 一条轨迹可能需要百万次前向与反向计算. 因此, 主文选择 10 M 版本并不是 scaling 失败, 而是模拟任务的 Pareto 点与静态预测任务不同.

原文定位: 补充材料 Model architecture and training details, Training details, 最后一段.
:::

## scaling 证据还缺什么

图中的纵轴是 validation loss, 但没有在图注中充分拆分能量, 力, 应力和四个辅助任务. 因而它清楚支持 "训练目标继续改善", 却不能单独支持以下更强结论:

- 每个多任务性质都遵循相同 scaling law.
- 1.3 B 模型在长时间 MD 中比 10 M 更稳定.
- 增加数据与增加参数的收益可以外推到下一数量级.

论文给出了 1.3 B 模型在振动自由能上的一个具体改进, 误差从 10 M 的 18.50 meV/atom 降到 9.62 meV/atom. 这是比总验证损失更可解释的下游证据, 但还不是跨全部任务的 scaling 定律.

## 数据层面的审读结论

35 M 构型和主动学习闭环为势能面能力提供了坚实基础. 真正具有研究风险也最有趣的部分, 是用仅 3051 个结构的响应张量标签去支持跨材料与高压条件的 Born 有效电荷和介电预测. 后续模型页要检查架构如何编码这些张量, 证据页则要判断少量标签是否被案例验证充分.

