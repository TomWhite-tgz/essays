---
title: 1. 问题与核心思想
description: 从势能面和分布偏移理解 MatterSim.
---

# 1. 问题与核心思想

## 原子模型究竟在学习什么

给定原子序数 $\boldsymbol{Z}$, 原子位置 $\boldsymbol{R}$ 和晶胞 $\boldsymbol{L}$, 第一性原理计算可以给出体系总能量:

$$
E=E(\boldsymbol{Z},\boldsymbol{R},\boldsymbol{L}).
$$

把位置和晶胞所有可能取值组成的高维空间想象成一张地形图, 高度就是能量. 这张地形图就是势能面 (potential energy surface, PES). 稳定晶体位于谷底附近, 化学反应和相变需要跨过山脊, 液体和高温结构则在更广的区域运动.

力不是另一个独立物理量, 而是能量对原子位置的负梯度:

$$
\boldsymbol{f}_i=-\dfrac{\partial E}{\partial \boldsymbol{r}_i}.
$$

应力与能量对晶格应变 $\boldsymbol{\varepsilon}$ 的响应有关:

$$
\boldsymbol{\sigma}=\dfrac{1}{V}\dfrac{\partial E}{\partial \boldsymbol{\varepsilon}}.
$$

所以一个机器学习势真正需要学习的是势能面的形状. 能量决定地形高度, 力决定局部坡度, 应力决定改变晶胞时地形怎样变化.

## 为什么只学习平衡晶体不够

::: details 英文原文: 当前数据库为什么限制模型
> "However, the property of a potential candidate material not only depends on its chemical composition and corresponding near-equilibrium atomic structure, but also on thermodynamic conditions including temperature and pressure. This results in a requirement of high predictive accuracy over an enormous configuration space well beyond the ground states or local minima of crystal structures typically captured by current databases and models, which fundamentally limits their applicability for materials design."

第一句把材料性质的决定因素从成分和近平衡结构扩展到温度与压力. 第二句给出论文真正要解决的矛盾: 实际模拟访问的构型空间远大于常规晶体数据库覆盖的局部极小值区域. 因此, MatterSim 的研究问题不是简单增加元素数量, 而是扩大势能面的有效覆盖范围.

原文定位: 主文 Introduction, 第 2 段末尾.
:::

公开材料数据库中的结构通常来自以下过程:

1. 从实验结构或枚举结构开始.
2. 使用 DFT 松弛原子位置和晶胞.
3. 保存松弛终点或松弛轨迹.

这会产生明显的数据偏置. 大量样本集中在局部极小值附近, 高能和高应力区域样本较少. 如果模型只见过谷底, 它可以在谷底附近插值, 但一旦 MD 把原子带到山坡或另一个盆地, 外推误差就可能把模拟推向不物理的构型.

这也是为什么 "测试集能量 MAE 很低" 不必然意味着 "长时间 MD 稳定". 一个随机拆分的测试集往往与训练集共享相似的材料和相似的松弛轨迹, 只能检查邻近插值.

## 温度和压力如何扩大构型空间

温度升高时, 原子的动能增加, 系统会访问距离平衡位置更远的构型. 压力升高时, 晶胞缩小, 原子间距进入训练数据中少见的短程排斥区域. 相变和熔化又会改变配位环境与对称性.

因此有限温压泛化可以写成一个分布覆盖问题:

$$
\mathcal{D}_\mathrm{train}\supseteq
\left\{
(\boldsymbol{Z},\boldsymbol{R},\boldsymbol{L})
\mathrel{\big|}
\text{目标模拟可能访问}
\right\}.
$$

当然, 实际训练集不可能穷尽这个集合. MatterSim 的策略是让当前模型帮助寻找其中最值得标注的部分.

## MatterSim 的核心闭环

::: details 英文原文: 主动学习闭环怎样运作
> "This trained model then functions as an effective surrogate to the first-principles method, guiding the materials explorer to gather more structures, thereby exploring the most uncertain regions of materials space to enrich the samples for model training. These sampled structures will also be labeled by the first-principles supervisor to provide additional training signals to the model following an active learning loop."

这里的先后关系很重要. 已训练模型先代替 DFT 扫描大量候选, 再用不确定性找出模型最不熟悉的区域. 只有被选中的结构接受昂贵 DFT 标注并返回训练集. 这解释了为什么主动学习既能扩大覆盖, 又能减少重复标注.

原文定位: 主文 Results, Learning the materials space under first-principles supervision, 第 1 段.
:::

论文的方法可以压缩成 5 个步骤:

1. 用已有材料数据库和内部生成结构训练一个模型集合.
2. 使用 ground-state explorer 和 off-equilibrium explorer 产生新构型.
3. 让 5 个不同初始化的模型预测同一构型.
4. 将模型分歧较大的构型视为高不确定性样本.
5. 用 VASP 计算这些构型的能量, 力和应力, 加入数据集后重新训练.

这不是普通的数据扩增. 普通数据扩增通常预先规定随机扰动. 主动学习则让模型暴露自己的知识边界, 将昂贵的 DFT 预算集中到边界附近.

![MatterSim 数据覆盖与主动学习闭环](/images/mattersim/data-overview.png)

<p class="figure-note">原论文图 2. 左侧是数据生成闭环, 中间比较应力与有效温度分布, 右侧汇总若干任务的相对表现.</p>

## "有效温度" 不等于物理温度

::: details 英文原文: 作者对 effective temperature 的限定
> "We note that the effective temperature should not be direcly interpreted as the physical temperature or the temperature employed in the simulations, instead it is an intuitive metric to measure the energy distribution of the dataset."

作者明确否定了把 $T_\mathrm{eff}$ 当成真实模拟温度的解释. 它只是把一个结构相对固定晶胞局部极小值的能量差除以 Boltzmann 常数, 用 Kelvin 作为能量分布的直观尺度. 因此, 图 2b 横轴覆盖到约 20000 K, 不代表模型在 20000 K 下经过了热平衡验证.

原文定位: 补充材料, Temperature and pressure distribution, 最后一句. 原文中的 `direcly` 是作者源码拼写, 此处未修改.
:::

补充材料为了比较不同数据集偏离局部极小值的程度, 定义了有效温度. 对给定结构, 先计算其每原子能量 $\varepsilon$, 再固定晶胞松弛原子位置, 得到局部极小值能量 $\varepsilon_0$, 最后定义:

$$
T_\mathrm{eff}=\dfrac{\varepsilon-\varepsilon_0}{k_\mathrm{B}}.
$$

这个量把 "高出局部谷底多少能量" 换算成 Kelvin 单位. 它便于画数据分布, 但不等于结构由某个热平衡系综在 $T_\mathrm{eff}$ 下采样得到. 一个受到强烈畸变的静态结构也可以有很高的 $T_\mathrm{eff}$.

::: danger 常见误读
不能从 "训练数据的有效温度覆盖到约 20000 K" 推出 "模型在 20000 K 的真实热力学模拟中可靠". 论文明确声明有效温度只是能量偏离指标. 主文声称的目标模拟范围是 0 至 5000 K.
:::

## 为什么同一个势可以导出多种性质

如果模型正确重建了势能面, 许多物理量可以由同一个 $E(\boldsymbol{R},\boldsymbol{L})$ 导出:

| 势能面的信息 | 可计算的性质 |
| --- | --- |
| 极小值的位置和深度 | 稳定结构, 形成能, 凸包 |
| 一阶导数 | 原子受力, 结构松弛, MD |
| 二阶导数 | 力常数, 声子频率 |
| 对体积和应变的响应 | 应力, 体模量, 高压焓 |
| 不同体积下的声子谱 | 振动自由能, 热膨胀, 相边界 |

这解释了论文为何用声子, 体模量, 自由能和 MD 做交叉验证. 它们不是互不相关的 benchmark. 它们从不同角度检验同一张势能面是否具有正确的局部曲率, 体积依赖和长轨迹稳定性.

## 本章结论

MatterSim 把通用 MLIP 的主要矛盾定义为 "训练构型覆盖不足", 特别是温度和压力诱导的非平衡构型不足. 网络结构仍然重要, 但论文最关键的因果链是:

$$
\text{主动探索更广构型}
\longrightarrow
\text{统一 DFT 标注}
\longrightarrow
\text{更完整的势能面}
\longrightarrow
\text{更可靠的有限温压性质}.
$$

下一章将检查这条因果链的第一环, 即数据究竟怎样生成, 其覆盖声明又有什么边界.
