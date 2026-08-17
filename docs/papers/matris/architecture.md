---
title: 完整架构与守恒输出
description: 双图消息流, refinement, 原子能 readout 与力和应力的导数关系.
---

# 完整架构与守恒输出

## 一个 MatRIS block

初始 atom nodes 为元素 embedding, atom edges 为径向 embedding, line-graph edges 为角度 embedding. 每个 block 依次执行:

1. Line graph attention, 让三体角信息更新 atom-edge feature.
2. Atom graph attention, 将 edge message 聚合到 atom nodes.
3. Line graph refinement, 用更新后的原子与键表示再次修正三体 feature.
4. Atom graph refinement, 用 gated MLP 和 residual connection 更新原子与边.

S, M, L 分别堆叠 4, 6, 10 层. 三者 feature width 均为 128, 参数量分别为 4.3M, 6.3M, 10.4M.

## 从原子表示到势能

最后一层 node feature 经 MLP 得到原子能贡献, 总能量写成原子贡献之和并加入元素 reference energy. 依赖关系可概括为

$$
E(\mathbf X,\mathbf Z,\mathbf h)=\sum_i E_i,
$$

其中 $\mathbf X$ 为坐标, $\mathbf Z$ 为元素, $\mathbf h$ 为晶胞. 力和应力通过能量导数得到:

$$
\mathbf F_i=-\dfrac{\partial E}{\partial\mathbf X_i},\qquad
\boldsymbol\sigma=\dfrac{1}{V}\dfrac{\partial E}{\partial\boldsymbol\epsilon}.
$$

因此 MatRIS 的 force field 是保守的. 在计算图可微且 cutoff 处理足够平滑时, 闭合路径上的功应为零, 这为 NVE 动力学提供了必要条件.

## 对称性

总能量采用原子求和, 对相同元素原子的 permutation 保持不变. 距离和角度输入对整体平移与正交变换不变, 所以能量是 invariant scalar. 对坐标求导后, 力按 vector 方式随旋转变换.

但守恒性与数值稳定性不是同一件事. 有限时间步, cutoff 邻居切换, 数值精度和未覆盖构型仍可造成能量漂移. 论文只给出 3 个 NVE 例子, 尚不足以把解析守恒推广为广泛的长期稳定.

## Readout 公式的一处歧义

原文 Eq. 14 写作 $E=\sum_i\operatorname{MLP}(v_i^N)+\operatorname{ref}(z_i)$, 使最后一个 $i$ 留在求和号之外. 按原子 reference energy 的通常定义, 预期应为

$$
E=\sum_i\left[\operatorname{MLP}(v_i^N)+\operatorname{ref}(z_i)\right].
$$

这是记号修复, 不是作者在正文中明确给出的勘误.

