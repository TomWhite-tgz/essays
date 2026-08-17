---
title: PES, 环境矩阵与平滑截断
description: 逐式解读 DPA-2 Equation 1-15, 包括能量守恒, energy bias, descriptor 和 cutoff switch.
---

# 3. PES, 环境矩阵与平滑截断

本章对应 Methods 4.1-4.2.1 的 Equation 1-15. 它从 conservative PES 出发, 定义 DPA-2 descriptor 的输入以及保证邻居进入和离开 cutoff 时平滑的 switch.

## Equation 1-3: Conservative potential

总能量按原子贡献分解:

$$
E=\sum_iE_i. \tag{1}
$$

这保证 extensivity: 对两个相隔超过 cutoff 的不相互作用子系统, 总能量是各自原子能之和. 原子能 $E_i$ 本身不是唯一可观测量, 只有总能量, 力和由它们导出的物理量受到监督.

力由总能量负梯度定义:

$$
\boldsymbol{F}_i=-\nabla_{\boldsymbol{r}_i}E. \tag{2}
$$

周期体系的 virial tensor 为

$$
\Xi_{\alpha\beta}
=-\sum_{\gamma}
\dfrac{\partial E}{\partial h_{\gamma\alpha}}
h_{\gamma\beta}. \tag{3}
$$

$h_{\gamma\alpha}$ 是 cell matrix 元素. Equation 2-3 说明力与 virial 不是独立 output heads, 而是同一标量能量的导数. 这使模型 conservative, 但也要求 descriptor 对坐标与晶胞变形足够平滑.

## Equation 4-6: Descriptor, fitting net 与 energy bias

第 $i$ 个原子能写成

$$
E_i
=\mathcal{F}\left(
\mathcal{D}_i(\mathcal{R},\mathcal{Z})
\right). \tag{4}
$$

$\mathcal{D}_i$ 是 symmetry-preserving descriptor, $\mathcal{F}$ 是 fitting network:

$$
\mathcal{F}(\mathcal{D}_i)
=e_{\mathrm{bias}}\left(
\operatorname{MLP}(\mathcal{D}_i)
\right). \tag{5}
$$

这里 $e_{\mathrm{bias}}(Z_i)$ 的实际作用是把元素相关常数加到 MLP 输出. 对第 $m$ 个构型, 设元素 $z$ 的原子数为 $c_{mz}$, 标签能量为 $E_m^*$, bias 通过下式作 least-squares 拟合:

$$
\sum_zc_{mz}e_{\mathrm{bias}}(z)=E_m^*,
\qquad m=1,\cdots,M. \tag{6}
$$

这先吸收不同 composition 的主要绝对能量差, 让网络集中拟合 bonding 与 environment-dependent residual. Fine-tuning 时必须用下游数据重算 bias, 不能沿用 source-task 的绝对能量基准.

## Equation 7-10: 两阶段 descriptor

最终 descriptor 拼接最初元素表示与 12 层环境更新后的表示:

$$
\mathcal{D}_i=\operatorname{concat}(f_i^0,f_i^2). \tag{7}
$$

元素 one-hot 先经 MLP 得到

$$
f_i^0
=\operatorname{MLP}\left(
\operatorname{one\_hot}(Z_i)
\right). \tag{8}
$$

Repinit 把初始 pair features 注入 single-atom channel:

$$
f_i^1
=\operatorname{repinit}(f_i^0,g_{ij}^0,h_{ij}^0). \tag{9}
$$

随后 12 个相同形状的 repformer blocks 迭代更新:

$$
\begin{aligned}
f_i^2
&=\underbrace{
\operatorname{repformer}\circ\cdots\circ
\operatorname{repformer}
}_{\times12}
\Big(
\operatorname{linear}(f_i^1),\\
&
\operatorname{linear}(g_{ij}^1),
h_{ij}^1
\Big).
\end{aligned} \tag{10}
$$

Equation 7 的 skip-like concatenation 让 fitting net 同时看到元素基线 $f_i^0$ 和深层环境表示 $f_i^2$.

## Equation 11: Augmented environment matrix

定义相对位置

$$
\boldsymbol{r}_{ij}=\boldsymbol{r}_i-\boldsymbol{r}_j,
$$

其 Cartesian components 为 $(x_{ij},y_{ij},z_{ij})$. Environment row 为

$$
\widetilde{\boldsymbol{r}}_{ij}
=s(r_{ij})
\left(
1,
\dfrac{x_{ij}}{|\boldsymbol{r}_{ij}|},
\dfrac{y_{ij}}{|\boldsymbol{r}_{ij}|},
\dfrac{z_{ij}}{|\boldsymbol{r}_{ij}|}
\right). \tag{11}
$$

第一分量只依赖距离, 后 3 个分量沿相对方向随旋转等变. 每个中心原子最多保留 $N_{r_c}^{m}$ 个邻居槽位, 不足部分补零.

## Equation 12-13: Switched inverse distance

径向缩放定义为

$$
s(r_{ij})
=\dfrac{w_{ij}}{|\boldsymbol{r}_{ij}|},
\qquad
w_{ij}=w(|\boldsymbol{r}_{ij}|). \tag{12}
$$

Switch function 取

$$
w(r)=
\begin{cases}
1, & r<r_{cs},\\
u^3(-6u^2+15u-10)+1,
& r_{cs}\leqslant r<r_c,\\
0, & r_c\leqslant r,
\end{cases} \tag{13}
$$

其中

$$
u=\dfrac{r-r_{cs}}{r_c-r_{cs}}.
$$

中间多项式等价于 $1-10u^3+15u^4-6u^5$. 在 $u=0$ 和 $u=1$ 两端, 函数的一阶与二阶导数都为零, 因而与两侧常数段拼接成 $C^2$ function.

TeX 源码 Equation 13 写成 `\nu^3`, 但紧随其后的变量定义和 PDF 排版语义均要求 $u^3$. 本站按 switch polynomial 的一致定义写作 $u^3$, 不把源码中的控制序列疑似笔误传播到推导.

## Equation 14-15: Invariant 与 equivariant pair channels

Environment row 被拆成标量 pair feature

$$
g_{ij}^0=s(r_{ij}), \tag{14}
$$

以及 3 维等变 pair feature

$$
h_{ij}^0
=s(r_{ij})
\left(
\dfrac{x_{ij}}{|\boldsymbol{r}_{ij}|},
\dfrac{y_{ij}}{|\boldsymbol{r}_{ij}|},
\dfrac{z_{ij}}{|\boldsymbol{r}_{ij}|}
\right). \tag{15}
$$

$g_{ij}^0$ 在旋转下不变, $h_{ij}^0$ 按普通三维向量旋转. DPA-2 后续不会直接把方向分量作为不变量, 而是通过 inner product 与 symmetrization 构造 rotation-invariant single-atom descriptor.

## 两个 cutoff

补充材料给出 repinit 使用 $r_c^0=9.0\,\text{\AA}$, 最大 120 个邻居. Repformer 使用更短的 $r_c^1=4.0\,\text{\AA}$, 最大 40 个邻居. 长 cutoff 的 repinit 先收集宽范围环境, 12 层 repformer 在较小邻域内做更昂贵的 attention 与 message passing.

## 本章结论

Equation 1-15 建立了 DPA-2 的物理底座: 总能量按原子求和, 力和 virial 从能量求导, 距离与方向分成 invariant/equivariant channels, cutoff 使用二阶平滑 switch. 这些结构保证 symmetry 与 conservativity, 但不能单独保证跨任务精度; generalizability 仍需由后续数据和实验验证.
