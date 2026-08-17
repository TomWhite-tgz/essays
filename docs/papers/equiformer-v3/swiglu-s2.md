---
title: SwiGLU-S2 激活
description: 从球谐投影, 网格乘法与 scalar gate 推导 SwiGLU-S2.
---

# SwiGLU-$S^2$ 激活

## 普通 $S^2$ activation

对单 channel irreps $x=\{x_m^{(L)}\}$, 用 real spherical harmonics 投影到 sphere:

$$
x^{\mathrm{grid}}(\phi,\theta)=\sum_{L=0}^{L_{\max}}\sum_{m=-L}^{L}Y_m^{(L)}(\phi,\theta)x_m^{(L)}.
$$

在 grid 上逐点施加普通非线性 $F$, 再积分投回 irreps:

$$
y_m^{(L)}=\displaystyle\int_0^{2\pi}\displaystyle\int_0^{\pi}F\left(x^{\mathrm{grid}}(\phi,\theta)\right)Y_m^{(L)}(\phi,\theta)\sin\theta\,\mathrm{d}\theta\,\mathrm{d}\phi.
$$

实践中积分由 $R_\phi R_\theta$ 个 grid points 近似. SiLU 会生成输入 bandlimit 之外的高频分量, sampling 不足时 rotation 与 projection 不再交换, 产生 equivariance error.

![激活函数对比](/images/equiformer-v3/swiglu-s2.png)

## 网格乘法等价于什么

两个 band-limited spherical signals 的逐点乘法对应 irreps space 中对称 Clebsch-Gordan paths:

$$
z^{\mathrm{grid}}=x^{\mathrm{grid}}\odot y^{\mathrm{grid}},\qquad z=\operatorname{FromSphere}\left(z^{\mathrm{grid}}\right).
$$

论文将其解释为 fast self tensor product. 显式 full tensor product 的 naive complexity 写为 $O(L_{\max}^6)$, sphere projection route 写为 $O(L_{\max}^4)$; grid multiplication 本身为 $O(L_{\max}^2)$.

## V3 公式

V3 把 scalar-only nonlinear gate 与两个 grid branches 相乘:

$$
\operatorname{SwiGLU-}S^2\left(x_s,x_1^{\mathrm{grid}},x_2^{\mathrm{grid}}\right)=\operatorname{sigmoid}(x_s)\,x_1^{\mathrm{grid}}\odot x_2^{\mathrm{grid}}.
$$

Nonlinearity 只作用在 invariant scalar $x_s$, 不向 sphere signal 注入无界高频; bilinear grid product 的最高 frequency 可预知, 因而可以用有限 grid 精确或近精确积分.

## 实际模块比一行公式更完整

代码类 `SeparableGateS2Activation_SwiGLU_Merge` 有两条 paths:

- Scalar path 将 degree-0 inputs 分块, 执行普通 SwiGLU.
- Type-$L$ path 将 grid channels 二分并逐点相乘, 从 sphere 投回后再乘 sigmoid scalar gate.
- 最后把两条 paths 的 degree-0 outputs 相加.

代码把 gate 放在 `FromSphere` 后执行. 因为 gate 不依赖 $(\phi,\theta)$, 它与线性投影可交换, 数学上等价于论文把 gate 写在 grid product 前.

## 参数成本

两个 grid branches 相乘后 channel 数减半. 为保持 subsequent width, 作者将 activation input channels 加倍, 使 OC20 model 从 66M 增至 91M parameters, 增幅 37.9%. 因而精度提升不能解释为纯 activation-function effect; 它同时改变 parameter count, 只是 grid reduction 让 runtime 仍接近前一行.

