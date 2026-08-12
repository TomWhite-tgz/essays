---
title: LLPR 不确定性与传播
description: Last-layer prediction rigidity, shallow ensemble, 熔点与声子不确定性.
---

# LLPR 不确定性与传播

## Equation 1

LLPR predictive variance 为

$$
\sigma_i^2=\alpha\mathbf f_i^\top
\left(\mathbf F^\top\mathbf F+\varepsilon^2\mathbf I\right)^{-1}
\mathbf f_i. \tag{1}
$$

$\mathbf f_i$ 是 sample $i$ 的 last-layer features, $\mathbf F$ 的 rows 为训练结构 features, $\varepsilon$ 是 regularizer, $\alpha$ 是 calibration scale. 它类似 last-layer Bayesian linear regression 或 ridge leverage score: 若新 feature direction 在训练 feature span 中支撑较弱, variance 较大.

## 为什么便宜

Full deep ensemble 需训练并运行多个完整网络. LLPR 复用已经训练好的 backbone, 只在 last-layer weight distribution 上取样, 因而 raw uncertainty 与 128-member shallow ensemble 的额外代价很小.

![PET-MAD LLPR calibration](/images/pet-mad/fig-s6.png)

Figure S6 的 predicted vs actual error 在 MAD test set 上接近期望分布. 这是 in-domain calibration evidence. 对新元素组合, charge state 或强磁性体系, last-layer feature distance 可能低估 backbone representation bias.

## 从单点误差到 observable

Shallow ensemble 给出多个 energy functions. 对复杂 workflow 可:

1. 用 mean model 生成 trajectory.
2. 每个 ensemble member 对沿途结构重新评估 energy.
3. 通过 thermodynamic reweighting 得到每个 member 的 observable.
4. 用 observable distribution 表示 epistemic uncertainty.

GaAs 中 PET-MAD 得到 $1111\pm72$ K, PET-Bespoke 与 LoRA 分别约 $1169\pm4$ K 和 $1169\pm3$ K. PET-MAD 的大 uncertainty 正确包围了相对 specialized models 的偏差.

但 reweighting 依赖 trajectory 与 ensemble target distribution 有足够 overlap. 若 member energy 差异太大, effective sample size 会崩溃, "几乎零额外 cost" 不等于任意 distribution shift 都可靠.

## 声子 band uncertainty

![声子频带 LLPR ensemble](/images/pet-mad/fig-s7.png)

Figure S7 比较 BeO, BeTe 和 LiBr. BeO optical modes 相对 DFT 偏软, ensemble variance 也在这些 modes 增大. 这说明 UQ 能定位部分频率域错误.

三种材料来自 phononDB. 作者核对 BeO reference 与 MAD settings 得到约 3 cm$^{-1}$ frequency RMSD, 因而主要 softening 更可能来自 MLIP. 但只有三个代表体系, 不能据此证明 phonon uncertainty 全局 calibrated.

## UQ 能与不能做什么

LLPR 主要近似 epistemic uncertainty, 即 training coverage 不足. 它不能自动包含:

- PBEsol 相对 experiment 或 higher-level theory 的 systematic bias.
- Spin, dispersion 等被 reference protocol 主动忽略的物理.
- 数据错误与 numerical convergence bias.
- Last-layer approximation 没表示的 deep feature uncertainty.

因此 GaAs 模型 uncertainty 只有约 72 K, 而相对实验仍偏低约 400 K, 正好展示 model uncertainty 与 reference error 的分离.

