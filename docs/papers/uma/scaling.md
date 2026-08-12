---
title: IsoFLOP scaling laws
description: FLOP 近似, compute-optimal model/data 前沿, MoLE 优势与外推边界.
---

# IsoFLOP scaling laws

## 实验范围

Scaling experiment 只做 direct-force pretraining, 不包含 conservative fine-tuning. 模型统一使用 UMA-M geometry settings, 即 $L_{\max}=4$, $M_{\max}=2$, 30 neighbors, 并比较 dense 与 8-expert MoLE.

![UMA dense 与 MoLE scaling](/images/uma/fig3.png)

每档固定 training FLOPs, 再改变 active parameter count 与所见 atoms 数. IsoFLOP 曲线的 parabola minimum 被定义为 compute-optimal point.

## FLOP 近似

作者使用:

$$
C(N,D)\approx\kappa ND,
$$

$N$ 是 parameters, $D$ 是 processed atoms, $\kappa$ 表示 parameter 对每个输入的复用次数. 对该 equivariant edge network, 作者估计:

$$
\kappa\approx270\,\text{FLOPs/parameter/atom}
=9\,\text{FLOPs/parameter/edge}.
$$

它比常见 LLM 的约 6 FLOPs/parameter/token 高两个数量级以上, 原因是同一 weights 在 spherical channels 和多条 edges 上重复使用.

## Compute-optimal model 与 data

拟合式为:

$$
\begin{aligned}
\log N^*(C)&=\alpha\log C+A,\\
\log D^*(C)&=\beta\log C+B.
\end{aligned}
$$

Appendix Table 12 报告:

| Coefficient | Dense | MoLE |
| --- | ---: | ---: |
| $\alpha$ | 0.61 (0.57, 0.65) | 0.56 (0.49, 0.59) |
| $\beta$ | 0.39 (0.35, 0.43) | 0.44 (0.39, 0.43) |
| $A$ | -4.5 (-5.3, -3.8) | -3.8 (-4.65, -2.56) |
| $B$ | 3.6 (2.9, 4.4) | 2.9 (1.6, 3.7) |

括号是 1000 次 bootstrap 后的 10th-90th percentile. MoLE 的 $\beta=0.44$ 却高于所列 upper bound 0.43, 是最终表中未解释的一处数值不一致.

## 从 $10^{20}$ 外推到 $10^{22}$

实际 IsoFLOP experiments 位于约 $10^{18}$-$10^{20}$ FLOPs. 最终 pretraining budget 估为 $O(10^{22})$ FLOPs, 即向外推约 2 个数量级. 外推给出的最大 compute-optimal dense size 约 700M parameters, 对应 UMA-L.

作者实际又继续训练超过 compute-optimal point, 以更小模型换更低 final loss. 因而 scaling law 在这里是资源配置起点, 不是最终 checkpoint 的严格训练配方.

## MoLE 的 active-parameter 优势

Figure 3e 比较相同 validation loss 下的 active params. UMA-M 区间, optimal MoLE 约需 dense model 的 $1/2.5$, 论文给 $\Delta\approx2.5\pm0.2$.

优势并不恒定. 当 active params 增至 700M, 8-expert 5.6B-total model 只比 700M dense 略好. 作者推测数据量成为共同瓶颈. 这使 MoLE 更像中等 active-size 的 capacity multiplier, 而不是无限扩展的免费参数.

## Loss ansatz 与符号问题

Appendix 还写:

$$
\widetilde L(N,D)
=\widehat E
+\dfrac{\widehat A}{N^{\widehat\alpha}}
+\dfrac{\widehat B}{D^{\widehat\beta}}.
$$

若 loss 随 $N,D$ 增大而下降, 分母指数 $\widehat\alpha,\widehat\beta$ 通常应为正. 但 Table 12 将 $\widehat\alpha$ 报为 dense -0.29, MoLE -0.25, 同时 Equation 6 又把它直接写成 log-loss 对 log-$N^*$ 的 slope. 这混用了 decay exponent magnitude 与负 slope 的符号约定.

论文没有报告 $\widehat\beta,\widehat A,\widehat B,\widehat E$ 的最终拟合值, 所以 Equation 5 的完整 ansatz 不能从表中复算.

## 多 epoch 会偏离 scaling

Figure 4 显示 single-task UMA-L force error 会 overfit, multi-task 训练通常更稳.

![Single-task 与 multi-task overfitting](/images/uma/fig4.png)

作者据此把最终训练控制在约 2-3 epochs. 这说明 scaling 前沿不是 dataset 无限制重复时仍成立. Model scaling 与 optimization schedule 纠缠, 不能只看总 token-like atoms 数.

## 最稳妥的结论

UMA 在已测 direct-pretraining 区间建立了有 bootstrap uncertainty 的 compute-optimal scaling, 并量化 MoLE 的中等规模优势. 论文没有验证最终 conservative models, full $10^{22}$ budget 或下游 scientific metrics 遵循相同幂律.
