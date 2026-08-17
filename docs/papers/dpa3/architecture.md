---
title: 消息传递与原子能模型
description: DPA3 的 vertex, edge, convolution, residual update 与 symmetrization.
---

# 消息传递与原子能模型

## 能量, 力与 virial

总能量分解为原子贡献:

$$
E=\sum_i E_i,
$$

其中 $E_i$ 由最终原子 feature, dataset encoding 与 per-dataset element bias 决定. 力和 virial 对能量求导:

$$
F_i=-\nabla_{\boldsymbol r_i}E,\qquad
\Xi_{pq}=-\sum_r\dfrac{\partial E}{\partial h_{rp}}h_{rq}.
$$

因此模型没有独立 direct-force head. 只要能量对坐标可微, 力就在同一个标量 PES 上.

## 一层更新如何进行

对 $G^{(k)}$ 第 $l$ 层, vertex 与 edge feature 分别记为 $v_\alpha^{(k,l)}$ 和 $e_{\alpha\beta}^{(k,l)}$. 两类消息是:

$$
\begin{aligned}
m_{c,\alpha\beta}^{(k,l)}
&=\phi_c\left(v_\alpha^{(k,l)},v_\beta^{(k,l)},e_{\alpha\beta}^{(k,l)}\right),\\
m_{s,\alpha\beta}^{(k,l)}
&=\phi_s\left(v_\alpha^{(k,l)},v_\beta^{(k,l)},e_{\alpha\beta}^{(k,l)}\right).
\end{aligned}
$$

$m_c$ 沿连接边聚合到 vertex, $m_s$ 更新 edge 本身. Vertex update 为:

$$
u_\alpha^{(k,l)}=\phi_u\left(
N_m^{-\alpha_k}
\sum_{\beta\in\mathcal E^{(k)}(\alpha)}
w_{\alpha\beta}^k m_{c,\alpha\beta}^{(k,l)}
\right).
$$

$N_m^{-\alpha_k}$ 控制邻居数归一化, $w_{\alpha\beta}^k$ 负责 cutoff 衰减.

## Trainable residual step

更新不是固定系数相加, 而是:

$$
\begin{aligned}
v_\alpha^{(k,l+1)}
&\gets v_\alpha^{(k,l+1)}+\delta_c^{(k,l)}u_\alpha^{(k,l)},\\
e_{\alpha\beta}^{(k,l+1)}
&\gets e_{\alpha\beta}^{(k,l+1)}+\delta_s^{(k,l)}m_{s,\alpha\beta}^{(k,l)}.
\end{aligned}
$$

可训练 $\delta$ 让每层自己决定更新幅度. Supplementary Figure S-3 显示, 去掉 $\delta$ 的 Add 版本仍随参数下降, 但整体误差略高.

## $G^{(1)}$ 的额外 symmetrization

原子 vertex 还接收 self-message 与对称化特征:

$$
v_i^{(1,l+1)}\gets v_i^{(1,l+1)}
+\delta_{s,0}^{(1,l)}\phi_{s,0}\left(v_i^{(1,l)}\right)
+\delta_{s,1}^{(1,l)}\phi_{s,1}\left(\widetilde v_i^{(1,l)}\right).
$$

$\widetilde v_i$ 拼接 vertex 与 edge 分别经过 `symm` 的结果. `symm` 先用含方向的 $h_{ij}$ 与 invariant feature 做邻居求和, 再形成 Gram-like contraction. 邻居求和消除排列顺序, contraction 消除旋转坐标系.

## Feature 初始化

- $G^{(1)}$ vertex 使用元素 one-hot $Z_i$.
- $G^{(1)}$ edge 以距离 $r_{ij}$ 经 MLP 嵌入.
- $G^{(2)}$ edge 以 $\cos\theta_{ijm}$ 经 MLP 嵌入.
- $G^{(3)}$ edge 以 $\cos\eta_{mijn}$ 经 MLP 嵌入.

这些输入均不依赖绝对平移或旋转坐标系. DPA3 全程使用 invariant scalar feature, 与显式维护 irreducible representation channel 的 equivariant GNN 形成不同路线.

## 最终读取为何只用原子图

作者尝试过 pooling 多阶图的 vertex feature. 浅层网络可获益, 深层网络反而下降. 因此默认模型只把 $v_i^{(1,L)}$ 送入 fitting network. 高阶图仍通过逐层回写影响原子表示, 只是最终 readout 不直接拼接它们.
