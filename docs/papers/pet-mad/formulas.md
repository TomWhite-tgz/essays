---
title: PET-MAD 全部编号公式
description: Supplementary Equations 1-11 的逐式解释与量纲审计.
---

# PET-MAD 全部编号公式

原文主文没有编号公式. Equations 1-11 全部位于 Supplementary Information, 已在各案例页面展开. 本页集中说明其数学角色.

## Equation 1: LLPR variance

$$
\sigma_i^2=\alpha\mathbf f_i^\top
\left(\mathbf F^\top\mathbf F+\varepsilon^2\mathbf I\right)^{-1}
\mathbf f_i. \tag{1}
$$

它测量 last-layer feature $\mathbf f_i$ 相对训练 feature covariance 的 leverage. $\alpha$ 负责 calibration, $\varepsilon$ 防止 matrix inversion 病态.

## Equations 2-3: Ionic conductivity

$$
\sigma=\dfrac{\Omega}{3k_{\mathrm B}T}
\displaystyle\int_0^\infty
\left\langle\mathbf J_q(\Gamma_t)\cdot\mathbf J_q(\Gamma_0)\right\rangle
\mathrm{d}t, \tag{2}
$$

$$
\mathbf J_q=\dfrac{e}{\Omega}\sum_iq_i\mathbf v_i. \tag{3}
$$

Equation 2 是 charge-current autocorrelation 的 Green-Kubo integral. Factor 3 来自三维各向同性平均. Equation 3 使用 charge density flux, 因而 Equation 2 前乘 volume $\Omega$.

## Equations 4-5: Interface pinning

$$
V_s(A)=\dfrac{k}{2}\left(s(A)-\overline s\right)^2, \tag{4}
$$

$$
\Delta\mu\propto k\left\langle s(A)-\overline s\right\rangle. \tag{5}
$$

Harmonic bias 固定 liquid-solid fraction, bias mean force 给出 phase chemical-potential difference. 原文只写 proportionality, 因为 exact conversion 依 collective-variable normalization 与 phase atom count.

## Equation 6: Gibbs surface excess

$$
\Gamma_a=\dfrac{N_a-N_a^B N/N^B}{S}. \tag{6}
$$

$N_a^BN/N^B$ 是按 bulk composition 推算整个 slab 应有的 element-$a$ 数量. 与实际 $N_a$ 的差除以 surface area, 得到 surface excess density.

## Equation 7: Ring-polymer potential

$$
\begin{aligned}
V'\left(\{\mathbf r_j\}_{j=1}^{P}\right)
={}&\sum_{j=1}^{P}V(\mathbf r_j)\\
&+\dfrac{1}{2}\omega_P^2
\left|\widetilde{\mathbf r}_j-\widetilde{\mathbf r}_{j-1}\right|^2.
\end{aligned} \tag{7}
$$

源码的 spring term 未显式写 $\sum_j$, 但文字说明是相邻全部 beads 的 harmonic terms. 严格 ring-polymer expression 应对 $j$ 求和. 本站保留源码形式并指出该省略.

## Equation 8: Phase chemical potential

$$
\Delta\mu^{kk'}(T)
=-k_{\mathrm B}T\log\left(
\dfrac{\sum_tP_k(t)}{\sum_tP_{k'}(t)}
\right). \tag{8}
$$

它把 trajectory 中两个 phase basin 的 relative population 转为 free-energy difference. 需要充分采样和可靠 clustering probabilities.

## Equation 9: Dielectric fluctuation formula

$$
\varepsilon_{r,\alpha\beta}
=\delta_{\alpha\beta}
+\dfrac{\operatorname{cov}(M_\alpha,M_\beta)}
{\varepsilon_0\Omega k_{\mathrm B}T}. \tag{9}
$$

它适用于 equilibrium dipole fluctuations, 并隐含 boundary condition 与 ensemble assumptions. $\mathbf M$ 来自辅助 dipole model.

## Equations 10-11: Parallel 与 perpendicular projection

$$
\varepsilon_\parallel
=\sum_{\alpha\beta}\varepsilon_{r,\alpha\beta}
\dfrac{M_\alpha M_\beta}{|\mathbf M|^2}, \tag{10}
$$

$$
\varepsilon_\perp
=\sum_{\alpha\beta}\varepsilon_{r,\alpha\beta}
\left(\delta_{\alpha\beta}
-\dfrac{M_\alpha M_\beta}{|\mathbf M|^2}\right). \tag{11}
$$

Equation 10 是沿 unit polarization vector 的 quadratic form. Equation 11 是 orthogonal projector contraction, 给出两个 perpendicular eigen-directions 的和. 若图中想表达单方向平均, 数学上应再除以 2; 原文未说明是否后处理做了 normalization.

