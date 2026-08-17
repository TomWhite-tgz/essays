---
title: 全部编号公式
description: UMA v2 Equations 1-6, energy reference 与 normalization 的逐式说明.
---

# 全部编号公式

## Equation 1: Mixture of Linear Experts

$$
y=\sum_k\alpha_k\left(W_kx\right).
\tag{1}
$$

$W_k$ 是第 $k$ 个 linear expert, $\alpha_k$ 是 router coefficient. Softmax 使 $0\leqslant\alpha_k\leqslant1$ 且 $\sum_k\alpha_k=1$.

## Equation 2: Expert pre-merge

$$
y=W^*x,
\qquad
W^*=\sum_k\alpha_kW_k.
\tag{2}
$$

线性使多个 experts 可先合成一个 effective weight matrix. 只有当 global routing inputs 在 trajectory 内不变时, $W^*$ 才能复用.

## Equation 3: Training FLOPs

$$
C(N,D)\approx\kappa ND.
\tag{3}
$$

$N$ 为 parameter count, $D$ 为 processed atoms 或 edges, $\kappa$ 是 weight reuse factor. UMA-M scaling settings 下估计 $\kappa\approx270$ FLOPs/parameter/atom.

## Equation 4: Compute-optimal frontiers

$$
\begin{aligned}
\log N^*(C)&=\alpha\log C+A,\\
\log D^*(C)&=\beta\log C+B.
\end{aligned}
\tag{4}
$$

$N^*(C)$ 与 $D^*(C)$ 分别是固定 compute 下使 validation loss 最低的 active params 与 atoms 数. 它们来自每条 IsoFLOP parabola 的 minimum.

## Equation 5: Joint loss ansatz

$$
\widetilde L(N,D)
=\widehat E
+\dfrac{\widehat A}{N^{\widehat\alpha}}
+\dfrac{\widehat B}{D^{\widehat\beta}}.
\tag{5}
$$

这是 parameter-limited term, data-limited term 与 irreducible floor 的和. 若指数按分母 decay magnitude 定义, $\widehat\alpha$ 与 $\widehat\beta$ 应取正值.

## Equation 6: Optimal-frontier loss

$$
\log\widetilde L\left(N^*\right)
=\widehat\alpha\log N^*+\gamma.
\tag{6}
$$

若这里的 $\widehat\alpha$ 是 log-log slope, 它应为负. 原文 Table 12 报 dense -0.29, MoLE -0.25, 与 Equation 6 一致, 却与 Equation 5 分母中的 exponent 符号不一致. 应把 Equation 6 写成 $-\widehat\alpha\log N^*+\gamma$, 或将 Equation 5 的 exponent 另记为正 magnitude.

原文还写:

$$
\gamma
=\log\left[
\left(1+\dfrac{\widehat\alpha}{\widehat\beta}\right)\widehat A
\right],
$$

并近似 $\widehat E\approx0$. 由于表中没有给 $\widehat\beta$ 与 $\widehat A$, 无法从最终稿独立复算 $\gamma$.

## 未编号公式: Heat-of-formation reference

$$
E_{\mathrm{ref}}
=E_{\mathrm{DFT}}
-\sum_{i=1}^{N}
\left(E_{i,\mathrm{DFT}}-\Delta H_{f,i}\right).
$$

$E_{i,\mathrm{DFT}}$ 使用对应 task 的 DFT settings 计算 isolated atom, $\Delta H_{f,i}$ 是元素 heat of formation. 之后还叠加 OC22 protocol 的 linear reference.

## 未编号公式: Target normalization

$$
x'=\dfrac{x-\mu}{\sigma},
\qquad
\mu=0,
\qquad
\sigma=\operatorname{RMS}(F).
$$

Combined force RMS 按各 dataset 的 systems 数加权. 同一 normalization 作用于 energy, force 与 stress targets.

## 未单独编号的物理关系

Conservative UMA-S/M 的 forces 与 stress 通过 energy derivatives 得到. 核心关系为:

$$
\boldsymbol F_i=-\nabla_{\boldsymbol r_i}E.
$$

该式未在 UMA v2 单独编号, 但决定 S/M 与 direct-force UMA-L 在 NVE 和高阶物性上的根本差别.
