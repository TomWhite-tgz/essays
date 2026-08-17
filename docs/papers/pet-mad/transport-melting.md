---
title: 离子输运与 GaAs 熔点
description: Li3PS4 Green-Kubo 电导率和 GaAs interface-pinning 熔点证据.
---

# 离子输运与 GaAs 熔点

## $\mathrm{Li_3PS_4}$ 离子输运

作者对 $\alpha$, $\beta$, $\gamma$ 三相使用 MD 与 Green-Kubo 计算 ionic conductivity.

![Li3PS4 ionic conductivity](/images/pet-mad/fig4.png)

验证误差为:

| Model | Energy, meV/atom | Force, meV/Å |
| --- | ---: | ---: |
| PET-MAD | 4.9 | 63.9 |
| PET-Bespoke | 1.2 | 35.6 |
| PET-MAD-LoRA | 1.3 | 36.0 |

尽管 PET-MAD force error 约为专用模型的 1.8 倍, 三相 conductivity-temperature curves 基本一致. $\gamma$ phase 转入 high-conductivity state 的温度略高估.

这说明某一 observable 对均匀 force MAE 未必敏感, 但不能推出更高 force error 普遍无害. Conductivity 依赖 long-time current correlation, 误差可能在对称性, barrier 和 collective modes 上选择性放大或抵消.

## Equations 2-3: Green-Kubo

各向同性体系的电导率为

$$
\sigma=\dfrac{\Omega}{3k_{\mathrm B}T}
\displaystyle\int_0^\infty
\left\langle\mathbf J_q(\Gamma_t)\cdot\mathbf J_q(\Gamma_0)\right\rangle
\mathrm{d}t. \tag{2}
$$

Charge flux 为

$$
\mathbf J_q=\dfrac{e}{\Omega}\sum_i q_i\mathbf v_i. \tag{3}
$$

$q_i$ 使用 nominal oxidation numbers. 这忽略 dynamic charge transfer, 但对固定离子载流子体系是常见近似.

## GaAs interface pinning

在 liquid-solid coexistence cell 上施加 harmonic restraint:

$$
V_s(A)=\dfrac{k}{2}\left(s(A)-\overline s\right)^2. \tag{4}
$$

$s(A)$ 是 atom-wise Steinhardt $Q_4$ 的总和. 归一化后取 $\overline s=1/2$, 将体系限制在约半固半液. Restraining force 与 chemical potential difference 成正比:

$$
\Delta\mu\propto k\left\langle s(A)-\overline s\right\rangle. \tag{5}
$$

零点给出 melting temperature.

![GaAs chemical potential curves](/images/pet-mad/fig5.png)

| Model | E/F MAE | Melting point |
| --- | ---: | ---: |
| PET-MAD | 14.4 / 74.1 | $1111\pm72$ K |
| PET-Bespoke | 0.7 / 29.0 | $1169\pm4$ K |
| PET-MAD-LoRA | 1.3 / 45.3 | $1169\pm3$ K |

实验值约 1511 K. Specialized models 彼此一致却共同偏低约 342 K, 说明主要误差来自 non-magnetic PBEsol reference, 不是 ML fit. PET-MAD 相对 specialized reference 又偏低 58 K, 且 LLPR uncertainty 覆盖该差异.

生产模拟使用 1152 atoms, $17\times17\times90$ Å cell, 1 ns, 4 fs timestep, 950-1200 K 每 50 K 一点. 这是对 long, large-scale workflow 的实质检验, 但只有一个 composition path 与一套 DFT protocol.

