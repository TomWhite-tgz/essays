---
title: Line graph series
description: 从原子到键, 角和二面角的递归图表示.
---

# Line graph series

## Line graph transform

对图 $G$, line graph $\mathcal L(G)$ 将原图的每条边变成一个新顶点. 若原图两条边共享端点, 对应的新顶点之间连边.

![Line graph transform](/images/dpa3/fig6.png)

以三原子 A, B, C 为例. 原图中的 AB, AC, BC 变成 $\mathcal L(G)$ 的 3 个顶点. 原边 AC 与 BC 共享 C, 所以新图中 AC 与 BC 相连, 这条新边对应原体系的角 A-C-B.

## 递归成 LiGS

从原子邻接图 $G^{(1)}$ 出发:

$$
G^{(k)}=\mathcal L\left(G^{(k-1)}\right),\qquad 1<k\leqslant K.
$$

于是不同阶对象可作如下理解:

| 图 | 顶点对应 | 边对应 |
| --- | --- | --- |
| $G^{(1)}$ | 原子 | 邻近原子对, 即 bond |
| $G^{(2)}$ | $G^{(1)}$ 的 bond | 两条共享原子的 bond, 即 angle |
| $G^{(3)}$ | $G^{(2)}$ 的 angle | 两个共享 bond 的 angle, 即 dihedral relation |
| $G^{(4)}$ | 更高阶 path object | 更高阶局部关系 |

这里的 order 是图递归阶数, 不是电子结构中的 many-body expansion 阶数. 一层层 line graph 会快速增加 edge 数, 所以理论上的任意 $K$ 不等于计算上适合任意 $K$.

## Feature 共享关系

DPA3 最关键的存储与更新关系是:

$$
v^{(k,l)}\equiv e^{(k-1,l)},\qquad k>1.
$$

换言之, 高一阶图的顶点就是低一阶图的边. 模型不重复存储两份 feature, 而是把 $G^{(k)}$ 的 vertex update 回写到 $G^{(k-1)}$ 的 edge feature.

这个关系让多个图不是相互独立的支路, 而是一条耦合的表示链:

$$
\text{atom}\longleftrightarrow\text{bond}\longleftrightarrow\text{angle}\longleftrightarrow\text{dihedral relation}.
$$

## 为什么默认只用 $K=2$

Figure 3 在 DPA2 的 18 个 test sets 上比较 $K=1,2,3$.

![LiGS order 消融](/images/dpa3/fig3.png)

从 $K=1$ 增至 $K=2$ 时, energy 与 force LWARMSE 都明显下降. 继续增至 $K=3$ 却没有保持改善, force 尤其恶化. 作者给出两个解释:

- Angle 已足以描述多数局部几何.
- 显式 dihedral relation 增加优化难度.

这个实验支持 $K=2$ 是当前训练协议下的经验最优点, 不支持 angle 在所有体系中都充分, 也不支持任意高阶 LiGS 必然更强.

## Cutoff 的准确率与成本

Supplementary Table S-10 在 MPtrj/WBM 上给出更直接的成本账:

| LiGS order | $r_c^1$ | $r_c^2$ | Energy MAE | Time |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 4.0 Å | - | 56.1 meV/atom | 0.3 ms/atom |
| 1 | 6.0 Å | - | 39.5 meV/atom | 0.4 ms/atom |
| 2 | 6.0 Å | 4.0 Å | 34.7 meV/atom | 1.3 ms/atom |
| 2 | 6.0 Å | 4.5 Å | 32.2 meV/atom | 1.8 ms/atom |

加入 $G^{(2)}$ 的 12% 误差改善伴随约 3 倍推理成本. 高阶图采用更小 cutoff 不是理论要求, 而是明确的工程折中.
