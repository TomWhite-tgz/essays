---
title: Merged layer normalization
description: 推导 EquiformerV3 如何跨 degree 共享 RMS 而保持等变性.
---

# Merged layer normalization

## 为什么普通 LayerNorm 不可直接使用

对 $L>0$ feature, 任意混合 $m=-L,\cdots,L$ 的 mean subtraction 会破坏 rotation transformation law. 合法的 normalization statistics 必须是 rotation invariant, 例如同一 irrep 的 squared norm.

EquiformerV2 的 separable LN 将 $L=0$ scalars 单独做 LayerNorm, 对 $L>0$ 汇总 invariant RMS. 但各 degree 使用相对独立的尺度, 归一化后不同 degree 的平均 magnitude 被强行拉到相近水平.

## V3 的 shared RMS

令 $x_{Lmc}$ 表示 degree $L$, order $m$, channel $c$ 的 feature. 先只对 $L=0$ channels 中心化:

$$
\widetilde{x}_{00c}=x_{00c}-\dfrac{1}{C}\sum_{c'=1}^{C}x_{00c'}.
$$

对每个 degree 先平均其 $2L+1$ 个 components, 再对 degrees 与 channels 平均, 得到 shared invariant statistic:

$$
s^2=\dfrac{1}{L_{\max}+1}\sum_{L=0}^{L_{\max}}\dfrac{1}{2L+1}\sum_{m=-L}^{L}\dfrac{1}{C}\sum_{c=1}^{C}\widetilde{x}_{Lmc}^{,2}.
$$

输出为

$$
y_{Lmc}=\gamma_{Lc}\dfrac{\widetilde{x}_{Lmc}}{\sqrt{s^2+\epsilon}}+\mathbb{1}[L=0]\beta_c.
$$

Scale $\gamma_{Lc}$ 对每个 degree 与 channel 可学习, bias 只允许加到 scalars. 因为 $s^2$ 对 rotations invariant, 整个操作保持 equivariance.

![三类 normalization](/images/equiformer-v3/merged-layer-norm.png)

## 实验贡献

OC20 中从 separable setting 换成 merged LN, energy MAE 从 242 降到 236 meV, force MAE 从 19.73 降到 19.28 meV/A, training time 从 154 到 150 GPU-hours. 这是小但干净的增益.

## 需要谨慎之处

论文把不同 degree 的相对 magnitude 视为有用信号, 但没有给出 representation statistics 或跨 seed 方差来证明机制. Table 1 是 sequential ablation, merged LN 的收益只在该前置配置上测得. 它是否在不同 $L_{\max}$, datasets 与 channel allocations 下稳定成立, 仍需 factorial ablation.
