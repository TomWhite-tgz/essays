---
title: 1. 从势能面到多任务
description: 理解 MatterSim-MT 为什么要从势能面扩展到电荷, 磁矩和响应张量.
---

# 1. 从势能面到多任务

## 势能面给了我们什么

对原子种类 $\boldsymbol{Z}$, 原子坐标 $\boldsymbol{R}$ 和晶胞 $\boldsymbol{L}$, 一个保守原子模型首先学习总能量:

$$
E=E(\boldsymbol{Z},\boldsymbol{R},\boldsymbol{L}).
$$

力是能量对坐标的负梯度, 应力则描述能量对晶胞应变的响应:

$$
\boldsymbol{F}_i=-\dfrac{\partial E}{\partial \boldsymbol{r}_i},
\qquad
\boldsymbol{\sigma}=\dfrac{1}{V}\dfrac{\partial E}{\partial \boldsymbol{\epsilon}}.
$$

这三个量构成机器学习原子间势的标准输出. 它们可以完成结构松弛和分子动力学, 也可以通过有限位移得到力常数, 再计算声子谱. 如果在多个体积上重复声子计算, 还可以用准谐近似估计振动自由能和有限温相稳定性.

换句话说, 一个足够准确的势能面同时编码了地形高度, 坡度和局部曲率. MatterSim v1 的大量能力都来自这条链.

## 势能面没有唯一确定什么

能量函数把电子自由度压缩成核坐标的一个标量. 即使两个电子结构给出相近的总能量, 它们的局域电荷, 自旋密度和对外电场响应也可能不同. 仅知道无外场条件下的 $E(\boldsymbol{R})$, 通常不能恢复以下量:

- Bader 电荷, 即电子密度按零通量表面划分后分配给各原子的净电荷.
- 原子磁矩, 即自旋密度在原子区域内的积分或计算流程给出的局域磁性标签.
- Born 有效电荷, 即极化对原子位移的导数.
- 高频介电矩阵, 即电子极化对宏观电场的线性响应.

Born 有效电荷可以写成:

$$
Z^{*}_{\kappa,\alpha\beta}
=\Omega\left.\dfrac{\partial P_\alpha}{\partial u_{\kappa\beta}}\right|_{\boldsymbol{\mathcal{E}}=0}.
$$

这里 $u_{\kappa\beta}$ 是第 $\kappa$ 个原子沿方向 $\beta$ 的位移, $P_\alpha$ 是极化分量, $\Omega$ 是晶胞体积. 它不是静态离子价态, 而是原子移动时引起宏观极化变化的动态响应量.

高频介电矩阵可以概括为:

$$
\varepsilon_{\infty,\alpha\beta}
=\delta_{\alpha\beta}
+\left.\dfrac{1}{\varepsilon_0}\dfrac{\partial P_\alpha}{\partial \mathcal{E}_\beta}\right|_{\boldsymbol{u}}.
$$

下标 $\infty$ 表示只让电子响应, 不让离子在电场下继续移动. 因此, $Z^*$ 和 $\boldsymbol{\varepsilon}_\infty$ 提供的是势能面之外的响应信息.

::: details 英文原文: 论文如何定义统一表征的目标
> "The model learns a unified atomic representation trained to jointly predict multiple physical properties derived from first-principles calculations across a large range of materials."

关键词是 unified atomic representation 和 jointly predict. 论文并没有为每一种性质分别训练完全独立的网络, 而是让它们共享原子级 backbone. 这相当于假设局域几何, 元素环境和电子响应之间存在可迁移的共同特征, 少量任务标签可以利用 35 M 势能面构型学到的结构表征.

原文定位: 主文 Introduction, 第 4 段第 2 句.
:::

## 多任务真正增加了哪条因果链

标准 MLIP 的模拟链是:

$$
(\boldsymbol{Z},\boldsymbol{R},\boldsymbol{L})
\longrightarrow E
\longrightarrow \boldsymbol{F},\boldsymbol{\sigma}
\longrightarrow \text{trajectory}.
$$

MatterSim-MT 希望把它扩展成:

$$
\begin{aligned}
(\boldsymbol{Z},\boldsymbol{R},\boldsymbol{L})
&\longrightarrow \text{shared atomic representation},\\
&\longrightarrow E,\boldsymbol{F},\boldsymbol{\sigma},\\
&\longrightarrow q_\mathrm{Bader},\mu,Z^*,\boldsymbol{\varepsilon}_\infty.
\end{aligned}
$$

第一行的共享表征驱动原子运动. 第二组新增输出则给轨迹中的每个构型附加电子或响应信息. 这样, 模型不仅回答 "原子下一步往哪里走", 还可以回答 "移动造成多大极化", "氧原子的电荷怎样变化" 或 "局域磁矩由谁承担".

## 四类新增量分别服务什么问题

| 输出 | 物理含义 | 论文中的用途 |
| --- | --- | --- |
| Bader 电荷 $q_i$ | 电子密度的原子分区 | 跟踪富锂正极脱锂时氧从离子态走向近中性 $\mathrm{O}_2$ |
| 磁矩 $\mu_i$ | 局域自旋极化 | 判断初始脱锂阶段 Mn 是否承担主要氧化还原 |
| Born 有效电荷 $Z_i^*$ | 原子位移引起的极化响应 | 构造 SiC 的非解析声子修正, 也把 BaTiO3 位移映射为极化 |
| 介电矩阵 $\boldsymbol{\varepsilon}_\infty$ | 电子对外电场的屏蔽 | 与 $Z^*$ 一起决定极性晶体的 LO-TO splitting |

这里有一个重要区别. Bader 电荷和磁矩是每个原子的标量标签, 而 Born 有效电荷是每个原子的二阶张量, 介电矩阵是整个晶体的二阶张量. 后两者必须在旋转坐标系时按张量规律变化, 不能用普通标量回归头随意输出 9 个互不相关的数字.

::: details 英文原文: 三类案例为什么不是普通 PES benchmark
> "We illustrate these multi-task capabilities through three case studies spanning vibrational spectroscopy, ferroelectric switching, and electrochemical redox, each requiring a distinct combination of property predictions."

作者刻意选择了三种组合方式. SiC 同时需要力常数, $Z^*$ 和 $\boldsymbol{\varepsilon}_\infty$. BaTiO3 需要力和 $Z^*$ 把外电场耦合进动力学. 富锂正极则需要轨迹, Bader 电荷和磁矩共同区分阳离子与阴离子氧化还原. 因而案例的价值不只是任务头各自 MAE 较低, 而是多个输出在一个模拟流程中形成闭环.

原文定位: 主文 MatterSim-MT as a multi-task materials foundation model, 第 2 段末句.
:::

## 这里的 foundation model 应该怎样理解

这篇论文使用 foundation model 主要表达三件事:

1. 预训练数据覆盖大量元素, 构型和热压条件.
2. 一个共享表征服务多个性质与模拟流程.
3. 模型可以通过微调或主动学习适配新理论层级和新体系.

它与语言模型的相似处在于预训练和迁移, 不在于输入输出形式. 原子模型受平移, 旋转, 周期性和能量守恒等物理约束, 而且部署时常要连续调用数百万次. 因此, 参数越大不必然越实用. 论文最终在主要案例中使用 10 M 参数版本, 正是因为模拟吞吐量是基础模型概念必须面对的约束.

## 本章结论

MatterSim-MT 的研究问题可以精确表述为: 如何在保留大范围势能面模拟能力的同时, 用共享且满足几何变换规律的原子表征预测额外电子和响应性质, 从而让模型完成 PES-only 工作流无法完成的模拟.

下一章将审查这个共享表征实际看到了什么数据, 特别是 35 M 势能面标签与几千个响应张量标签之间的巨大不平衡.
