---
title: 守恒性, 对称性与 smoothness
description: 哪些物理性质由 DPA3 构造保证, 哪些只是近似或实验主张.
---

# 守恒性, 对称性与 smoothness

## Conservative force 是最直接的保证

DPA3 先预测标量总能量, 再以自动微分得到力. 因此在模型函数可微的区域内:

$$
\boldsymbol F_i=-\nabla_{\boldsymbol r_i}E.
$$

这意味着力场的 curl 理想上为零, 闭合路径做功为零, 并排除了 energy head 与 direct-force head 相互矛盾的问题. 数值积分仍会产生 finite-step energy drift, conservative architecture 不等于任意时间步下精确守恒.

## 平移, 旋转与置换

模型初始几何量只有 distance, angle cosine 与 dihedral cosine. 它们在整体平移与旋转下不变. Message MLP 只接收 invariant feature, 所以逐层保持 invariant.

同种原子置换时, 图的索引发生相同置换, 而 vertex aggregation 使用邻居求和. 因此最终 $v_i^{(1,L)}$ 对原子索引是 equivariant, 原子能求和后总能量 invariant.

这些结论依赖一个隐含前提: 邻居构图本身必须按照对称方式确定. 若实现使用不稳定的 top-$K$ 截断或与索引相关的 tie breaking, 仅看公式不足以保证实际程序完全满足置换与 smoothness.

## Switch function

原文 Equation 9 写为:

$$
s^k(r)=
\begin{cases}
\exp\left[-\exp\left(C\dfrac{r-r_{cs}^k}{r_{cs}^k}\right)\right],
&0<r\leqslant r_c^k,\\
0,&r>r_c^k.
\end{cases}
$$

默认 $C=20$, $r_c^1=6.0$ Å, $r_{cs}^1=5.3$ Å. 在 $r=r_c^1$ 时, 第一支约为 $7.8\times10^{-7}$, 极小但不严格等于零. 紧接 cutoff 外第二支为零, 因而按论文写出的有限参数公式存在微小跳变.

这一区分很重要:

- 工程上, 跳变量可能小到 float precision 或动力学误差难以分辨.
- 数学上, 它不是在 $r_c$ 处所有阶导数严格拼接为零的 compact-support switch.
- 论文声称 rigorously smooth 时, 给出的公式并未完成严格证明.

## 高阶边的平滑权重

Angle edge 的权重是两条 bond switch 的乘积:

$$
w_{(ij)(im)}^2=s^2(r_{ij})s^2(r_{im}).
$$

Dihedral relation 则乘 3 条距离 switch:

$$
w_{(ijm)(ijn)}^3=s^3(r_{ij})s^3(r_{im})s^3(r_{in}).
$$

只要任一 constituent bond 接近 cutoff, 整个高阶 message 就被压低. 这解决了 angle 或 dihedral object 突然出现时的主要数值风险, 但仍继承单个 switch 在精确 cutoff 处的微小不连续.

## 论文如何连接静态误差与物性

Supplementary Figure S-1 取不同参数量与训练阶段的 MPtrj DPA3 checkpoints, 先测 WBM energy MAE, 再测 MDR 的最大声子频率, entropy, free energy 与 heat capacity.

![Energy error 与声子物性相关性](/images/dpa3/fig-s1.png)

4 类 property MAE 随 energy MAE 下降而近似线性下降. 这支持在该模型族, 该训练域和该 benchmark 上把 energy MAE 当作有用代理. 它不能单独证明:

- Force error 或 virial error 不重要.
- 相关性由 conservativeness 唯一导致.
- 所有下游动力学, phase transition 或 reaction observable 都遵循同一关系.

## 最稳妥的物理解读

DPA3 对 conservative force 与基本对称性的论证较强. 对严格 smoothness 的表述需要降格为数值上高度平滑. 对 property reliability 的证据是相关性而不是普遍充分条件.
