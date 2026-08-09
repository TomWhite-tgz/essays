---
title: 3. 模型与数学
description: MatterSim 的材料图, M3GNet, Graphormer, 对称性和损失函数.
---

# 3. 模型与数学

## MatterSim 是一个模型家族

::: details 英文原文: 为什么使用两种 backbone
> "In this work, we opt to use two primary architectures, M3GNet[19] and Graphormer[35] as the backbones for MatterSim. M3GNet is an invariant graph neural network model with high data efficiency, which has been used to train models (and ensembles) with data up to 3M. For models with larger data sizes, we turn to Graphormer. Graphormer is a transformer-based model with proven learning capacity and scalability.[36, 37]"

这段原文说明 MatterSim 不是单一网络名称. M3GNet 面向较小模型和高数据效率, Graphormer 面向更大的数据与模型容量. 论文后续实验也按成本分工: 多数长时间零样本模拟使用 M3GNet, Matbench Discovery 和端到端性质预测使用 Graphormer.

原文定位: 主文 Results, Learning the materials space under first-principles supervision, 模型架构段落.
:::

论文没有让一个网络同时承担所有任务, 而是训练两类 backbone:

| Backbone | 规模 | 优点 | 论文中的用途 |
| --- | ---: | --- | --- |
| M3GNet | 约 88 万至 450 万参数 | 推理快, 显存较低, 通过能量梯度得到力和应力 | 大多数零样本模拟, MD, 声子, 自由能 |
| Graphormer | 约 1.82 亿参数 | 容量大, 大数据下精度更高, 表征迁移更强 | Matbench Discovery, 端到端性质预测 |

![两类 backbone 的速度和显存比较](/images/mattersim/model-comparison.png)

<p class="figure-note">补充材料图 S6. 对约 100 个原子的体系, Graphormer 显存需求约为 M3GNet 的 10 倍.</p>

这项选择很务实. 长时间 MD 需要反复调用势函数, 每一步都计算力, 因而吞吐量比单点极限精度重要. 大规模筛选和性质微调则更容易受预测误差支配, 可以使用较大的 Graphormer.

## 材料图表示

论文把一个周期性原子体系写成材料图:

$$
\mathcal{G}=
\left(
\boldsymbol{Z},
\boldsymbol{V},
\boldsymbol{R},
[\boldsymbol{L},\boldsymbol{S}]
\right).
$$

各部分含义如下:

- $\boldsymbol{Z}$ 是原子序数和原子特征.
- $\boldsymbol{R}$ 是原子笛卡尔坐标.
- $\boldsymbol{V}$ 是原子之间的相对向量或边特征.
- $\boldsymbol{L}$ 是 $3\times3$ 晶格矩阵.
- $\boldsymbol{S}$ 是可选的全局状态.

如果两个原子在考虑周期镜像后的距离不超过截断半径 $r_c$, 就在图中连接一条边.

## 对称性为什么必须处理

同一个物理结构可以被整体平移或旋转. 总能量不应随坐标系变化:

$$
E(\boldsymbol{R}\boldsymbol{Q}^{\mathsf T}+\boldsymbol{t})=E(\boldsymbol{R}),
$$

其中 $\boldsymbol{Q}$ 是旋转矩阵, $\boldsymbol{t}$ 是平移向量. 力则应随旋转共同变化:

$$
\boldsymbol{F}(\boldsymbol{R}\boldsymbol{Q}^{\mathsf T}+\boldsymbol{t})
=\boldsymbol{F}(\boldsymbol{R})\boldsymbol{Q}^{\mathsf T}.
$$

前一种性质叫不变性, 后一种性质叫等变性. 如果模型不满足这些约束, 同一晶体只因坐标轴改变就可能得到不同能量或方向错误的力.

## M3GNet 路线

M3GNet 在消息传递中显式使用二体距离和三体角度. 对中心原子 $i$, 邻居 $j$ 和 $k$ 构成的三元组, 模型将距离 $r_{ij}$, $r_{ik}$ 与夹角 $\theta_{jik}$ 编码到边更新中.

论文给出的三体基函数包含球 Bessel 函数 $j_l$ 和球谐函数 $Y_l^0$:

$$
\begin{aligned}
\widetilde{\boldsymbol{e}}_{ij}
&=\sum_k j_l\left(z_{ln}\dfrac{\lVert\boldsymbol{r}_{ik}\rVert}{r_c}\right)
Y_l^0(\theta_{jik})
\odot \xi(\boldsymbol{W}_v\boldsymbol{v}_k+\boldsymbol{b}_v) \\
&\quad\odot f_c(\lVert\boldsymbol{r}_{ij}\rVert)
f_c(\lVert\boldsymbol{r}_{ik}\rVert).
\end{aligned}
$$

平滑截断函数为:

$$
f_c(r)=1-6\left(\dfrac{r}{r_c}\right)^5
+15\left(\dfrac{r}{r_c}\right)^4
-10\left(\dfrac{r}{r_c}\right)^3.
$$

它在截断边界附近平滑衰减, 避免一个原子刚越过 $r_c$ 就让能量或力发生不连续跳变.

M3GNet 最终预测总能量, 力和应力通过自动微分得到. 这种做法的重要优点是保守性:

$$
\boldsymbol{f}_i=-\dfrac{\partial E}{\partial\boldsymbol{r}_i},
\qquad
\boldsymbol{\sigma}=\dfrac{1}{V}\dfrac{\partial E}{\partial\boldsymbol{\varepsilon}}.
$$

只要 $E$ 足够光滑, 力就是同一个标量势的梯度. 对 NVE 分子动力学而言, 这比独立回归一个任意向量场更容易保持能量一致性.

## Graphormer 路线

Graphormer 由 structural encoder 和 property decoder 组成.

![Graphormer 编码器与解码器](/images/mattersim/encoder-decoder.png)

<p class="figure-note">补充材料图 S4. 编码器学习不变标量特征, GeoMFormer 解码器同时维护不变和 SO(3) 等变特征流.</p>

### 距离进入 attention bias

原子种类先映射为初始 embedding $\boldsymbol{x}_i^0$. 原子间距离通过 Gaussian basis $\widetilde{\Phi}$ 编码为 attention bias:

$$
\boldsymbol{b}_{ij}
=\operatorname{Linear}\left(
\widetilde{\Phi}(\lVert\boldsymbol{r}_{ij}\rVert)
\right).
$$

第 $h$ 层的多头注意力可概括为:

$$
\boldsymbol{x}_i^{h+1}
=\sum_j
\operatorname{Softmax}\left[
\left(
\dfrac{\boldsymbol{Q}\boldsymbol{K}^{\mathsf T}}{\sqrt d}
\right)_{ij}
+b_{ij}
\right]
m_{ij}\boldsymbol{V}_j.
$$

$m_{ij}$ 是由距离决定的平滑局部 mask. 周期性晶体通过复制相邻晶胞中的 image atoms 构成 multi-graph, 同一个原子及其周期镜像共享 $\boldsymbol{K}$ 和 $\boldsymbol{V}$ 表征.

### 等变解码器

GeoMFormer 解码器维护两条特征流:

- invariant stream 处理旋转不变的材料特征.
- equivariant stream 处理随旋转变化的方向特征.

两条流通过 cross-attention 交换信息. 等变特征的初始化使用邻居相对方向, 从而避免绝对坐标破坏平移不变性:

$$
\boldsymbol{e}_i^0
=\sum_j m_{ij}
\dfrac{\boldsymbol{r}_{ij}}{\lVert\boldsymbol{r}_{ij}\rVert}
\widetilde{\Phi}(\lVert\boldsymbol{r}_{ij}\rVert).
$$

### 应力头

原始 Graphormer 实现没有应力输出. 作者用晶格单位向量的外积构造二阶张量:

$$
\boldsymbol{\sigma}
=\sum_{ij}w_{ij}
\dfrac{\boldsymbol{L}_i}{\lVert\boldsymbol{L}_i\rVert}
\otimes
\dfrac{\boldsymbol{L}_j}{\lVert\boldsymbol{L}_j\rVert}.
$$

![Graphormer 的应力头](/images/mattersim/stress-head.png)

<p class="figure-note">补充材料图 S5. 对称化的权重矩阵与晶格向量外积组合成对称应力张量.</p>

这里的几何构造能保证输出具有张量形式, 但它与 M3GNet 中 "应力来自能量对晶格应变的导数" 不是同一种约束. Graphormer 直接预测力和应力时, 能量, 力和应力之间不自动满足严格的梯度一致性.

::: warning 源码中的一个公式疑点
补充材料把 Graphormer 的力头写成 $\boldsymbol{f}_i=\operatorname{Linear}(\lVert\boldsymbol{e}_i^{N_2}\rVert)$. 如果先对等变向量取范数, 输出会失去方向, 与向量力不相容. 结合架构图和 GeoMFormer 的作用, 这更像论文公式的记号错误或省略. 理解实现时应以实际代码为准, 不能机械照抄该公式.
:::

## 训练目标

M3GNet 使用能量, 力和应力的加权 Huber loss:

$$
\mathcal{L}
=\ell(e,e_\mathrm{DFT})
+\omega_f\ell(\boldsymbol{f},\boldsymbol{f}_\mathrm{DFT})
+\omega_\sigma\ell(\boldsymbol{\sigma},\boldsymbol{\sigma}_\mathrm{DFT}),
$$

其中 $\omega_f=1$, $\omega_\sigma=0.1$. 训练使用 8 张 NVIDIA A100, batch size 为 128, 最多 200 epochs.

Graphormer 使用 24 层 structural encoder, 10 层 GeoMFormer decoder, 32 个 attention heads 和 768 维隐藏层. 它在 64 张 A100 上训练 1562500 steps. 第一阶段只训练能量和力, 之后冻结相关参数再训练应力头.

## 架构比较的正确结论

论文数据支持以下判断:

- Graphormer 容量更大, 在若干单点 benchmark 上更准确.
- M3GNet 更适合需要数百万次力评估的 MD 和声子任务.
- 预训练数据对两种架构都有帮助, 因而数据覆盖不是某个 backbone 的偶然特性.

论文没有证明 Graphormer 在所有任务上都优于 M3GNet. 在 MPF-TP 的能量和应力, 以及 Random-TP 的应力上, MatterSim-M3GNet 反而略好. 模型选择应同时考虑误差类型, 计算成本和物理一致性.
