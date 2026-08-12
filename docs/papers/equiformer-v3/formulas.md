---
title: 公式总表
description: 汇总 EquiformerV3 v1 主文的 8 个编号公式及其作用.
---

# 公式总表

论文主文共有 8 个编号公式. Appendix 以 tables, architecture description 与 hyperparameters 为主, 没有继续编号新公式.

## Equation 1, 普通 attention message

$$
\mathbf m_{ij}=a_{ij}\mathbf v_{ij}.
$$

$a_{ij}$ 是 scalar, 因此乘 type-$L$ value 不改变其 transformation law.

## Equation 2, neighborhood softmax

$$
a_{ij}=\dfrac{\exp(z_{ij})}{\displaystyle\sum_{k\in\mathcal N(i)}\exp(z_{ik})}.
$$

Neighbor set 离散变化会让 denominator 跳变.

## Equation 3, 平滑 cutoff attention

$$
\begin{aligned}
a_{ij}&=\dfrac{e(r_{ij})\exp(z_{ij})}{\displaystyle\sum_{k\in\mathcal N(i)}e(r_{ik})\exp(z_{ik})},\\
\mathbf m_{ij}&=a_{ij}\left(e(r_{ij})\mathbf v_{ij}\right).
\end{aligned}
$$

Envelope 同时控制 probability measure 与 value amplitude.

## Equation 4, ToSphere

$$
x^{\mathrm{grid}}(\phi,\theta)=\sum_{L=0}^{L_{\max}}\sum_{m=-L}^{L}Y_m^{(L)}(\phi,\theta)x_m^{(L)}.
$$

Irreps coefficients 被解释为 band-limited spherical signal.

## Equation 5, FromSphere

$$
y_m^{(L)}=\displaystyle\int_0^{2\pi}\displaystyle\int_0^{\pi}y^{\mathrm{grid}}(\phi,\theta)Y_m^{(L)}(\phi,\theta)\sin\theta\,\mathrm{d}\theta\,\mathrm{d}\phi.
$$

实际以离散 quadrature 近似, grid resolution 决定 aliasing error.

## Equation 6, sphere tensor product

$$
\begin{aligned}
x^{\mathrm{grid}}&=\operatorname{ToSphere}(x),\\
y^{\mathrm{grid}}&=\operatorname{ToSphere}(y),\\
z^{\mathrm{grid}}&=x^{\mathrm{grid}}\odot y^{\mathrm{grid}},\\
z_m^{(L)}&=\operatorname{FromSphere}\left(z^{\mathrm{grid}},L,m\right).
\end{aligned}
$$

它实现对称 tensor-product paths, 不是任意 full CG product 的逐项显式计算.

## Equation 7, SwiGLU-$S^2$

$$
\operatorname{SwiGLU-}S^2\left(x_s,x_1^{\mathrm{grid}},x_2^{\mathrm{grid}}\right)=\operatorname{sigmoid}(x_s)x_1^{\mathrm{grid}}\odot x_2^{\mathrm{grid}}.
$$

Scalar nonlinear gate 保持 equivariance, grid product 引入 higher-body interaction.

## Equation 8, 堆叠 self tensor products

$$
(x\otimes x)\otimes(x\otimes x)=x\otimes x\otimes x\otimes x.
$$

论文用它解释两个 SwiGLU-$S^2$ FFNs 为何可覆盖更高体阶 scalarization. 这是 interaction-order intuition, 不能单独推出 finite-width network 对所有高体阶函数都可辨识.

