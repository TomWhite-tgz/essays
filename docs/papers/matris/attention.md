---
title: 逐维可分离注意力
description: Dimension-wise softmax, target-source 分支与所谓线性 attention 的准确含义.
---

# 逐维可分离注意力

## Dimension-wise softmax

普通 graph attention 常为每条邻边产生一个 scalar weight, 同一权重作用于全部 feature channels. MatRIS 先将 edge feature 映射为向量, 再沿邻居维度对每个 channel 独立 softmax:

$$
\alpha_{ij,d}=\dfrac{\exp(x_{ij,d})}{\displaystyle\sum_{k\in\mathcal N(i)}\exp(x_{ik,d})}.
$$

这样第 $d$ 个 channel 可以选择与其他 channels 不同的邻居. 表达能力增加的代价只是 edge feature 维度上的逐元素运算, 不需要构造邻居之间的 attention matrix.

## Target 与 source 两个分支

对有向边 $(i,j)$, target branch 在目标节点 $i$ 的入边邻域上归一化, source branch 在源节点 $j$ 的邻域上归一化. 两个分支分别聚合, 再拼接并经 gated MLP 融合. 作者称其为 separable attention, 重点是两个方向并行计算, 而不是在二者之间执行全连接注意力.

这一设计同时用于 line graph 和 atom graph. Line graph attention 先让角信息更新键表示, atom graph attention 再将更新后的键消息汇入原子表示.

## 复杂度应该如何表述

若图已经生成, 每条边只需常数次 linear projection, softmax 与逐元素乘法. 对 feature width 固定的情况, aggregation 相对图边数是 $O(|E|)$. 这就是文中 linear attention 的准确含义.

它不意味着端到端成本总是 $O(N_{\mathrm{atom}})$. MatRIS 还需要生成 line graph, 而 angle edges 的数量约为 $\displaystyle\sum_i n_i(n_i-1)$. 论文效率图又排除了 graph construction, 所以不能用该图证明显式三体前处理也具有同样速度优势.

## 原文公式的记号问题

Eq. 1 的分子写作 $x_{id}$, 分母却对邻居 $k$ 求和, 没有清楚区分中心节点与 edge index. Eq. 2 和 Eq. 3 都写成同一个 $\operatorname{Linear}(e_{ij})$, 但语义上应是 target 与 source 的独立参数. Eq. 10 的 $i$, $j$, $k$ 自由指标也不一致. 本站在解释时按网络意图补齐 indices, 但不把修正后的式子伪装成原文逐字公式.

