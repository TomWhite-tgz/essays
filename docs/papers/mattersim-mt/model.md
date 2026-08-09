---
title: 3. 模型结构与损失函数
description: 拆解 MatterSim-MT 的材料图, invariant-equivariant Transformer 和多任务头.
---

# 3. 模型结构与损失函数

## 输入是一张周期材料图

补充材料把输入写成:

$$
\mathcal{G}=(\boldsymbol{Z},\boldsymbol{V},\boldsymbol{R},[\boldsymbol{L},\boldsymbol{S}]).
$$

其中:

- $\boldsymbol{Z}$ 表示原子序数和其他逐原子特征.
- $\boldsymbol{R}$ 表示原子坐标.
- $\boldsymbol{V}$ 表示原子对之间的相对位移向量.
- $\boldsymbol{L}$ 是 $3\times3$ 晶格矩阵.
- $\boldsymbol{S}$ 是温度和压力等全局标量状态.

半径 $r_c=5.0$ Å 内的原子对形成边. 周期镜像原子也进入邻域图, 但镜像的 key 和 value 从原胞中的对应原子复制, 以保持同一个物理原子的表示一致.

::: details 英文原文: 图表示必须满足的几何规律
> "By design, MatterSim preserves roto-translational invariance for scalar properties (e.g., total energy) and equivariance for vectorial properties (e.g., forces)."

旋转整个晶体不应改变总能量, 这叫 invariance. 但力必须随坐标轴一起旋转, 这叫 equivariance. 如果网络不满足这些规律, 它就需要从数据中重复学习同一结构的无穷多个旋转版本, 而且仍可能给出方向不一致的力.

原文定位: 补充材料 Model architecture and training details, Materials Graphs.
:::

## 为什么需要 invariant 与 equivariant 双流

![MatterSim-MT 的 GeoMFormer 风格架构](/images/mattersim-mt/architecture.png)

<p class="figure-note">补充材料模型图. 每个 Transformer block 包含 invariant self-attention, equivariant self-attention, 两类 cross-attention 和 FFN.</p>

网络同时维护两类逐原子特征:

- invariant 特征 $\boldsymbol{x}_i$, 在整体旋转和平移下不变, 适合承载元素环境和标量语义.
- equivariant 特征 $\boldsymbol{e}_i$, 在旋转下按向量规律变化, 适合承载方向和几何信息.

self-attention 在各自流内交换信息, cross-attention 则让两条流互相条件化. 直观上, invariant 流回答 "这个邻域是什么", equivariant 流回答 "这些邻居朝哪个方向排列", cross-attention 把类别与方向绑定起来.

::: details 英文原文: cross-attention 的作用
> "It employs two parallel streams that maintain and learn invariant and equivariant representations, respectively. Following GeoMFormer, a cross-attention module bridges the two streams, enabling information exchange and improving geometric modeling."

这不是把两个独立网络的输出最后拼接. 每个 Transformer block 内部都包含跨流交互, 因而标量环境可以调制方向特征, 方向特征也可以更新标量表示. 这对 Born 有效电荷和介电矩阵尤其重要, 因为它们既依赖局域化学身份, 又必须遵守张量变换规律.

原文定位: 补充材料 Model Architecture, 第 2 段.
:::

## 距离怎样进入 embedding

模型用 Gaussian basis $\widetilde{\Phi}(\lVert\boldsymbol{r}_{ij}\rVert)$ 展开原子间距, 再乘平滑截断函数:

$$
\begin{aligned}
m_{ij}
={}&1-6\left(\dfrac{\lVert\boldsymbol{r}_{ij}\rVert}{r_c}\right)^5
+15\left(\dfrac{\lVert\boldsymbol{r}_{ij}\rVert}{r_c}\right)^4\\
&-10\left(\dfrac{\lVert\boldsymbol{r}_{ij}\rVert}{r_c}\right)^3.
\end{aligned}
$$

当距离接近截断半径时, $m_{ij}$ 平滑降到 0, 避免一个原子刚跨过邻居列表边界就让能量或力发生跳变. invariant 中心性编码为:

$$
\boldsymbol{b}_i
=\sum_{j\in\mathcal{N}(i)}
\operatorname{Linear}\left(
m_{ij}\widetilde{\Phi}(\lVert\boldsymbol{r}_{ij}\rVert)
\right).
$$

equivariant 初始特征还显式加入单位方向 $\boldsymbol{r}_{ij}/\lVert\boldsymbol{r}_{ij}\rVert$. 这样距离负责径向信息, 单位向量负责角向信息.

## attention 怎样限制在物理邻域

对 invariant self-attention, 查询与键产生分数:

$$
a_{ij}=\left(\dfrac{\boldsymbol{Q}\boldsymbol{K}^{\mathsf{T}}}{\sqrt{d}}\right)_{ij}.
$$

论文使用带邻域和平滑 mask 的 softmax:

$$
\operatorname{Softmax}^{*}(a_{ij})
=\dfrac{\mathrm{e}^{a_{ij}}m_{ij}}
{\displaystyle\sum_{k\in\mathcal{N}(i)}\mathrm{e}^{a_{ik}}m_{ik}}.
$$

更新只聚合截断邻域内的 value. 这保持计算量随局域邻居数增长, 但也意味着 5 Å 以外的相互作用不会被直接建模. 多层消息传递可以扩大有效感受野, 却不能替代显式长程静电. 论文在 LO-TO splitting 中通过 $Z^*$ 和 $\boldsymbol{\varepsilon}_\infty$ 构造非解析长程修正, 正好说明局域势与宏观库仑响应需要分工.

## 标量任务头与张量任务头

最终 block 输出 $\boldsymbol{x}_i^N$ 和 $\boldsymbol{e}_i^N$. 标量头先做 invariant cross-attention, 再经过线性层, GELU 和 layer normalization:

$$
\boldsymbol{p}_i
=W_2 f_\mathrm{LN}\left(
\operatorname{GELU}(W_1\boldsymbol{x}_i^{N+1}+\boldsymbol{b}_1)
\right)+\boldsymbol{b}_2.
$$

能量对原子表示做 pooling, Bader 电荷和磁矩则保留逐原子输出.

Born 有效电荷与介电矩阵采用 ETGNN 风格的几何构造. 介电张量由沿原子对方向的 dyadic product 组成:

$$
\boldsymbol{\varepsilon}
=\dfrac{1}{N}\sum_{i=1}^{N}\sum_{j\in\mathcal{N}(i)}
(\boldsymbol{p}_i\boldsymbol{p}_j)
\widehat{\boldsymbol{r}}_{ji}\otimes\widehat{\boldsymbol{r}}_{ji}.
$$

$\widehat{\boldsymbol{r}}\otimes\widehat{\boldsymbol{r}}$ 在旋转下自然按二阶张量变化. Born 有效电荷再分成 symmetric 与 non-symmetric 两部分, 后者用两个不同邻居方向的外积表达非对称分量. 这比直接回归 9 个数更尊重张量几何.

## 联合损失怎样组成

论文使用 MAE 形式的联合目标:

$$
\begin{aligned}
L={}&l(e,e_\mathrm{DFT})
+\omega_f l(\boldsymbol{f},\boldsymbol{f}_\mathrm{DFT})
+\omega_\sigma l(\boldsymbol{\sigma},\boldsymbol{\sigma}_\mathrm{DFT})\\
&+\sum_{i=1}^{4}\omega_{t_i}
l(\boldsymbol{p}_{t_i},\boldsymbol{p}_{t_i,\mathrm{DFT}}).
\end{aligned}
$$

预训练权重为 $\omega_f=10.0$, $\omega_\sigma=0.07$, 四个辅助任务权重均为 1.0. 不同物理量的数值尺度和标签数量不同, 所以这些权重不仅表示重要性, 也在控制梯度尺度. 补充材料没有在该公式附近完整说明缺失任务标签的 batch 采样与 mask 机制, 这是复现多任务训练时需要代码或更详细方法说明才能确定的部分.

::: details 英文原文: 任务头如何分工
> "The Transformer block produces both invariant and equivariant per-atom features, which are used by task-specific heads to predict target properties."

共享发生在 Transformer backbone, 任务差异由 heads 吸收. 这种设计允许添加新任务时复用原子表征, 但它也不能保证任务一定互相促进. 如果某个标签定义与其他任务冲突, 联合训练可能出现 negative transfer. 论文用总体结果展示可行性, 但没有系统报告逐任务联合训练与单任务微调的消融.

原文定位: 补充材料 Model Architecture, Task Head, 第 1 段.
:::

## 模型规模与部署选择

| 规模 | Transformer blocks | hidden size | attention heads | cutoff |
| ---: | ---: | ---: | ---: | ---: |
| 1 M | 2 | 128 | 8 | 5.0 Å |
| 10 M | 3 | 320 | 16 | 5.0 Å |
| 220 M | 6 | 768 | 32 | 5.0 Å |
| 1.3 B | 9 | 1536 | 32 | 5.0 Å |

参数增加主要来自深度与通道宽度, 不是扩大物理截断半径. 1.3 B 模型拥有更强的函数容量, 但局域图的基本归纳偏置不变. 主文使用 10 M 版本意味着案例证明的是一个相对紧凑模型的实用能力, 而不是依赖十亿参数才能出现的涌现现象.

## 本章结论

MatterSim-MT 的架构创新可以概括为共享几何 backbone 加任务特定读出. invariant-equivariant 双流负责把元素与方向信息结合, 标量头输出能量, 电荷和磁矩, 几何张量头输出 $Z^*$ 与 $\boldsymbol{\varepsilon}_\infty$. 这套结构为多任务物理提供了必要接口, 但守恒律, 长程相互作用和不同任务之间的物理一致性仍需要在具体工作流中额外处理或验证.

