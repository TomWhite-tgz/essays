---
title: 体阶表达力与等变误差
description: 审读 SwiGLU-S2 的 body-order counterexamples 与 numerical equivariance tests.
---

# 体阶表达力与等变误差

## Body order 的含义

这里的 $k$-body scalarization 指中心 atom descriptor 依赖多少个邻域 entities 的联合几何. Pair distances 只提供较低体阶信息, 相同距离 multiset 可以对应不同 angles 或更高阶 arrangements.

Self tensor product $x\otimes x$ 将两个 aggregated angular signals 相互作用, 因而一次 FFN 可以形成更高体阶 invariants. 连续堆叠两个这样的 FFNs 类似

$$
(x\otimes x)\otimes(x\otimes x),
$$

包含到 5-body scalarization 的 paths.

## Counterexample 结果

论文使用单个 attention block, 在其后堆叠 1 至 3 个 FFNs:

| Activation | FFNs | 2-body test | 3-body test | 4-body test |
| --- | ---: | ---: | ---: | ---: |
| Gate | 1, 2 或 3 | 50 | 50 | 50 |
| $S^2$ | 1, 2 或 3 | 50 | 50 | 50 |
| SwiGLU-$S^2$ | 1 | 100 | 50 | 50 |
| SwiGLU-$S^2$ | 2 | 100 | 100 | 100 |
| SwiGLU-$S^2$ | 3 | 100 | 100 | 100 |

50% 表示两个构型不可区分, 100% 表示成功区分. 结果支持 multiplication 引入 higher-body interaction, 但测试只有三组人工 counterexamples, 不能证明对所有 non-isomorphic geometric graphs 完备.

## 数值等变性

普通 $S^2$ activation 对 grid signal 施加 SiLU, 需要更多 samples 才把 aliasing 压到 float-level. 在 FFN 的 $L_{\max}=6$ test 中:

| Activation | Grid | Equivariance error |
| --- | --- | ---: |
| Gate | 任一报告 grid | $1.31\times 10^{-6}$ |
| ordinary $S^2$ | $(18,18)$ | $3.40\times 10^{-3}$ |
| ordinary $S^2$ | $(32,32)$ | $2.04\times 10^{-6}$ |
| SwiGLU-$S^2$ | $(20,20)$ | $1.24\times 10^{-6}$ |

Attention 还截断到 $M_{\max}=2$, 因而 longitude grid 可进一步减少. $L_{\max}=6$ 时, SwiGLU-$S^2$ 从 $(20,20)$ 降到 $(8,20)$ 仍报告 $1.74\times10^{-6}$, 到 $(6,20)$ 才恶化为 $9.44\times10^{-2}$.

## `strict` 应怎样读

论文以 gate activation 约 $10^{-6}$ 的误差作为 strict equivariance baseline. 这表明误差已降到该 float implementation 的 numerical floor, 不等于数学误差精确为 0. 此外, stochastic dropout 可有意破坏单次 forward equivariance; 公开 activation code 也明确把 grid dropout 标记为 non-equivariant training option.

