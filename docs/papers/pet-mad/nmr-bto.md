---
title: NMR 晶体学与 BTO 介电响应
description: Succinic acid 核量子效应与 BaTiO3 相变, 极化和介电张量.
---

# NMR 晶体学与 BTO 介电响应

## Succinic acid NMR crystallography

原子势只负责生成 MD/PIMD structures. Chemical shielding 由另一个基于 SOAP descriptors 的 species-specific linear model 预测, 其 $^1$H shielding RMSE 为 0.17 ppm, 接近原工作 kernel model 的 0.16 ppm.

![Succinic acid shielding distributions](/images/pet-mad/fig8.png)

PET-MAD, bespoke 与 LoRA 产生几乎相同的 shielding distributions. PIMD 相对 classical MD 引起明显 downshift 与 broadening, 对 hydrogen-bonded proton 最强.

势函数 E/F MAE 为 PET-MAD 12.5/106.1, bespoke 3.1/86.0, LoRA 2.0/64.5 meV units. 较大的 raw force error 没有破坏该 distribution, 但最终 accuracy 同时依赖 shielding surrogate. 这不是 PET-MAD 单模型直接预测 NMR.

## BTO phases

$\mathrm{BaTiO_3}$ 从低温到高温依次为 rhombohedral, orthorhombic, tetragonal, cubic phases. 作者对 320 atoms 的 $4\times4\times4$ supercell 做 40-400 K flexible-cell MD.

Gaussian mixture model 给每个 sampled structure 属于 phase $k$ 的 probability $P_k(t)$. 两相 chemical potential difference 为

$$
\Delta\mu^{kk'}(T)
=-k_{\mathrm B}T\log\left(
\dfrac{\sum_tP_k(t)}{\sum_tP_{k'}(t)}
\right). \tag{8}
$$

$\Delta\mu=0$ 的温度为 coexistence estimate.

## Dielectric tensor

Cell dipole $\mathbf M$ 由独立 $\lambda$-SOAP equivariant linear model 给出. Relative static dielectric tensor 为

$$
\varepsilon_{r,\alpha\beta}
=\delta_{\alpha\beta}
+\dfrac{\operatorname{cov}(M_\alpha,M_\beta)}
{\varepsilon_0\Omega k_{\mathrm B}T}. \tag{9}
$$

沿 polarization 的分量为

$$
\varepsilon_\parallel
=\sum_{\alpha\beta}\varepsilon_{r,\alpha\beta}
\dfrac{M_\alpha M_\beta}{|\mathbf M|^2}. \tag{10}
$$

源码将 perpendicular projection 写为

$$
\varepsilon_\perp
=\sum_{\alpha\beta}\varepsilon_{r,\alpha\beta}
\left(\delta_{\alpha\beta}
-\dfrac{M_\alpha M_\beta}{|\mathbf M|^2}\right). \tag{11}
$$

若要表示两个垂直方向的平均介电常数, 通常还需除以 2. 原文没有该 normalization, 因而 Equation 11 更接近 perpendicular-subspace trace. 本站保留源码并标记解释边界.

![BTO dielectric response](/images/pet-mad/fig9.png)

## 结果

PET-MAD, bespoke 与 LoRA 都识别相同 phase basins. 最大 transition-temperature discrepancy 出现在 T-C transition, PET-MAD 与 specialized models 相差低于 30 K. 三者都相对实验低估 transition temperatures, 来源是 DFT 与 finite-size effects.

介电响应在 cubic phase 很大, 接近 ferroelectric transition 时上升, 在 tetragonal/orthorhombic phase 降低并产生 anisotropy. PET-MAD 在 T phase 略低估, C-phase curve 约平移 25 K, 与其较低 Curie temperature 一致.

这里的 functional property 来自 PET-MAD trajectory 加 dipole model, 不是 PET-MAD energy head 自发获得 polarization capability.
