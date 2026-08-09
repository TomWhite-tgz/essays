---
title: 5. 多任务物理案例
description: 深入解释 SiC LO-TO splitting, BaTiO3 铁电回线和富锂正极氧化还原.
---

# 5. 多任务物理案例

## 先看四个 held-out MAE

| 任务 | MAE | 单位 |
| --- | ---: | --- |
| Bader 电荷 | 0.0233 | $e$ |
| 磁矩 | 0.0640 | $\mu_\mathrm{B}$ |
| Born 有效电荷 | 0.0756 | $e$ |
| 介电矩阵元素 | 0.2478 | 无量纲 |

这些数字说明任务头能在各自测试集上逼近标签, 但不同量的尺度与应用敏感度不同, 不能只按数值大小横向排序. 例如, LO-TO splitting 对 $Z^*$ 的平方与介电屏蔽都敏感, 一个看似较小的张量元素误差可能在特定软模或各向异性材料中被放大. 因此论文又设计了三个端到端案例.

![MatterSim-MT 超出势能面的三类物理案例](/images/mattersim-mt/multitask-capabilities.png)

<p class="figure-note">原论文图 3. (b) SiC 的 LO-TO splitting, (c) BaTiO3 的极化回线, (d) 富锂正极脱锂时的氧 Bader 电荷分布.</p>

## 案例一: SiC 的 LO-TO splitting

### 为什么普通力常数不够

在极性晶体的 $\Gamma$ 点附近, 纵向光学声子会产生宏观电场, 横向光学声子则具有不同的长程库仑响应. 仅用有限范围力常数构造的解析 dynamical matrix 无法完整描述这个方向依赖的非解析项.

长波极限下, 非解析修正的核心结构可以写成:

$$
D^{\mathrm{NA}}_{\kappa\alpha,\kappa'\beta}(\boldsymbol{q})
=\dfrac{4\pi e^2}{\Omega\sqrt{M_\kappa M_{\kappa'}}}
\dfrac{
(\boldsymbol{q}\cdot\boldsymbol{Z}^{*}_{\kappa})_\alpha
(\boldsymbol{q}\cdot\boldsymbol{Z}^{*}_{\kappa'})_\beta
}{\boldsymbol{q}\cdot\boldsymbol{\varepsilon}_\infty\cdot\boldsymbol{q}}.
$$

这里 $M_\kappa$ 是原子质量, $\Omega$ 是晶胞体积. 关键是分子中同时出现 $Z^*$ 与 $\boldsymbol{\varepsilon}_\infty$. 没有这两个任务头, PES 模型即使短程力常数准确, 也不能直接恢复正确的 LO-TO splitting.

::: details 英文原文: 非解析修正需要什么
> "LO-TO splitting is a hallmark of polar crystals but is absent in standard force-constant approaches. That is because it requires knowledge of the Born effective charge tensor Z* and the electronic dielectric matrix ε∞ to construct the non-analytical correction to the dynamical matrix."

作者把新增任务与一个明确缺失项一一对应, 这是全篇最干净的多任务因果证据. 短程力来自 PES, 长程宏观修正来自 $Z^*$ 和 $\boldsymbol{\varepsilon}_\infty$, 二者组合后才得到可与红外或 Raman 相关实验比较的极性声子谱.

原文定位: 主文 MatterSim-MT as a multi-task materials foundation model, SiC 案例第 1 段.
:::

### 数字是否对得上

在 0 GPa 下, MatterSim-MT 预测:

- $Z^*_{\mathrm{Si}}=2.71e$, 理论参考为 $2.72e$, 实验参考为 $2.70e$.
- $\varepsilon_\infty=7.31$, 理论参考为 7.02, 实验参考为 6.52.
- LO-TO splitting 为 5.26 THz, 与从头算差 0.06 THz, 与实验差 0.03 THz.

论文还把压力扩展到 100 GPa, LO 与 TO 频率随压力的趋势和实验一致. 属性标签本身没有包含如此高压的数据, 但势能面预训练见过高压构型. 这说明共享表示确实帮助属性头沿结构变化外推, 同时也意味着作者所说的 extrapolation 是对属性标签压力范围而言, 不是对全部预训练分布而言.

## 案例二: BaTiO3 的铁电回线

### 电场怎样进入原子动力学

铁电体有两个方向相反的稳定极化态. 外电场与极化耦合, 推动离子跨过势垒并翻转极化. 在小位移近似下, 电场对第 $i$ 个原子的附加力与 Born 有效电荷相关:

$$
\Delta\boldsymbol{F}_i
=\boldsymbol{Z}^{*}_i\boldsymbol{\mathcal{E}}.
$$

因此, 模拟需要两部分预测. PES 提供无外场力, $Z^*$ 把外电场转换为原子受力. 原子移动后, 模型再次更新力和响应, 由轨迹累计得到宏观极化.

::: details 英文原文: 为什么同时需要力与 Born 有效电荷
> "Simulating this behavior requires accurate interatomic forces and Born effective charges that relate atomic displacements to the macroscopic polarization."

这句话说明铁电案例不是在静态结构上回归一个 polarization 标签. 模型实际参与了带外场的有限温分子动力学. 回线的形状来自路径依赖, 势垒跨越和温度涨落, 因而比单个构型的 $Z^*$ MAE 更接近真实模拟使用方式.

原文定位: 主文 MatterSim-MT as a multi-task materials foundation model, BaTiO3 案例第 1 段.
:::

### 结果和偏差

模型再现了极化随电场扫描形成的 hysteresis loop, 并预测温度升高时 coercive field 降低. 300 K 下自发极化为 38 $\mu\mathrm{C}/\mathrm{cm}^2$, 实验约为 26 $\mu\mathrm{C}/\mathrm{cm}^2$.

作者把偏高主要归因于 PBE 的已知 underbinding. 这揭示一个重要层次:

$$
\text{experiment discrepancy}
=\text{DFT approximation error}
+\text{ML emulation error}
+\text{simulation approximation error}.
$$

模型对 DFT 标签很准, 不等于它对实验自动无偏. 若目标是定量预测 coercive field 或相变温度, 还需要对理论层级, 晶畴形核, 有限尺寸和电场扫描速率进行更严格控制.

## 案例三: 富锂正极的阳离子到阴离子氧化还原

### 模拟协议

作者对 $\mathrm{Li}_{1.2-x}\mathrm{Mn}_{0.8}\mathrm{O}_2$ 在 1000 K 下进行分步脱锂. 每 5 ps 移除一个 Li, 直到完全脱锂, 同时记录离子轨迹, Mn 磁矩和 O 的 Bader 电荷.

这个较高温度用于加速结构重排, 但不能直接等同于电池工作温度下的真实动力学时间尺度. 每 5 ps 人工移除 Li 也代表一种计算协议, 不是显式模拟电极电势, 电解液界面和电子化学势.

### 三个阶段怎样从输出中识别

1. 低脱锂程度时, Mn 磁矩约在 $3$ 至 $4\mu_\mathrm{B}$ 之间变化, 表明 Mn 是主要 redox center.
2. 当 $x\approx0.5$ 时, Mn 从过渡金属层的八面体位点迁移到锂层的四面体位点, 氧子晶格同时畸变.
3. 当 $x\approx0.9$ 时, 氧二聚体形成, 随后出现晶格内 $\mathrm{O}_2$ 分子. 这些分子的 Bader 电荷接近 0, 支持其接近中性分子氧而不是普通氧离子.

::: details 英文原文: 阳离子到阴离子氧化还原的主张
> "Our analysis shows a clear transition from cationic to anionic redox during lithium extraction. At low degrees of delithiation, Mn serves as the primary redox center, with magnetic moment changes of approximately 3–4 μB."

这段把磁矩任务连接到阳离子氧化还原. 仅观察几何结构无法可靠判断电子由谁失去, 而 Mn 局域磁矩随脱锂改变提供了电子自由度证据. 随后氧 Bader 电荷向 0 移动, 又为阴离子氧化和分子氧形成提供另一种标签.

原文定位: 主文 MatterSim-MT as a multi-task materials foundation model, 富锂正极案例结果段.
:::

::: details 英文原文: 分子氧判断依据
> "This is corroborated by the Bader charge analysis in Fig. 3(d), where the O2 molecules exhibit near-zero charges, confirming their molecular rather than ionic character."

这里的 confirming 应谨慎理解. 近零 Bader 净电荷与中性 $\mathrm{O}_2$ 一致, 再结合短 O-O 距离与轨迹中的二聚过程, 证据比单独看电荷更强. 但 Bader 电荷依赖电子密度分区, 不是严格氧化态算符. 更完整的电子结构确认还可以加入 O-O 键长, 自旋态, projected density of states 和差分电荷密度.

原文定位: 主文 MatterSim-MT as a multi-task materials foundation model, 最后一段.
:::

## 三个案例的证据强度比较

| 案例 | 不可缺少的新增输出 | 外部参照 | 证据强度 |
| --- | --- | --- | --- |
| SiC LO-TO splitting | $Z^*$, $\boldsymbol{\varepsilon}_\infty$ | 理论与高压实验频率 | 最强, 数量关系和压力趋势明确 |
| BaTiO3 铁电回线 | $Z^*$ | 实验自发极化与定性温度趋势 | 中等, 回线再现但定量偏差明显 |
| 富锂正极 redox | Bader 电荷, 磁矩 | 已知机制与轨迹内部一致性 | 有启发性, 但主要是单体系计算案例 |

## 本章结论

三类案例确实证明新增任务不是装饰性输出. 最有说服力的 SiC 案例给出了 PES-only 方法缺失的明确数学项和实验可核验结果. BaTiO3 展示了外场动力学接口, 富锂正极则展示了沿反应轨迹同步解释电子与结构演化的潜力. 但从三个案例推广到 "任意材料的多任务表征" 仍需要更广泛的公开 benchmark 和独立复现.
