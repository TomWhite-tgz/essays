---
title: Repformer 与平滑注意力
description: 逐式解读 DPA-2 Equation 24-36, 包括单原子更新, pair gated attention 和 cutoff-smooth softmax.
---

# 5. Repformer 与平滑注意力

本章对应 Equation 24-36. 每个 repformer 同时更新 invariant single-atom channel $f_i$ 与 invariant pair channel $g_{ij}$, 但保持 equivariant direction channel $h_{ij}$ 不变. 相同结构堆叠 12 次.

为避免符号过长, 本章省略部分层上标中的 `2`, 但保留层号 $l$.

## Equation 24-25: Single-atom update

第 $l$ 层更新为

$$
f_i^{l+1}
=\dfrac{1}{\sqrt{3}}
\left[
f_i^l
+\operatorname{MLP}(\widetilde{f}_i^l)
+\operatorname{loc\_attn}(f_i^l)
\right]. \tag{24}
$$

$1/\sqrt{3}$ 对 3 个 residual branches 做尺度归一. 中间表示拼接 4 类信息:

$$
\begin{aligned}
\widetilde{f}_i^l
=\operatorname{concat}\Bigg(&
f_i^l,\\
&\dfrac{1}{N_{r_c^1}^{m}}
\sum_{j\in N_{r_c^1}(i)}
w_{ij}g_{ij}^l\widehat{f}_j^l,\\
&\operatorname{symm}(f_j^l,h_{ij}^l),\\
&\operatorname{symm}(g_{ij}^l,h_{ij}^l)
\Bigg).
\end{aligned} \tag{25}
$$

第二项是由 pair gate $g_{ij}$ 调制的 neighbor convolution. 第三和第四项分别从 neighbor atom feature 与 pair feature 构造方向敏感但最终 rotation-invariant 的高阶环境统计.

## Equation 26-28: Local self-attention

Local attention 的 value aggregation 为

$$
\begin{aligned}
\operatorname{loc\_attn}(f_i^l)
=\operatorname{linear}_{\beta,\eta\rightarrow n_1^2}
\left(
\sum_{j\in N_{r_c^1}(i)}
\sum_{\alpha}
B_{ij}^{l,\eta}
f_{j,\alpha}^{l}
\widehat{V}_{\alpha\beta}^{l,\eta}
\right).
\end{aligned} \tag{26}
$$

Query 与 key 为

$$
\begin{aligned}
\widehat{q}_{i,\gamma}^{l,\eta}
&=\sum_{\alpha}f_{i,\alpha}^l
\widehat{Q}_{\alpha\gamma}^{l,\eta},\\
\widehat{k}_{j,\gamma}^{l,\eta}
&=\sum_{\beta}f_{j,\beta}^l
\widehat{K}_{\beta\gamma}^{l,\eta}.
\end{aligned} \tag{27}
$$

Attention map 为

$$
B_{ij}^{l,\eta}
=\underset{j\in N_{r_c^1}(i)}{\operatorname{softmax}^{*}}
\left(
\dfrac{1}{\sqrt{\widehat{d}}}
\sum_{\gamma}
\widehat{q}_{i,\gamma}^{l,\eta}
\widehat{k}_{j,\gamma}^{l,\eta}
\right). \tag{28}
$$

这是 node-centered local attention. 它不直接使用方向 inner product, 几何信息已经通过 $f_j^l$ 的先前更新进入表示.

## Equation 29-32: Invariant pair update

Pair channel 使用 4 个 branches:

$$
\begin{aligned}
g_{ij}^{l+1}
=\dfrac{1}{\sqrt{4}}\Big[&
g_{ij}^l
+\operatorname{MLP}(g_{ij}^l)\\
&+w_{ij}\operatorname{linear}
(f_i^l\odot f_j^l)\\
&+\operatorname{gated\_attn}(g_{ij}^l,h_{ij})
\Big].
\end{aligned} \tag{29}
$$

Gated attention 聚合共享中心 $i$ 的其他 edge $(i,k)$:

$$
\begin{aligned}
\operatorname{gated\_attn}(g_{ij}^l,h_{ij})
=\operatorname{linear}_{\beta,\eta\rightarrow n_2^2}
\left(
\sum_{k\in N_{r_c^1}(i)}
\sum_{\alpha}
A_{ijk}^{l,\eta}
g_{ik,\alpha}^lV_{\alpha\beta}^{l,\eta}
\right).
\end{aligned} \tag{30}
$$

Query 与 key 由 pair features 构造:

$$
\begin{aligned}
q_{ij,\gamma}^{l,\eta}
&=\sum_{\alpha}g_{ij,\alpha}^l
Q_{\alpha\gamma}^{l,\eta},\\
k_{ik,\gamma}^{l,\eta}
&=\sum_{\beta}g_{ik,\beta}^l
K_{\beta\gamma}^{l,\eta}.
\end{aligned} \tag{31}
$$

Attention score 再乘方向 inner product:

$$
\begin{aligned}
A_{ijk}^{l,\eta}
=\underset{k\in N_{r_c^1}(i)}
{\operatorname{softmax}^{\dagger}}
\Bigg[&
\left(
\dfrac{1}{\sqrt{d}}
\sum_{\gamma}q_{ij,\gamma}^{l,\eta}
k_{ik,\gamma}^{l,\eta}
\right)\\
&\times
\left(
\sum_{\delta}h_{ij,\delta}h_{ik,\delta}
\right)
\Bigg].
\end{aligned} \tag{32}
$$

$h_{ij}\cdot h_{ik}$ 对全局旋转不变, 同时编码两条 bond directions 的夹角. 这使 pair attention 能感知三体角信息而不破坏 rotation invariance.

## Equation 33: 为什么不更新 equivariant channel

作者尝试过

$$
h_{ij}^{l+1}
=\dfrac{1}{\sqrt{2}}
\left[
h_{ij}^l
+\operatorname{linear}_{\eta}
\left(
\sum_{k\in N_{r_c^1}(i)}
A_{ijk}^{\eta}h_{ik}^l
\right)
\right]. \tag{33}
$$

该更新在 symmetry 上有效, 但实验中没有提高 accuracy 且常使训练不稳定, 所以最终 DPA-2 不采用它. 这是一项负结果, 说明架构不是把所有可行 message passing 都堆入模型.

## Equation 34: 标准 softmax 的 cutoff 问题

标准 softmax 为

$$
\operatorname{softmax}(x_{ij})
=\dfrac{\mathrm{e}^{x_{ij}}}
{\displaystyle\sum_k\mathrm{e}^{x_{ik}}}. \tag{34}
$$

若 neighbor set 在原子跨越 $r_c$ 时增加一项, denominator 会突然变化. 即使新 edge 最后乘 $w_{ij}=0$, 其他旧邻居的 normalized weights 仍可能跳变. 简单在 softmax 输出外乘 switch 不够.

## Equation 35-36: Shifted smooth softmax

Node attention 改为

$$
\begin{aligned}
\operatorname{softmax}^{*}(x_{ij})
=w_{ij}\operatorname{softmax}
\left[
w_{ij}(x_{ij}+s^{*})-s^{*}
\right].
\end{aligned} \tag{35}
$$

Pair attention 改为

$$
\begin{aligned}
\operatorname{softmax}^{\dagger}(y_{ijk})
=w_{ij}w_{ik}\operatorname{softmax}
\Big[
w_{ij}w_{ik}(y_{ijk}+s^{\dagger})
-s^{\dagger}
\Big].
\end{aligned} \tag{36}
$$

论文取 $s^{*}=s^{\dagger}=20$. 当 switch 趋于 0, 新项 logit 趋于 $-20$, softmax 内贡献约为 $\mathrm{e}^{-20}$, 外部又乘 $w$. 在固定 padded neighbor slots 的实现中, 这使输入随距离平滑变化.

### 严格平滑性的条件

有限 shift 不会把 softmax denominator 中的新增项严格变成零. 若实现真的在 cutoff 瞬间改变 softmax 的 index set, residual jump 只会被压到 $\mathrm{e}^{-20}$ 量级, 而不是数学上精确消失. "保证平滑" 依赖固定 neighbor slots, 或把这一残差视为数值零. 论文没有在公式旁明确区分这两个实现语义.

## 消融怎样支持这些 branches

Table S5 顺序移除 single-atom channel 的 conv, sym_f, sym_g, local_attn, 以及 pair channel 的 prod_f, gate, attn. Force RMSE 增量分别为 $41.2$, $10.4$, $51.3$, $58.4$, $21.7$, $34.6$, $14.1\,\mathrm{meV/\text{\AA}}$.

Local attention 与 sym_g 的影响最大之一. 在 pair update 中, direction gate 的影响大于 attention contraction 本身. 但这是 sequential removal, 后面一项是在前面组件已移除的模型上测量, 不能当作彼此独立的 Shapley contribution.

## 本章结论

Repformer 把 node convolution, symmetrized geometry, local attention 和 angle-gated pair attention 合在同一 residual block. 它只更新 invariant channels, 把固定 equivariant directions 作为生成三体 invariant 的几何载体. Smooth softmax 是 DPA-2 相对普通 attention 特别重要的 PES 设计, 因为 force accuracy 与 NVE stability 依赖 cutoff 附近的导数连续性.
