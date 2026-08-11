---
title: 原子类型扩散与周期坐标起点
description: 逐式解读 MatterGen 补充材料公式 A10-A18.
---

# 2. 原子类型扩散与周期坐标起点

本章覆盖 Supplementary A.5 和 A.6 的开头. A10-A17 把连续扩散改写为原子类别上的离散 Markov 链, A18 则说明为什么周期坐标不能直接使用普通欧氏高斯.

## A10: 离散前向 Markov 链

$$
q(a_{1:T}\mid a_0)
=\prod_{t=1}^{T}q(a_t\mid a_{t-1}). \tag{A10}
$$

$a_0$ 是真实元素类别, $a_t$ 是第 $t$ 步被破坏后的类别. Markov 假设表示下一步只依赖当前类别, 不需要记住完整历史. 这里先讨论一个原子, 完整晶体对所有原子使用同一类转移核.

连续 DDPM 用高斯核逐渐抹去数值信息. 元素没有可用于加高斯噪声的自然连续坐标, 因而 MatterGen 使用 D3PM, 即直接在有限类别集合上定义转移概率.

## A11: 用转移矩阵表示类别加噪

把类别 $a_t$ 写成 one-hot 行向量 $\boldsymbol{a}_t$, 则

$$
q(\boldsymbol{a}_t\mid\boldsymbol{a}_{t-1})
=\operatorname{Cat}
\left(
\boldsymbol{a}_t;
\boldsymbol{p}=\boldsymbol{a}_{t-1}\boldsymbol{Q}_t
\right). \tag{A11}
$$

矩阵元素 $[\boldsymbol{Q}_t]_{ij}=q(a_t=j\mid a_{t-1}=i)$, 所以第 $i$ 行给出类别 $i$ 在一步后转移到所有类别的概率. one-hot 向量左乘 $\boldsymbol{Q}_t$, 恰好选出当前类别对应的那一行.

这不是让元素在周期表上按原子序数随机游走. 最终采用的转移矩阵只允许"保持原元素"或"变成 MASK", 见 A17. 因此, 前向过程表达的是逐步遗忘元素身份, 而不是把 O 逐步改成 F 或 N.

## A12: D3PM 的变分目标

$$
\begin{aligned}
L_{\mathrm{vb}}
=\mathbb{E}_{q(\boldsymbol{a}_0)}\Bigg[
&-\mathbb{E}_{q(\boldsymbol{a}_1\mid\boldsymbol{a}_0)}
\log p_{\boldsymbol{\theta}}(\boldsymbol{a}_0\mid\boldsymbol{a}_1,1)\\
&+D_{\mathrm{KL}}\left[
q(\boldsymbol{a}_T\mid\boldsymbol{a}_0)
\mathbin{\|}q(\boldsymbol{a}_T)
\right]\\
&+\sum_{t=2}^{T}
\mathbb{E}_{q(\boldsymbol{a}_t\mid\boldsymbol{a}_0)}
D_{\mathrm{KL}}\left[
q(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_t,\boldsymbol{a}_0)
\mathbin{\|}
p_{\boldsymbol{\theta}}(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_t,t)
\right]
\Bigg].
\end{aligned} \tag{A12}
$$

这条长公式可以拆成 3 个任务.

第一行是最后一步重建. 当噪声只走到 $t=1$ 时, 模型应能从 $\boldsymbol{a}_1$ 还原 $\boldsymbol{a}_0$. 第二行约束终点. 前向链走到 $T$ 后应接近预设的易采样先验. 第三至第五行训练每一个中间反向步, 让模型后验接近由前向过程和干净类别共同确定的真实后验.

$D_{\mathrm{KL}}[q\mathbin{\|}p]$ 非负, 当两个分布相同为 0. 因而最小化该项就是让学习到的反向转移复制可计算的真实反向转移. A15 将说明后者为什么可计算.

### 一个重要记号差别

真实后验 $q(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_t,\boldsymbol{a}_0)$ 在训练时可以看见干净答案 $\boldsymbol{a}_0$. 生成时没有 $\boldsymbol{a}_0$, 所以模型必须从当前带噪晶体预测它. 这正是 A16 的参数化思路.

## A13: 加入直接预测干净元素的交叉熵

$$
L=L_{\mathrm{vb}}+\lambda_{\mathrm{CE}}L_{\mathrm{CE}}. \tag{A13}
$$

其中

$$
L_{\mathrm{CE}}
=-\mathbb{E}_{q(\boldsymbol{a}_0)}
\left[
\sum_{t=2}^{T}
\mathbb{E}_{q(\boldsymbol{a}_t\mid\boldsymbol{a}_0)}
\log \widetilde{p}_{\boldsymbol{\theta}}
(\boldsymbol{a}_0\mid\boldsymbol{a}_t,t)
\right].
$$

变分目标关注每一步后验是否正确, 交叉熵则直接问"从任意噪声时间能否认出原始元素". $\lambda_{\mathrm{CE}}$ 控制两者权重. 这一辅助目标通常能给网络更直接的分类信号.

## A14: 任意时间的一步采样

$$
\begin{aligned}
q(\boldsymbol{a}_t\mid\boldsymbol{a}_0)
&=\operatorname{Cat}
\left(
\boldsymbol{a}_t;
\boldsymbol{p}=\boldsymbol{a}_0\overline{\boldsymbol{Q}}_t
\right),\\
\overline{\boldsymbol{Q}}_t
&=\boldsymbol{Q}_1\boldsymbol{Q}_2\cdots\boldsymbol{Q}_t.
\end{aligned} \tag{A14}
$$

矩阵乘法把多步 Markov 转移合成一个转移矩阵. 因此, 训练时随机抽到时间 $t$ 后, 不必真的执行 $t$ 次类别更新, 只需用预先计算的 $\overline{\boldsymbol{Q}}_t$ 采样一次. 这与连续扩散中直接使用 $q(\boldsymbol{x}_t\mid\boldsymbol{x}_0)$ 是同一个效率原则.

## A15: 离散反向后验可解析计算

$$
q(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_t,\boldsymbol{a}_0)
=\dfrac{
q(\boldsymbol{a}_t\mid\boldsymbol{a}_{t-1})
q(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_0)
}{
q(\boldsymbol{a}_t\mid\boldsymbol{a}_0)
}. \tag{A15}
$$

这是 Bayes 公式. Markov 性给出
$q(\boldsymbol{a}_t\mid\boldsymbol{a}_{t-1},\boldsymbol{a}_0)
=q(\boldsymbol{a}_t\mid\boldsymbol{a}_{t-1})$.
分子第一项来自单步矩阵 $\boldsymbol{Q}_t$, 第二项来自累计矩阵 $\overline{\boldsymbol{Q}}_{t-1}$, 分母来自 $\overline{\boldsymbol{Q}}_t$. 因此, A12 中作为监督目标的真实后验不需要另一个模型估计.

## A16: 先猜干净元素, 再边缘化

$$
\begin{aligned}
p_{\boldsymbol{\theta}}(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_t,t)
\propto
\sum_{\boldsymbol{a}_0}
q(\boldsymbol{a}_{t-1},\boldsymbol{a}_t\mid\boldsymbol{a}_0)
\widetilde{p}_{\boldsymbol{\theta}}
(\boldsymbol{a}_0\mid\boldsymbol{a}_t,t).
\end{aligned} \tag{A16}
$$

生成时未知 $\boldsymbol{a}_0$. 网络先输出"原始元素是什么"的分布 $\widetilde{p}_{\boldsymbol{\theta}}(\boldsymbol{a}_0\mid\boldsymbol{a}_t,t)$, 再对所有可能的 $\boldsymbol{a}_0$ 求和, 得到下一反向步 $\boldsymbol{a}_{t-1}$ 的分布.

对大约 100 种元素显式求和的复杂度是 $\mathcal{O}(K)$, 成本不高. 更重要的是, 可解析的 $q$ 自动把前向过程的稀疏转移结构带入反向核, 神经网络不必重新学习哪些一步转移在机制上不可能.

在完整 MatterGen 中, 网络不是只看 $\boldsymbol{a}_t$. 它还读取 $\boldsymbol{X}_t$ 与 $\boldsymbol{L}_t$, 因而实际预测为 $p_{\boldsymbol{\theta}}(\boldsymbol{A}_0\mid\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)$. A32 会给出这一分类头.

## A17: MASK 吸收扩散

设 MASK 类别索引为 $m$, 则

$$
[\boldsymbol{Q}^{\mathrm{absorbing}}_t]_{ij}
=
\begin{cases}
1, & i=j=m,\\
1-\beta_t, & i=j\neq m,\\
\beta_t, & j=m\neq i,\\
0, & m\neq i\neq j\neq m.
\end{cases} \tag{A17}
$$

对一个未遮蔽元素, 概率 $1-\beta_t$ 保持原类别, 概率 $\beta_t$ 变为 MASK. 元素之间不能直接互换. 一旦进入 MASK, 第一种情况保证它永远留在 MASK, 因而这是吸收态.

随着时间增加, 越来越多元素身份被擦除, 极限分布是所有位置都为 MASK 的点质量. 反向生成则从全 MASK 或高度遮蔽状态逐步决定每个位置的元素. 这类似 masked language modeling, 但每次恢复必须同时符合三维局部环境与晶格.

### 为什么不使用均匀类别噪声

均匀替换会产生大量把一种真实元素直接变为另一种真实元素的中间态, 网络必须区分"当前元素是可信信号"还是"随机替换噪声". MASK 明确标记未知性, 并让先验极其简单. 代价是生成早期缺少元素身份, 网络更依赖坐标, 晶格与时间嵌入.

## A18: 分数坐标生活在三维环面

$$
\boldsymbol{x}+\boldsymbol{k}\sim\boldsymbol{x},
\qquad \boldsymbol{k}\in\mathbb{Z}^{3}. \tag{A18}
$$

等价关系 $\sim$ 表示两组数值代表同一个物理位置. 每个坐标轴首尾相接形成圆 $\mathbb{S}^{1}$, 3 个轴的直积形成平坦环面
$\mathbb{T}^{3}=\mathbb{S}^{1}\times\mathbb{S}^{1}\times\mathbb{S}^{1}=\mathbb{R}^{3}/\mathbb{Z}^{3}$.

这里的"环面"是拓扑与度量意义上的周期空间, 不应想象成嵌入三维空间的甜甜圈表面. 它仍可局部使用三维坐标, 只是越过 1 后从 0 重新进入. A19 将通过对所有整数平移的高斯副本求和, 构造尊重这一等价关系的 wrapped normal.

## 本章结论

A10-A17 把元素生成变成"逐步遮蔽, 再联合解遮蔽". A18 则为坐标扩散增加周期拓扑. 至此, MatterGen 的 3 条分支已有明确分工: 元素用离散吸收扩散, 坐标将用环面上的连续扩散, 晶格稍后使用对称矩阵上的连续扩散.
