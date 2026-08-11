---
title: 全部数学公式
description: 逐式解释晶体表示, 开路电压, 能量近似与理论比容量.
---

# 全部数学公式

论文主文共有 5 个编号公式. 式 (1) 描述 MatterGen 的晶体输入, 式 (2) 至式 (4) 连接 DFT 能量与电压, 式 (5) 给出理论质量比容量.

## 式 (1): 晶体的联合表示

原文写为

$$
M=(A,X,L). \tag{1}
$$

三个分量分别是:

$$
\begin{aligned}
A&=[a^0,a^1,a^2,\cdots,a^N],\\
X&=[x^1,x^2,\cdots,x^N]\in[0,1)^{3\times N},\\
L&=[l^1,l^2,l^3]\in\mathbb{R}^{3\times 3}.
\end{aligned}
$$

$A$ 是晶胞内各原子的元素类型. $X$ 是分数坐标, 每一列给出一个原子相对于晶格基矢的位置. $L$ 的三列是晶格向量. 第 $i$ 个原子的笛卡尔坐标为

$$
\mathbf{r}_i=L\mathbf{x}_i.
$$

分数坐标限制在 $[0,1)$, 是因为相差整数晶格平移的点代表同一周期位置. 一个简单例子是 $\mathbf{x}$ 与 $\mathbf{x}+(1,0,0)^{\mathsf T}$ 在无限周期晶体中等价.

式 (1) 的真正作用是说明 MatterGen 必须联合生成离散元素 $A$, 周期位置 $X$ 和晶胞 $L$. 只生成组成无法确定结构, 只生成坐标而没有晶胞也无法定义真实距离. 论文没有在这里重新推导扩散过程, 而是直接调用预训练 MatterGen.

::: warning 原文索引的小问题
原文把总原子数写为 $N$, 同时列出 $a^0$ 到 $a^N$. 按通常索引这会有 $N+1$ 项. 更一致的写法应为 $a^1$ 到 $a^N$, 或把总数定义为 $N+1$. 这不影响模型思想, 但属于记号不严谨.
:::

## 式 (2): 自由能与平均电压

原文印刷公式是

$$
V=\dfrac{\Delta G}{nF}. \tag{2}
$$

$V$ 是平均电压, $n$ 是转移电子数, $F=96485\,\mathrm{C\,mol^{-1}}$ 是 Faraday 常数, $\Delta G$ 是每摩尔反应的 Gibbs 自由能变化. 量纲为

$$
\dfrac{\mathrm{J\,mol^{-1}}}{\mathrm{mol}\,\mathrm{e^-}\times\mathrm{C\,mol^{-1}}}
=\dfrac{\mathrm{J}}{\mathrm{C}}
=\mathrm{V}.
$$

关键在符号. 若把放电反应写成

$$
\mathrm{MX}_2+x\mathrm{Li}\longrightarrow\mathrm{Li}_x\mathrm{MX}_2,
$$

自发放电时 $\Delta G_{\mathrm{discharge}}<0$, 标准电化学关系应为

$$
V=-\dfrac{\Delta G_{\mathrm{discharge}}}{xF}.
$$

原文式 (2) 没有负号. 它只有在 $\Delta G$ 被定义为相反方向的能量差, 即脱锂产物减去嵌锂反应物的正值时, 才能直接得到正电压. 原文文字只说 Gibbs free energy change, 没有明确反应方向, 因而式 (2) 存在符号约定未交代清楚的问题.

还要注意, 这里算的是相对于 Li 金属负极的平均平衡电压, 不是有限电流下含极化和内阻损失的工作电压.

## 式 (3): 用 DFT 总能近似自由能

原文写为

$$
V=\dfrac{\Delta E}{nF}. \tag{3}
$$

这是用零温 DFT 能量差近似 Gibbs 自由能差:

$$
\Delta G=\Delta E_{\mathrm{DFT}}+\Delta E_{\mathrm{ZPE}}-T\Delta S+P\Delta V.
$$

固体反应中 $P\Delta V$ 通常很小, 振动熵和零点能相对数 eV 的反应能也常是次要修正, 所以高通量筛选常取

$$
\Delta G\approx\Delta E_{\mathrm{DFT}}.
$$

但这不是恒等式. 若两个状态的声子谱, 无序程度或相组成差异明显, 熵修正可能改变几十至数百 mV. 此外 PBE 总能还带有交换关联泛函, 磁态和过渡金属电子局域化误差.

式 (3) 继承式 (2) 的符号问题. 如果 $\Delta E$ 定义为放电反应能, 需要负号. 如果定义为脱锂代价, 正号可以成立.

## 式 (4): 单个 Li 的能量差

原文公式是

$$
\Delta E=E_{\mathrm{LiMX}_2}-E_{\mathrm{MX}_2}-E_{\mathrm{Li}}. \tag{4}
$$

其中 $E_{\mathrm{LiMX}_2}$ 是嵌锂态总能, $E_{\mathrm{MX}_2}$ 是完全脱锂态总能, $E_{\mathrm{Li}}$ 是体相 Li 的单原子能量. 右侧恰好是放电反应

$$
\mathrm{MX}_2+\mathrm{Li}\longrightarrow\mathrm{LiMX}_2
$$

的 DFT 反应能. 对稳定放电反应, 这个值通常为负. 因而把式 (4) 直接代入没有负号的式 (3) 会得到负电压. 论文表 1 报告的电压为正, 说明实际计算很可能取了相反号, 或代码内部采用了脱锂方向. 这是本文五个公式中最实质的记号矛盾.

对包含 $x$ 个可脱出 Li 的一般化合物, 更完整的平均电压写法是

$$
\bar V=-\dfrac{E(\mathrm{Li}_xH)-E(H)-xE(\mathrm{Li})}{xF},
$$

其中 $H$ 表示不含可移动 Li 的主体骨架. 在常用的 eV 与每电子单位下, 数值上每转移一个电子的 eV 能量差对应相同数值的 V, 不必在数值程序里再次显式乘除基本电荷.

若存在两个相邻嵌锂状态 $x_1>x_2$, 分步平均电压应写为

$$
V(x_1\rightarrow x_2)=
-\dfrac{
E(\mathrm{Li}_{x_1}H)-E(\mathrm{Li}_{x_2}H)-(x_1-x_2)E(\mathrm{Li})
}{(x_1-x_2)F}.
$$

论文表 1 的 $U_{\mathrm{LSOC}}$ 和 $U_{\mathrm{HSOC}}$ 分别来自低荷电态端和高荷电态端的相邻脱锂步骤, $U_{\mathrm{eq}}$ 是整个允许区间的平均值. 它们不是连续电压曲线, 也不能显示两相平台, 固溶区或电压滞后.

## 式 (5): 理论质量比容量

原文写为

$$
C_{\mathrm{sp}}(\mathrm{mAh/g})=\dfrac{nF}{3.6M}. \tag{5}
$$

$n$ 是每个化学式单位可逆转移的电子数. 对每脱出一个 $\mathrm{Li^+}$ 且由外电路转移一个电子的反应, $n$ 等于可逆脱出的 Li 数. $M$ 是完全嵌锂化合物的摩尔质量, 单位为 $\mathrm{g/mol}$.

常数 3.6 来自

$$
1\,\mathrm{mAh}=10^{-3}\,\mathrm{A}\times3600\,\mathrm{s}=3.6\,\mathrm{C}.
$$

于是每摩尔活性材料的电荷为 $nF\,\mathrm{C/mol}$, 除以 $3.6\,\mathrm{C/mAh}$ 和 $M\,\mathrm{g/mol}$ 就得到 $\mathrm{mAh/g}$.

以 $\mathrm{Li_3V_4O_9}$ 完全脱出 3 个 Li 为例, 其摩尔质量约为

$$
M=3(6.94)+4(50.94)+9(16.00)=368.58\,\mathrm{g/mol}.
$$

因此

$$
C_{\mathrm{sp}}=
\dfrac{3\times96485}{3.6\times368.58}
\approx218.2\,\mathrm{mAh/g},
$$

与表 1 的 $218.03\,\mathrm{mAh/g}$ 一致. 这也反向确认作者对该材料假设完全脱出 3 个 Li.

式 (5) 给出的是活性材料质量归一化的理论上限. 它默认所计 Li 全部可逆, 不包含导电剂, 粘结剂, 集流体, 隔膜, 电解液和负极质量, 也不考虑动力学导致的不可达容量.

## 五个公式组成的逻辑链

$$
\begin{aligned}
(A,X,L)
&\longrightarrow E_{\mathrm{DFT}}(\text{各嵌锂状态})\\
&\longrightarrow \Delta E\approx\Delta G\\
&\longrightarrow V\\
&\longrightarrow C_{\mathrm{sp}}.
\end{aligned}
$$

这个链条只覆盖结构, 热力学电压和化学计量容量. 它没有从公式上给出功率密度, Li 迁移势垒, 电导率, 体积变化, 循环寿命或安全性.
