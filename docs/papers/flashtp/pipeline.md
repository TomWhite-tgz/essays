---
title: MLIP 的四阶段计算链
description: 从能量, 力和参数梯度解释 FlashTP 为什么必须优化 forward, backward 与 double-backward.
---

# 1. MLIP 的四阶段计算链

FlashTP 同时报告 forward, backward 和 double-backward 性能. 这里的 backward 不能简单理解为普通训练反向传播. 对能量守恒 MLIP, 推理阶段本身就包含一次对原子坐标的求导, 而力损失训练还要对这次导数再次求导.

## 从能量得到力

设模型参数为 $\boldsymbol{\theta}$, 原子坐标为 $\boldsymbol{R}$, 模型预测总能量为

$$
E_{\boldsymbol{\theta}}=E_{\boldsymbol{\theta}}(\boldsymbol{R},\boldsymbol{Z}).
$$

第 $i$ 个原子的力由能量负梯度给出:

$$
\boldsymbol{F}_{i,\boldsymbol{\theta}}
=-\dfrac{\partial E_{\boldsymbol{\theta}}}{\partial \boldsymbol{R}_i}.
$$

因此, 一次 MD 推理至少有两个计算阶段.

1. Forward 计算 $E_{\boldsymbol{\theta}}$.
2. Backward 对坐标求导, 得到所有 $\boldsymbol{F}_{i,\boldsymbol{\theta}}$.

第二步虽然由自动微分系统执行 backward, 但它不是用损失更新参数. 它只是计算能量对输入坐标的导数.

## 为什么训练出现 double-backward

假设能量与力联合损失为

$$
\mathcal{L}
=\lambda_E\mathcal{L}_E(E_{\boldsymbol{\theta}},E^{\mathrm{ref}})
+\lambda_F\mathcal{L}_F(\boldsymbol{F}_{\boldsymbol{\theta}},\boldsymbol{F}^{\mathrm{ref}}).
$$

能量损失对参数的梯度只经过能量 forward:

$$
\dfrac{\partial\mathcal{L}_E}{\partial\boldsymbol{\theta}}
=\dfrac{\partial\mathcal{L}_E}{\partial E_{\boldsymbol{\theta}}}
\dfrac{\partial E_{\boldsymbol{\theta}}}{\partial\boldsymbol{\theta}}.
$$

力损失则依赖能量对坐标的一阶导数. 再对参数求导时出现混合二阶导数:

$$
\begin{aligned}
\dfrac{\partial\mathcal{L}_F}{\partial\boldsymbol{\theta}}
&=\sum_i
\dfrac{\partial\mathcal{L}_F}{\partial\boldsymbol{F}_{i,\boldsymbol{\theta}}}
\dfrac{\partial\boldsymbol{F}_{i,\boldsymbol{\theta}}}{\partial\boldsymbol{\theta}}\\
&=-\sum_i
\dfrac{\partial\mathcal{L}_F}{\partial\boldsymbol{F}_{i,\boldsymbol{\theta}}}
\dfrac{\partial^2E_{\boldsymbol{\theta}}}
{\partial\boldsymbol{\theta}\,\partial\boldsymbol{R}_i}.
\end{aligned}
$$

自动微分中的 backward-of-backward 因此对应论文 Figure 1 的 double-backward. 这不是可选开销. 只要以能量梯度生成力并用力标签训练, 就必须传播这类二阶导数.

## Figure 1 的四步

论文把完整链条编号为 4 个阶段.

| 阶段 | 计算 | 出现场景 |
| --- | --- | --- |
| 1 | 模型 forward 得到能量 | 推理与训练 |
| 2 | 能量对坐标 backward 得到力 | 推理与训练 |
| 3 | 力损失经过阶段 2 的 double-backward | 训练 |
| 4 | 能量损失的普通 backward | 训练 |

阶段 2 和阶段 4 在 Tensor-Product kernel 层面的计算形式相同, 但上游梯度来源不同. 阶段 2 的上游量是能量本身, 阶段 4 的上游量是能量损失.

## 为什么 double-backward 加速尤其重要

论文的 kernel microbenchmark 显示, e3nn 的 double-backward 延迟随 $l_{\max}$ 快速上升. 在 FP32, $l_{\max}=4$ 时, e3nn 的 forward, backward 和 double-backward 分别为 $45.58$, $268.48$ 和 $1196.89\,\mathrm{ms}$. 最后一项远大于 forward.

这解释了一个容易忽略的事实: 只优化部署推理所需的 forward 并不足以解决 MLIP 训练成本. FlashTP 必须为一阶和二阶自动微分显式实现高效 kernel, 否则训练加速不会随 forward 加速自然出现.

## 本章结论

能量守恒 MLIP 的推理是 forward 加一次输入梯度, 训练则在此基础上再传播能量损失和力损失. FlashTP 的 3 类 microbenchmark 正好对应这条计算链, 不是为了凑齐常规深度学习术语. 论文中最大的 kernel speedup 出现在 double-backward, 因为原实现在那里产生最多的中间流量与 kernel 调度开销.

