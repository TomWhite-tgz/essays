---
title: EDM 联合扩散与损失
description: Atom type, torus coordinate 和 lattice channels 的 noising, preconditioning 与 objective.
---

# EDM 联合扩散与损失

## 连续状态

Crystalite 在

$$
(\mathbf H,\mathbf F,\mathbf y)
$$

上运行 EDM. DNG 对 3 个 channels 全部加 Gaussian noise. CSP 固定 $\mathbf H$, 只 denoise coordinates 与 lattice. Noise level 服从

$$
\log\sigma\sim\mathcal N(P_{\mathrm{mean}},P_{\mathrm{std}}^2),
$$

main configurations 均取 $(P_{\mathrm{mean}},P_{\mathrm{std}})=(-1.2,1.2)$.

## Coordinate noising

坐标先中心化为 $\mathbf F_{\mathrm c}=\mathbf F-1/2$, 在 Euclidean space 加 noise, 再 wrap 回 unit cube 作为 network input. Loss 比较时使用

$$
\Delta_i=\operatorname{wrap}(\widehat{\mathbf f}_i-\mathbf f_i).
$$

这保证跨越 cell boundary 的 residual 较短, 但只对 fractional components 独立 wrap. 它与 GEM 的 metric-aware Cartesian minimum image 不同, 在 skewed cell 上未必对应最短 Cartesian error.

## EDM preconditioning

对 channel $u\in\{H,F,\mathrm{lat}\}$,

$$
\begin{aligned}
c_{\mathrm{skip},u}(\sigma)
&=\dfrac{\sigma_{\mathrm{data},u}^2}
{\sigma^2+\sigma_{\mathrm{data},u}^2},\\
c_{\mathrm{out},u}(\sigma)
&=\dfrac{\sigma\sigma_{\mathrm{data},u}}
{\sqrt{\sigma^2+\sigma_{\mathrm{data},u}^2}},\\
c_{\mathrm{in},u}(\sigma)
&=\dfrac{1}{\sqrt{\sigma^2+\sigma_{\mathrm{data},u}^2}}.
\end{aligned}
$$

Raw network output 与 noisy state 组合为 denoised prediction. Loss weight 为

$$
w_u(\sigma)
=\dfrac{\sigma^2+\sigma_{\mathrm{data},u}^2}
{(\sigma\sigma_{\mathrm{data},u})^2}.
$$

## 3-channel objective

论文写作

$$
\mathcal L
=\lambda_H\mathcal L_H
+\lambda_F\mathcal L_F
+\lambda_{\mathrm{lat}}\mathcal L_{\mathrm{lat}}.
$$

DNG table 报告 $(\lambda_H,\lambda_F,\lambda_{\mathrm{lat}})=(1,50,5)$, CSP 为 $(0,20,10)$. $\lambda_H=0$ 反映 composition 已知.

## 一个实现级关键问题

v2 发布后的公开代码曾对 type loss 再除以 feature dimension 16, 对 fractional-coordinate loss 再除以 dimension 3. 作者在 2026-07-15 确认这是错误 normalization 并修复. 修复后的 README DNG recipe 改用 weights $(16,150,5)$, 与 v2 Table 4 不同.

$(16,150,5)$ 数值上恰好抵消旧 reduction 对 16-dimensional type 与 3-dimensional coordinate 的额外除法. 但公开的 shallow history 不能证明 released checkpoint 究竟使用哪一版 reducer. 当前代码配论文表 weights 与 current README recipe 会得到不同 effective objectives. 复现必须固定 commit, reduction rule 与 raw weights 3 项, 只抄 Table 4 不够.
