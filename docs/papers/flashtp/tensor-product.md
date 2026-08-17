---
title: CG 张量积的数学结构
description: 解读 irreducible representation, angular-momentum path, Clebsch-Gordan 收缩与公式 1.
---

# 2. CG 张量积的数学结构

FlashTP 优化的不是任意 `torch.matmul`, 而是由旋转群表示论约束的 Clebsch-Gordan tensor product. 要理解稀疏性来自哪里, 必须先分清 degree, channel, magnetic component 和 path.

## 等变特征的分块

三维旋转群的一个 degree-$l$ irreducible representation 有 $2l+1$ 个分量. 记 hidden feature 的一块为

$$
\boldsymbol{h}^{(l_h)}
=\left(h_{-l_h}^{(l_h)},\cdots,h_{l_h}^{(l_h)}\right),
$$

边的角向特征块为

$$
\boldsymbol{e}^{(l_e)}
=\left(e_{-l_e}^{(l_e)},\cdots,e_{l_e}^{(l_e)}\right).
$$

$l=0$ 对应旋转不变标量, $l=1$ 对应向量型表示, 更高 $l$ 编码更高阶角向信息. 每个 degree 还可以有多个 channel, channel 复制表示容量, 不改变旋转变换规律.

## 什么是 path

一条 tensor-product path 由三元组

$$
(l_h,l_e,l_{\mathrm{out}})
$$

定义. 它表示把 degree-$l_h$ 的 hidden block 与 degree-$l_e$ 的 edge block 耦合到 degree-$l_{\mathrm{out}}$ 的输出. 如果 3 个 degree 都允许从 $0$ 到 $l_{\max}$, 候选三元组共有 $(l_{\max}+1)^3$ 个, 但不是每个三元组都符合角动量耦合规则.

## 公式 1: 三角选择规则

论文唯一的编号公式是

$$
|l_h-l_e|\leqslant l_{\mathrm{out}}\leqslant l_h+l_e. \tag{1}
$$

它说明两个角动量只能耦合到从差的绝对值到和之间的整数 degree. 例如, $l_h=1$ 与 $l_e=2$ 可以产生 $l_{\mathrm{out}}=1,2,3$, 不能产生 $0$ 或 $4$.

该规则先在 path 层面排除恒为零的耦合. FlashTP 后续利用的 CG sparsity 更细: 即使三元组有效, 对具体 magnetic component 组合, 许多 CG 系数仍然为零.

## 单条 path 的收缩公式

对一条有效 path, CG 收缩可以写成

$$
z_{m_{\mathrm{out}}}^{(l_{\mathrm{out}})}
=\sum_{m_h=-l_h}^{l_h}
\sum_{m_e=-l_e}^{l_e}
C_{l_hm_h,l_em_e}^{l_{\mathrm{out}}m_{\mathrm{out}}}
h_{m_h}^{(l_h)}e_{m_e}^{(l_e)}.
$$

随后用径向网络给出的 path 权重 $r_p$ 缩放:

$$
o_{m_{\mathrm{out}},p}^{(l_{\mathrm{out}})}
=r_pz_{m_{\mathrm{out}}}^{(l_{\mathrm{out}})}.
$$

其中 $C$ 是固定 CG 系数, 它不随样本或边变化. 可训练和输入依赖的部分来自 hidden feature, angular edge feature 与径向权重.

## 原实现为何形成 3 步

Figure 3(b) 把一条 path 拆成:

1. 计算外积 $\boldsymbol{h}\otimes\boldsymbol{e}$.
2. 把展平外积与 CG 系数矩阵相乘, 得到 $\boldsymbol{z}$.
3. 用径向权重 $r_p$ 缩放, 得到 $\boldsymbol{o}$.

在数学上, 这只是上一节双重求和的一种实现. 在 GPU 上, 若每一步都启动独立 kernel 并物化完整外积, 就会把大量本来只需暂存在寄存器中的量写入 DRAM. FlashTP 的核心洞察是直接围绕非零 $C$ 执行乘加, 没有必要先构造稠密外积.

## layer 为什么比一条 path 大得多

Tensor-Product layer 会对每条 edge, 每个 channel 和每条有效 path 重复上述计算. 总任务数为

$$
N_{\mathrm{edge}}N_{\mathrm{ch}}N_{\mathrm{path}}.
$$

论文指出, SevenNet 在 MPF 数据集上平均每个 node 对应约 37 条 edge. 因此逐边张量的第一维远大于逐节点张量. 一条 path 的小中间量乘上 edge, channel 和 path 3 个维度后, 会变成主要显存流量.

## 稀疏性不是 path 无效的同义词

需要区分两个层次.

- 公式 1 排除无效的 degree 三元组, 这减少 $N_{\mathrm{path}}$.
- 有效 path 内部的 CG 系数仍高度稀疏, 这减少实际需要执行的 $(m_h,m_e,m_{\mathrm{out}})$ 乘加.

Table 1 报告, 随 $l_{\max}$ 从 1 增至 5, CG 系数矩阵的零元素比例从 $71\%$ 增至 $86\%$. FlashTP 的 sparse execution 针对的是第二层稀疏, 因而不会改变公式 1 定义的表示空间.

## 本章结论

CGTP 的表达能力来自所有有效 angular-momentum path 及其 CG 耦合. FlashTP 不删除有效 path, 也不更换表示基. 它把同一稠密表达式改写成对非零 CG 系数的直接收缩. 这一区别使它与通过限制 path 或更换基来换取速度的方法在证据上不能混为一谈.

