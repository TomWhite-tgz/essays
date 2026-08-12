---
title: Atom graph 与 line graph
description: 显式二体和三体关系的图构造, 几何嵌入与复杂度边界.
---

# Atom graph 与 line graph

## 两张图各自表示什么

给定原子集合与周期性晶胞, atom graph $G_a$ 把原子 $i$ 作为节点, 将距离小于 $r_{\mathrm{cut}}^a$ 的原子对 $(i,j)$ 连接为有向边. 边特征包含距离 $r_{ij}$ 的径向基展开.

Line graph $G_l$ 把 atom graph 的有向边视为节点. 若两条键共享中心原子并满足三体 cutoff $r_{\mathrm{cut}}^l$, 则对应 line-graph nodes 之间连接一条边, 其特征编码键角. 因而一条 line-graph edge 对应一个有序三元组和一个三体相互作用.

![Atom graph 转为 line graph](/images/matris/graph_transfor.png)

## 为什么需要两个 cutoff

论文默认 pair cutoff 为 $6.0\,\text{Å}$, 三体 cutoff 为 $4.0$ 到 $4.5\,\text{Å}$. 这样远邻仍能通过 atom graph 参与二体消息传递, 但只为较近邻居枚举角度. 这是 MatRIS 最直接的精度和成本旋钮.

若中心原子 $i$ 在三体 cutoff 内有 $n_i$ 个邻居, 其有序键对数量约为 $n_i(n_i-1)$. 因此 line graph 的角边总数满足

$$
N_{\mathrm{angle}}\sim\sum_i n_i(n_i-1).
$$

在固定密度与固定 cutoff 下, $n_i$ 通常有界, 总成本可随原子数近似线性. 但对于高配位, 极端密度或增大 cutoff 的情况, 局部成本仍按 $n_i^2$ 增长.

## 几何嵌入

元素序号通过可训练 embedding 得到初始 node feature. 距离经 Bessel basis 与 cutoff envelope 展开, 角度经 Fourier basis 展开. 这些输入只依赖元素, 距离和夹角, 因此对整体平移, 旋转和反射保持不变.

![图构造流程](/images/matris/graph_gen.png)

## 表达能力边界

显式角度使模型超越纯距离二体表示, 但 invariant distance-angle 描述并不自动编码手性. 两个互为镜像且具有相同距离和夹角集合的环境仍可能不可区分. 论文也没有给出双图表示的完备性定理, 所以应将其理解为有效的三体归纳偏置, 而不是局部原子环境的严格完备表示.

