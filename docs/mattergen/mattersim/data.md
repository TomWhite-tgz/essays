---
title: 2. 数据与主动学习
description: MatterSim 的 1700 万构型, DFT 标签, 主动学习和不确定性.
---

# 2. 数据与主动学习

## 数据规模不是唯一重点

论文发布时报告约 1700 万个第一性原理标注构型. 单看数字容易错过真正重要的设计. MatterSim 同时改变了 3 个维度:

::: details 英文原文: 数据不是被动收集的
> "As of the date of publication, the training dataset contains ∼17M structures labeled with first-principles computations."
>
> "More importantly, the dataset contains on average 2 to 3-fold more distinct atomic environments across the entire periodic table compared to previous databases based on DFT relaxation of crystal structures, and 10-fold or even higher for certain elements especially for noble gas elements."

作者在这里同时陈述了规模和覆盖. 约 1700 万是结构数量, 2 至 3 倍是平均原子环境覆盖提升, 部分元素达到 10 倍或更高. 后两个数字更接近论文的机制性贡献, 因为大量重复的近平衡结构即使增加样本数, 也不能自动改善高温高压外推.

原文定位: 主文 Results, Learning the materials space under first-principles supervision, 第 3 段.
:::

- **化学覆盖**. 支持前 89 种元素, 并试图让元素对分布比公开松弛数据库更均匀.
- **构型覆盖**. 不只保留局部极小值附近的结构, 还采样熔化, 压缩和随机结构.
- **标签一致性**. 主要采用统一的 VASP, PBE 或 PBE+U 设置产生能量, 力和应力.

如果只有规模而没有后两点, 数据仍可能是大量重复的近基态结构.

## 两类材料探索器

### Ground-state explorer

它负责平衡态或近平衡态区域, 候选来自公共数据库和内部生成数据. 模型集合评估不确定性, 只选择信息量较高的结构进行 DFT 标注.

这个探索器服务于结构松弛, 形成能和凸包等任务. 它解决的是 "化学空间很大, 但没有必要重复标注大量相似晶体" 的问题.

### Off-equilibrium explorer

它通过 MD 主动离开局部能量极小值. 补充材料给出的采样方案包括 0, 500, 800 和 1000 GPa. 在每个压力下, 温度在 200 ps 内从 0 K 逐步升到 5000 K.

这个探索器让数据包含以下情形:

- 热振动幅度增大.
- 晶体熔化或无序化.
- 晶胞在高压下强烈收缩.
- 原子进入短程排斥区域.
- 配位环境发生改变.

这部分数据是 MatterSim 在 MPF-TP 和 Random-TP 上取得优势的直接前提.

## DFT 监督信号

作者使用 VASP 6.3.0, PAW 和 PBE 泛函. 平面波截断能为 520 eV, 总能量收敛阈值为每原子 $5\times10^{-5}$ eV. 对部分过渡金属氧化物和氟化物使用 Hubbard $U$ 修正.

每个构型保存 3 类标签:

$$
\mathcal{Y}=
\left(
e_\mathrm{DFT},
\boldsymbol{f}_\mathrm{DFT},
\boldsymbol{\sigma}_\mathrm{DFT}
\right).
$$

其中 $e$ 是每原子能量, $\boldsymbol{f}$ 是逐原子力, $\boldsymbol{\sigma}$ 是应力张量.

::: info 为什么同时学习力
一个包含 $N$ 个原子的构型只有一个总能量, 却包含 $3N$ 个力分量. 力提供势能面局部斜率的密集监督, 对结构松弛和 MD 尤其重要.
:::

## 不确定性怎样估计

MatterSim 训练 5 个随机初始化不同的模型. 对同一构型, 如果模型预测分歧较大, 就把分歧当作 epistemic uncertainty 的代理.

对能量可以使用模型间标准差. 对力, 主动学习实验中给出的指标是 5 个模型之间力分量标准差的最大值:

$$
u(\mathcal{X})=
\max_{i,\alpha}
\operatorname{Std}_{m=1,\cdots,5}
\left[f_{i\alpha}^{(m)}(\mathcal{X})\right].
$$

这里 $i$ 表示原子, $\alpha\in\{x,y,z\}$ 表示笛卡尔分量, $m$ 表示 ensemble 成员. 使用最大值意味着只要某一个原子的某一方向非常不确定, 整个构型就可能被选中.

![模型集合的不确定性与真实误差](/images/mattersim/uncertainty.png)

<p class="figure-note">补充材料图 S13. 横轴是不确定性, 纵轴是真实误差. 二者有区分能力, 但不确定性整体偏小.</p>

## 不确定性不是误差上界

论文明确指出 ensemble uncertainty 存在低估. 这意味着不能把 $u=0.1$ 解释成 "误差一定小于 0.1". 它更适合作为样本排序信号:

$$
u(\mathcal{X}_a)>u(\mathcal{X}_b)
\quad\Longrightarrow\quad
\mathcal{X}_a\text{ 更值得优先检查}.
$$

即便这种排序也不是严格保证. 如果 5 个模型因为共享数据偏差而一致犯错, ensemble 分歧可能很小, 真实误差却很大. 这被称为共同盲区.

## 三类有限温压 benchmark

作者新建了 3 个难度逐步增加的数据集. 它们均来自第一性原理 MD, 并使用与训练数据一致的 DFT 设置重新计算选定帧.

| 数据集 | 初始体系 | 目的 |
| --- | --- | --- |
| MPF-Alkali-TP | 50 个含碱金属和阴离子元素的化合物 | 测试离子导体相关环境 |
| MPF-TP | 从 MPF2021 随机选取 50 个化合物 | 测试一般材料的有限温压构型 |
| Random-TP | 在盒子内随机放置 20 个随机元素 | 测试极端的构型和化学外推 |

温度在 0 至 5000 K 间均匀采样, 压力在 0 至 1000 GPa 间按对数尺度采样. 每个体系运行 100 ps, 从最后 20 ps 均匀抽取 5 帧作最终 benchmark.

## 数据泄漏需要怎样理解

论文声称 benchmark 使用独立结构, 但公开文本没有提供足够信息来独立审计 1700 万训练构型与所有测试帧之间的近邻重合. 需要区分两种泄漏:

1. **完全相同的构型进入训练和测试**. 这属于直接泄漏, 应通过 ID 或结构哈希排除.
2. **相同材料, 相近轨迹或相似局部环境同时出现**. 这不一定违反数据划分, 但会让 "泛化" 更接近插值.

Random-TP 使用随机元素和随机初始位置, 能缓解第二种问题. 但它也构造出不一定具有实际材料意义的极端体系. 因而它更像压力测试, 不是应用分布的代表样本.

## 数据覆盖声明的边界

论文中的 "跨周期表" 不等于无条件覆盖所有化学:

- 当前模型支持前 89 种元素, 不是全部 118 种元素.
- Gd 和 Eu 的部分非平衡 DFT 计算因自洽收敛困难被排除.
- 训练数据主要是 homogeneous bulk systems.
- 表面, 界面和强长程相互作用体系没有被系统纳入训练.
- PBE 或 PBE+U 标签不包含更高理论层级的全部效应.

因此更准确的表述是: MatterSim 对广泛 bulk 元素组合和构型建立了统一的 PBE 级势能面近似, 并在若干未专门训练的体系上显示出一定零样本鲁棒性.

## 本章结论

MatterSim 的数据策略有两个真正值得复用的原则:

1. 用目标模拟可能访问的构型来定义训练分布, 而不是只从现成数据库出发.
2. 用模型集合的不确定性分配 DFT 预算, 减少在高置信度区域的重复标注.

下一章将分析两种 backbone 如何消费这些数据, 以及能量, 力和应力是否以物理一致的方式输出.
