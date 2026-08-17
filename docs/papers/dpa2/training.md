---
title: 单任务与多任务损失
description: 逐式解读 DPA-2 Equation 37-46, 包括 energy-force loss, 动态权重, task sampling 和 shared descriptor 梯度.
---

# 6. 单任务与多任务损失

本章对应 Methods 4.3-4.5 的 Equation 37-46. Multi-task learning 的数学差别不在每个任务的 energy-force loss, 而在参数共享方式与任务抽样.

## Equation 37: 单任务数据

设一个标签协议一致的数据集为

$$
\begin{aligned}
T=\big\{&
(\mathcal{X}_1,E_1^*,\{\boldsymbol{F}_{i,1}^*\}),
\cdots,\\
&
(\mathcal{X}_M,E_M^*,\{\boldsymbol{F}_{i,M}^*\})
\big\}.
\end{aligned} \tag{37}
$$

Descriptor 参数记为 $\boldsymbol{\theta}$, fitting-network 参数记为 $\boldsymbol{\xi}$. 一个 PES 写作 $E^{\boldsymbol{\theta},\boldsymbol{\xi}}(\mathcal{X})$.

## Equation 38-40: Energy-force loss

对 minibatch $B$, loss 为

$$
\begin{aligned}
\mathcal{L}(\boldsymbol{\theta},\boldsymbol{\xi},B,t)
=\dfrac{1}{|B|}\sum_{m\in B}\Bigg[&
\dfrac{p_e(t)}{N_m}
\left|\Delta E_m^{\boldsymbol{\theta},\boldsymbol{\xi}}\right|^2\\
&+\dfrac{p_f(t)}{3N_m}
\sum_i
\left|\Delta\boldsymbol{F}_{i,m}^{\boldsymbol{\theta},\boldsymbol{\xi}}\right|^2
\Bigg].
\end{aligned} \tag{38}
$$

误差定义为

$$
\Delta E_m^{\boldsymbol{\theta},\boldsymbol{\xi}}
=E^{\boldsymbol{\theta},\boldsymbol{\xi}}(\mathcal{X}_m)-E_m^*, \tag{39}
$$

$$
\Delta\boldsymbol{F}_{i,m}^{\boldsymbol{\theta},\boldsymbol{\xi}}
=\boldsymbol{F}_i^{\boldsymbol{\theta},\boldsymbol{\xi}}(\mathcal{X}_m)
-\boldsymbol{F}_{i,m}^*. \tag{40}
$$

Energy squared error 除以原子数 $N_m$, force squared error 除以 $3N_m$. 注意, Equation 38 对 energy 使用的是 total-energy error squared 再除以 $N_m$, 不等同于 per-atom energy error squared, 后者会除以 $N_m^2$.

## Equation 41: Loss prefactor schedule

Energy 与 force prefactors 随 learning rate 变化:

$$
p_{\zeta}(t)
=p_{\zeta}^{\mathrm{start}}
\dfrac{\gamma(t)}{\gamma(0)}
+p_{\zeta}^{\mathrm{limit}}
\left[
1-\dfrac{\gamma(t)}{\gamma(0)}
\right],
\qquad \zeta\in\{e,f\}. \tag{41}
$$

补充材料给出 $p_e$ 从 0.02 增至 1, $p_f$ 从 1000 降至 1. 训练早期强调整体 force landscape, 后期逐渐平衡 energy 与 force. Learning rate 从 $2\times10^{-4}$ 指数衰减到 $3\times10^{-8}$, 总计 100 万步.

## Equation 42-43: 多套标签协议

第 $k$ 个任务的数据为

$$
\begin{aligned}
T_k=\big\{&
(\mathcal{X}_{k1},E_{k1}^*,\{\boldsymbol{F}_{i,k1}^*\}),
\cdots,\\
&
(\mathcal{X}_{kM_k},E_{kM_k}^*,\{\boldsymbol{F}_{i,kM_k}^*\})
\big\}.
\end{aligned} \tag{42}
$$

所有任务共享 $\boldsymbol{\theta}$, 但各自使用 $\boldsymbol{\xi}_k$:

$$
E_k(\mathcal{X})
=E^{\boldsymbol{\theta},\boldsymbol{\xi}_k}(\mathcal{X}). \tag{43}
$$

Equation 43 是理解论文标题中 multi-task learner 的关键. 一个输入构型没有脱离 task index 的唯一预测, 必须指定采用哪个 fitting head.

## Equation 44-46: Multi-task loss

每个 step 抽样任务集合 $S$, 对每个任务再抽 minibatch $B_k$:

$$
\begin{aligned}
&\mathcal{L}
(\boldsymbol{\theta},\{\boldsymbol{\xi}_k\},S,\{B_k\},t)\\
&=\dfrac{1}{|S|}\sum_{k\in S}
\dfrac{1}{|B_k|}\sum_{m\in B_k}
\Bigg[
\dfrac{p_e(t)}{N_m}
\left|\Delta E_{km}^{\boldsymbol{\theta},\boldsymbol{\xi}_k}\right|^2\\
&\qquad
+\dfrac{p_f(t)}{3N_m}
\sum_i
\left|\Delta\boldsymbol{F}_{i,km}^{\boldsymbol{\theta},\boldsymbol{\xi}_k}\right|^2
\Bigg].
\end{aligned} \tag{44}
$$

其中

$$
\Delta E_{km}^{\boldsymbol{\theta},\boldsymbol{\xi}_k}
=E^{\boldsymbol{\theta},\boldsymbol{\xi}_k}(\mathcal{X}_{km})
-E_{km}^*, \tag{45}
$$

$$
\begin{aligned}
\Delta\boldsymbol{F}_{i,km}^{\boldsymbol{\theta},\boldsymbol{\xi}_k}
=\boldsymbol{F}_i^{\boldsymbol{\theta},\boldsymbol{\xi}_k}
(\mathcal{X}_{km})
-\boldsymbol{F}_{i,km}^*.
\end{aligned} \tag{46}
$$

对 shared descriptor 的梯度是所抽任务梯度的平均:

$$
\nabla_{\boldsymbol{\theta}}\mathcal{L}
=\dfrac{1}{|S|}\sum_{k\in S}
\nabla_{\boldsymbol{\theta}}\mathcal{L}_k.
$$

对 head $\boldsymbol{\xi}_k$ 的梯度只来自任务 $k$. 因而 task conflict 只能在 descriptor 中发生, 不同 energy zero 与 DFT systematic bias 可以由各自 head 隔离.

## 实际多任务配置

多任务 DPA-2 使用 8 张 GPU, global batch size 8, 训练 100 万步. 每个 batch item 按 Table 1 weight 有放回抽取 task. 不同 head 的 descriptor gradients 跨 GPU 聚合平均.

为了比较 single-task 与 multi-task source fitting, 单任务模型的有效训练步数设为

$$
T_k^{\mathrm{eff}}
=\dfrac{a_k}{13.2}\times8\times10^6.
$$

这使任务 $k$ 在两种设置中看到的期望样本次数相当. 但 multi-task descriptor 同时受到其他任务更新, 所以总优化路径仍不相同.

## 预训练后怎样微调

下游微调至少做 3 件事:

1. 用预训练 $\boldsymbol{\theta}_p$ 初始化 descriptor.
2. 选择相关 source head 或随机初始化 $\boldsymbol{\xi}_{\mathrm{down}}$.
3. 用下游 labels 重新计算 elementwise energy bias.

Supplementary Figure S2 在 ANI-1x 上比较 Drug head, FerroEle-P head 与 random head. 当样本超过约 $10^3$ 时两个预训练 heads 的 learning curves 接近, random head 在约 $10^4$ 后也追上. 这支持迁移收益主要保存在 descriptor, 但该结论只直接在 ANI-1x head-choice experiment 中验证.

## 一个源码细节

TeX 源码中 Equation 41 的 loss-prefactor index 与 fitting-network 参数都使用了字母 $\xi$. PDF 语义可由上下文区分, 本站将 prefactor index 改记为 $\zeta$ 以避免与 head 参数 $\boldsymbol{\xi}$ 混淆. 这只是解读符号重命名, 不改变公式.

## 本章结论

DPA-2 multi-task training 是 hard parameter sharing: descriptor 共享, PES heads 独立. 它利用 heterogeneous labels 学共同表示, 同时避免把不同 DFT protocols 当成同一 regression target. Transfer 是否成立不由 Equation 44 自动保证, 需要比较 source fitting degradation, zero-shot WARMSE 与 downstream learning curves.
