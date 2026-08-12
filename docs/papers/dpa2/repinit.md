---
title: Repinit 与对称化
description: 逐式解读 DPA-2 Equation 16-23, 包括 pair embedding, symmetrization 和 repformer 投影.
---

# 4. Repinit 与对称化

本章对应 Methods 4.2.2-4.2.3 的 Equation 16-23. Repinit 的任务是把元素, 距离和方向组合为 rotation- 与 permutation-invariant single-atom feature, 再投影到可重复堆叠的 repformer 维度.

## Equation 16: Pair embedding

对中心原子 $i$ 与邻居 $j$, 先拼接两端元素表示和径向标量:

$$
g_{ij}^{rt}
=\operatorname{MLP}\left(
\operatorname{concat}(f_i^0,f_j^0,g_{ij}^0)
\right),
\qquad j\in N_{r_c^0}(i). \tag{16}
$$

上标 $rt$ 可以理解为 radial-type embedding. 它依赖中心元素, 邻居元素与距离, 不直接包含方向, 因而保持 rotation invariance.

## Equation 17: Residual 加对称化环境

Repinit 输出为

$$
f_i^1
=\operatorname{linear}(f_i^0)
+\operatorname{symm}(g_{ij}^{rt},
\widetilde{\boldsymbol{r}}_{ij}). \tag{17}
$$

第一项保留中心原子身份, 第二项聚合 neighbor environment. `symm` 必须同时消除邻居顺序与全局旋转的影响.

## Equation 18-20: Symmetrization operator

对 neighbor-indexed invariant vector $x_j$ 和可含方向分量的 $y_j$, 先构造

$$
p_{\alpha\beta}
=\dfrac{1}{N_{r_c^0}^{m}}
\sum_{j\in N_{r_c^0}(i)}
w_{ij}x_{j,\alpha}y_{j,\beta}. \tag{19}
$$

对 neighbor index 求和使 $p$ 不依赖邻居排列. $w_{ij}$ 保证新邻居跨过 cutoff 时贡献平滑趋于零. 从 $p$ 的 $\alpha$ 维截取前若干分量:

$$
p_{alpha\beta}^{<}
=\underset{\alpha}{\operatorname{split}}
(p_{\alpha\beta}). \tag{20}
$$

最终对方向相关维度 $\beta$ 做 contraction:

$$
\operatorname{symm}(x_j,y_j)
=\underset{\alpha\gamma}{\operatorname{flatten}}
\left(
\sum_{\beta}p_{\alpha\beta}p_{\gamma\beta}^{<}
\right). \tag{18}
$$

若 $y_j$ 的方向部分在旋转 $R$ 下变为 $y_jR^{\mathsf{T}}$, 则 $p$ 同样右乘 $R^{\mathsf{T}}$. contraction 中

$$
(pR^{\mathsf{T}})(p^{<}R^{\mathsf{T}})^{\mathsf{T}}
=pR^{\mathsf{T}}Rp^{<\mathsf{T}}
=pp^{<\mathsf{T}},
$$

因此 rotation 被消去. 这解释了为何输入可以包含等变方向, 输出仍是 invariant descriptor.

## 为什么用固定最大邻居数归一化

Equation 19 除以 $N_{r_c^0}^{m}$, 不是除以当前实际 neighbor count. 若用动态 $|N(i)|$, 新邻居刚进入 cutoff 时即使自身权重为零, 分母变化也会缩放所有旧邻居贡献并产生跳变. 固定最大槽位避免这个问题.

代价是局部密度变化会改变总聚合幅度, 但不会因 neighbor count 的整数跳变制造额外不连续.

## Equation 21-23: 投影到 repformer shape

Repinit 与 repformer 的 channel dimensions 不同, 因而先投影:

$$
f_i^{2,0}=\operatorname{linear}(f_i^1), \tag{21}
$$

$$
g_{ij}^{2,0}=\operatorname{linear}(g_{ij}^1), \tag{22}
$$

$$
h_{ij}^{2,0}=h_{ij}^1. \tag{23}
$$

Single-atom 与 invariant pair channels 用 learned linear maps 改变宽度. Equivariant direction channel 保持原始 3 维向量, 不做 learned component mixing.

## 补充材料中的具体维度

- 初始 single-atom embedding $f_i^0$ 维度为 8.
- Equation 16 的 MLP widths 为 25, 50, 100.
- $g_{ij}^{rt}$ 维度为 100.
- Symmetrization 的 split 保留前 12 个 $\alpha$ channels, 输出 $f_i^1$ 维度为 1200.
- Repformer single-atom channel 为 128, pair-atom channel 为 32.

Repinit 输出很宽, 随后 Equation 21 压缩到 128. 宽 symmetrized feature 提供丰富二阶环境组合, repformer 再以固定宽度迭代传播.

## 本章结论

Repinit 不是普通 neighbor sum. 它把 radial-type embedding 与方向环境矩阵组合, 通过 $pp^{<\mathsf{T}}$ contraction 得到 invariant feature. 固定邻居槽位与 switch 共同维护 cutoff smoothness. Equation 21-23 则建立 12 层 repformer 的统一 state shape.

