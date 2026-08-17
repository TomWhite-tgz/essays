---
title: 全部编号公式
description: DPA3 v3 Equations 1-20 与 Supplementary Equations S1-S5 的逐式说明.
---

# 全部编号公式

## Equation 1: Logarithmic weighted average

$$
\operatorname{LWA}\left(\{\operatorname{err}_i,w_i\}\right)
=\exp\left[
\dfrac{1}{\sum_i w_i}
\sum_i w_i\log\left(\operatorname{err}_i\right)
\right].
$$

将 $\operatorname{err}_i$ 取 RMSE 或 MAE, 即得到 LWARMSE 或 LWAMAE. 它是 weighted geometric mean, 全部 $w_i=1$ 时是各子集误差的几何平均.

## Equations 2-3: PES 输出

$$
F_i=-\nabla_{\boldsymbol r_i}E,
\qquad
\Xi_{pq}=-\sum_r\dfrac{\partial E}{\partial h_{rp}}h_{rq}.
\tag{2}
$$

$$
E_i=\mathcal F\left(v_i^{(1,L)},c(\mathcal D_m)\right)+e_m(Z_i).
\tag{3}
$$

Equation 2 定义 conservative force 与 virial. Equation 3 定义 dataset-conditioned atomic energy 与 per-dataset element bias.

## Equations 4-8: Message passing

$$
v_\alpha^{(k,l+1)}
\gets v_\alpha^{(k,l+1)}
+\delta_c^{(k,l)}u_\alpha^{(k,l)}.
\tag{4}
$$

$$
e_{\alpha\beta}^{(k,l+1)}
\gets e_{\alpha\beta}^{(k,l+1)}
+\delta_s^{(k,l)}m_{s,\alpha\beta}^{(k,l)}.
\tag{5}
$$

$$
u_\alpha^{(k,l)}=\phi_u\left(
N_m^{-\alpha_k}
\sum_{\beta\in\mathcal E^{(k)}(\alpha)}
w_{\alpha\beta}^k m_{c,\alpha\beta}^{(k,l)}
\right).
\tag{6}
$$

$$
m_{c,\alpha\beta}^{(k,l)}
=\phi_c\left(v_\alpha^{(k,l)},v_\beta^{(k,l)},e_{\alpha\beta}^{(k,l)}\right).
\tag{7}
$$

$$
m_{s,\alpha\beta}^{(k,l)}
=\phi_s\left(v_\alpha^{(k,l)},v_\beta^{(k,l)},e_{\alpha\beta}^{(k,l)}\right).
\tag{8}
$$

$m_c$ 聚合到 vertex, $m_s$ 更新 edge, $\delta_c,\delta_s$ 是可训练 step size.

## Equations 9-11: Cutoff weights

$$
s^k(r_{ij})=
\begin{cases}
\exp\left[-\exp\left(C\dfrac{r_{ij}-r_{cs}^k}{r_{cs}^k}\right)\right],
&0<r_{ij}\leqslant r_c^k,\\
0,&r_{ij}>r_c^k.
\end{cases}
\tag{9}
$$

$$
w_{(ij)(im)}^2=s^2(r_{ij})s^2(r_{im}).
\tag{10}
$$

$$
w_{(ijm)(ijn)}^3=s^3(r_{ij})s^3(r_{im})s^3(r_{in}).
\tag{11}
$$

Equation 9 在 cutoff 内快速衰减, Equations 10-11 把高阶 object 的 constituent bond switches 相乘.

## Equations 12-16: 原子 self-message 与 symmetrization

$$
\begin{aligned}
v_i^{(1,l+1)}\gets{}&v_i^{(1,l+1)}
+\delta_{s,0}^{(1,l)}\phi_{s,0}\left(v_i^{(1,l)}\right)\\
&+\delta_{s,1}^{(1,l)}\phi_{s,1}\left(\widetilde v_i^{(1,l)}\right).
\end{aligned}
\tag{12}
$$

$$
\widetilde v_i^{(1,l)}
=\operatorname{concat}\left[
\operatorname{symm}\left(v_j^{(1,l)},h_{ij}\right),
\operatorname{symm}\left(e_{ij}^{(1,l)},h_{ij}\right)
\right].
\tag{13}
$$

$$
\operatorname{symm}(a_j,b_j)
=\underset{ps}{\operatorname{flatten}}
\left(\sum_q\psi_{pq}\psi_{sq}^{<}\right).
\tag{14}
$$

$$
\psi_{pq}=\dfrac{1}{\sqrt{N_m}}
\sum_{j\in N_{r_c^1}(i)}w_{ij}^1a_{j,p}b_{j,q}.
\tag{15}
$$

$$
\psi_{pq}^{<}=\underset{p}{\operatorname{split}}\left(\psi_{pq}\right).
\tag{16}
$$

其中 $h_{ij}=s^1(r_{ij})(x_{ij},y_{ij},z_{ij})/r_{ij}^2$. 邻居和保证 permutation invariance, contraction 构造 rotational invariant.

## Equations 17-20: Feature initialization

$$
v_i^{(1,0)}=\operatorname{one\_hot}(Z_i).
\tag{17}
$$

$$
e_{ij}^{(1,0)}=\phi_e^{(1)}(r_{ij}).
\tag{18}
$$

$$
e_{(ij)(im)}^{(2,0)}=\phi_e^{(2)}\left(\cos\theta_{ijm}\right).
\tag{19}
$$

$$
e_{(ijm)(ijn)}^{(3,0)}=\phi_e^{(3)}\left(\cos\eta_{mijn}\right).
\tag{20}
$$

它们依次初始化 atom type, bond distance, angle 与 dihedral relation.

## Supplementary Equation S1: SiLUT

$$
\operatorname{SiLUT}(x)=
\begin{cases}
\operatorname{SiLU}(x),&x\leqslant t,\\
\tanh\left(a(x-t)\right)+b,&x>t.
\end{cases}
\tag{S1}
$$

$a,b$ 使 threshold 处一阶与二阶连续, bounded tanh tail 防止深层网络数值爆炸.

## Supplementary Equations S2-S5: Ablation updates

普通 Add update 为:

$$
v_\alpha^{(k,l+1)}
\gets v_\alpha^{(k,l+1)}+u_\alpha^{(k,l)}.
\tag{S2}
$$

$$
e_{\alpha\beta}^{(k,l+1)}
\gets e_{\alpha\beta}^{(k,l+1)}+m_{s,\alpha\beta}^{(k,l)}.
\tag{S3}
$$

LayerNorm update 为:

$$
v_\alpha^{(k,l+1)}
\gets\operatorname{LayerNorm}\left(v_\alpha^{(k,l+1)}+u_\alpha^{(k,l)}\right).
\tag{S4}
$$

$$
e_{\alpha\beta}^{(k,l+1)}
\gets\operatorname{LayerNorm}\left(e_{\alpha\beta}^{(k,l+1)}+m_{s,\alpha\beta}^{(k,l)}\right).
\tag{S5}
$$

Supplementary Figure S-3 用它们隔离 trainable residual step, SiLUT 与 LayerNorm 对 depth scaling 的影响.
