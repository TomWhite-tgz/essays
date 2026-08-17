---
title: 全部编号公式
description: MatRIS Eq. 1-17 的含义, 修正性转写与原文记号问题.
---

# 全部编号公式

## Eq. 1-4, 主文核心

Eq. 1 定义 dimension-wise softmax. 为消除原文 edge index 歧义, 可写成

$$
\alpha_{ij,d}=\dfrac{\exp(x_{ij,d})}{\displaystyle\sum_{k\in\mathcal N(i)}\exp(x_{ik,d})}.
$$

Eq. 2 与 Eq. 3 分别从 edge feature 得到 target 和 source attention. 原文两式都写 $\operatorname{Linear}(e_{ij})$, 实现上应使用两个独立 maps, 再分别在 $\mathcal N(i)$ 与 $\mathcal N(j)$ 上做逐维 softmax. Eq. 4 是保守输出:

$$
\mathbf F_i=-\dfrac{\partial E}{\partial\mathbf X_i},\qquad
\boldsymbol\sigma=\dfrac{1}{V}\dfrac{\partial E}{\partial\boldsymbol\epsilon}.
$$

## Eq. 5-7, 几何 embedding

Eq. 5 为元素 embedding 的 affine map. Eq. 6 用 Bessel radial basis 与 cutoff envelope 展开距离. Eq. 7 用 Fourier basis 展开角度. 三者共同产生 atom, bond 与 angle 的初始 invariant features.

径向基的结构可抽象为

$$
b_n(r)=\sqrt{\dfrac{2}{r_{\mathrm{cut}}}}\dfrac{\sin\left(n\pi r/r_{\mathrm{cut}}\right)}{r}u(r),
$$

其中 $u(r)$ 是 envelope. 原文具体 piecewise 定义决定 cutoff 附近的衰减.

## Eq. 8-10, 双图消息流

Eq. 8 描述 line graph 更新 atom-edge feature, 再由 atom graph 更新 node feature. Eq. 9 用 gated MLP 融合中心 feature 与 aggregated message. Eq. 10 给出 target-source separable aggregation.

原文 Eq. 10 的 $ta_{kj}$, $sa_{kj}$ 与邻域中的 $i$, $j$, $k$ 没有一致绑定, 因而不能按字面直接实现. 语义上应分别对 target neighborhood 与 source neighborhood 求和, 然后 concat 两个结果.

## Eq. 11-15, refinement 与 readout

Eq. 11 和 Eq. 12 更新 line-graph 与 atom-graph features. Eq. 13 引入 learnable envelope. 该式对 $k$ 求和时仍写 $\mu_{ij}$ 与 $m_{ij}$, 按上下文应为随 $k$ 变化的 $\mu_{ik}$ 与 $m_{ik}$. Eq. 14 读出原子能与元素 reference. 更自洽的转写为

$$
E=\sum_i\left[\operatorname{MLP}(v_i^N)+\operatorname{ref}(z_i)\right].
$$

Eq. 15 重复给出 force 与 stress 的导数形式, 与 Eq. 4 相同.

## Eq. 16-17, 两种 force loss

Eq. 16 对 batch 内原子平均, Eq. 17 先对每个 graph 内原子平均. 后者使每个结构权重相同, 避免大结构支配 gradient. 原文 Eq. 17 还缺少 Eq. 16 中的 $1/3$, 所以二者既改变 sampling weight, 也改变 absolute scale.

## 公式审读结论

17 个公式足以说明模型概念, 但不足以无歧义复现. Eq. 1, 10, 13, 14 存在 indices 或括号问题, target-source projections 是否共享参数也未明示. 若未来代码发布, 应以代码确定实际实现, 而不是机械照抄这些式子.

