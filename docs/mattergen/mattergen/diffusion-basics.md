---
title: 符号, 晶体表示与扩散基础
description: 逐式解读 MatterGen 补充材料公式 A1-A9.
---

# 1. 符号, 晶体表示与扩散基础

本章覆盖 Supplementary A.1-A.4 和公式 A1-A9. 这一段的任务不是描述具体神经网络, 而是先回答 3 个问题: 一个晶体由哪些随机变量组成, 每类变量生活在什么数学空间, 以及普通扩散模型怎样推广为晶体的联合扩散.

## 符号地图

一个含 $n$ 个原子的周期晶体记为 $\boldsymbol{M}$. 原子种类为 $\boldsymbol{A}\in\mathbb{A}^{n}$, 分数坐标为 $\boldsymbol{X}\in[0,1)^{3\times n}$, 晶格矩阵为 $\boldsymbol{L}\in\mathbb{R}^{3\times3}$. 第 $j$ 个晶格向量 $\boldsymbol{l}^{j}$ 是 $\boldsymbol{L}$ 的第 $j$ 列. 笛卡尔坐标记为 $\widetilde{\boldsymbol{X}}\in\mathbb{R}^{3\times n}$.

扩散时间步为 $t\in\{1,2,\cdots,T\}$. $q$ 表示人为规定的前向加噪过程, $p_{\boldsymbol{\theta}}$ 表示要学习的反向生成过程, $\boldsymbol{s}_{\boldsymbol{\theta}}$ 表示 score 网络. 这里的 score 不是评价分数, 而是对数概率密度对当前变量的梯度.

## A1: 一个晶体是三元组

$$
\boldsymbol{M}=(\boldsymbol{A},\boldsymbol{X},\boldsymbol{L}). \tag{A1}
$$

这条定义把生成晶体拆成 3 个子问题. $\boldsymbol{A}$ 决定每个位置是什么元素, $\boldsymbol{X}$ 决定原子在晶胞基底下的位置, $\boldsymbol{L}$ 决定周期重复单元的尺度与形状.

三者不能互相替代. 只给 $\boldsymbol{A}$ 和 $\boldsymbol{X}$ 而没有 $\boldsymbol{L}$, 不能知道真实键长. 只给 $\boldsymbol{X}$ 和 $\boldsymbol{L}$ 而没有 $\boldsymbol{A}$, 不能判断化学相互作用. 这也预告了 MatterGen 的核心难点: 前向过程可以分别加噪, 反向过程却必须联合恢复三者.

晶胞体积为 $\operatorname{Vol}(\boldsymbol{L})=|\det\boldsymbol{L}|$. 物理上要求体积非零, 因而 $\boldsymbol{L}$ 必须可逆. 后面的 A3 正是建立在这一条件上.

## A2-A3: 分数坐标与笛卡尔坐标

$$
\widetilde{\boldsymbol{X}}=\boldsymbol{L}\boldsymbol{X}. \tag{A2}
$$

$$
\boldsymbol{X}=\boldsymbol{L}^{-1}\widetilde{\boldsymbol{X}}. \tag{A3}
$$

把晶格向量作为基底后, 第 $i$ 个原子的笛卡尔位置是 $\widetilde{\boldsymbol{x}}^{i}=x^{i}_{1}\boldsymbol{l}^{1}+x^{i}_{2}\boldsymbol{l}^{2}+x^{i}_{3}\boldsymbol{l}^{3}$. 因此, A2 只是一次基底展开, A3 是逆变换.

分数坐标的优势是周期边界固定为单位立方体. 对任意 $\boldsymbol{k}\in\mathbb{Z}^{3}$, $\boldsymbol{x}$ 与 $\boldsymbol{x}+\boldsymbol{k}$ 表示同一个周期位置. 笛卡尔坐标的周期边界则随 $\boldsymbol{L}$ 变化. MatterGen 同时扩散晶格时, 这一区别会在 A25-A26 中变得关键.

### 容易误读之处

$\boldsymbol{X}$ 的各列不是普通欧氏空间中的无界向量. 数值 $0.99$ 与 $0.01$ 在坐标轴上相差 $0.98$, 但在周期空间中的最短距离只有 $0.02$. 如果直接使用普通高斯而不处理这一拓扑, 模型会在晶胞边界制造虚假的不连续.

## 晶体表示必须尊重哪些对称性

Supplementary A.2 列出能量每原子 $\epsilon(\boldsymbol{M})=E(\boldsymbol{M})/n$ 的 5 类不变性.

1. 同时重排原子种类与坐标, 能量不变.
2. 整体平移所有原子, 能量不变.
3. 整体旋转晶格和结构, 能量不变.
4. 用整数幺模变换选择等价原胞, 能量不变.
5. 把原胞复制为超胞, 每原子能量不变.

这里要区分 invariant 与 equivariant. 标量能量在旋转下不变, 但坐标 score 类似力, 结构旋转后它也必须按同样方式旋转. 晶格 score 类似应力, 在旋转下按二阶张量变换. A33-A39 会把这一要求落实到网络输出.

## A4: score matching 的总目标

$$
\begin{aligned}
\boldsymbol{\theta}^{*}
&=\underset{\boldsymbol{\theta}}{\arg\min}
\sum_{t=1}^{T}\sigma_{t}^{2}
\mathbb{E}_{q(\boldsymbol{x}_{0})}
\mathbb{E}_{q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})}\\
&\quad\left[
\left\lVert
\boldsymbol{s}_{\boldsymbol{\theta}}(\boldsymbol{x}_{t},t)
-\nabla_{\boldsymbol{x}_{t}}\log q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})
\right\rVert_{2}^{2}
\right].
\end{aligned} \tag{A4}
$$

先逐项解释.

- $\boldsymbol{x}_{0}\sim q(\boldsymbol{x}_{0})$ 是真实数据.
- $\boldsymbol{x}_{t}\sim q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})$ 是把真实样本直接加噪到时间 $t$ 的结果.
- $\nabla_{\boldsymbol{x}_{t}}\log q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})$ 是已知加噪分布的真实 score.
- $\boldsymbol{s}_{\boldsymbol{\theta}}$ 是神经网络对该 score 的预测.
- 两层期望表示既对数据样本平均, 也对加噪随机性平均.
- $\sigma_t^2$ 平衡不同噪声尺度的目标幅值.

score 指向对数密度增长最快的方向. 在去噪时, 它告诉采样器怎样从低概率的噪声位置向更像数据的区域移动. 训练并不需要知道数据分布 $q(\boldsymbol{x}_{0})$ 的显式密度, 因为给定干净样本后, 人工加噪核 $q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})$ 是已知的.

作者也指出, 实现中常预测标准化噪声

$$
\boldsymbol{\varepsilon}_{t}
=-\sigma_t\nabla_{\boldsymbol{x}_{t}}
\log q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0}),
$$

而不直接预测 score. 原因是 score 的尺度会随 $\sigma_t$ 强烈变化, 但标准高斯噪声 $\boldsymbol{\varepsilon}_{t}\sim\mathcal{N}(\boldsymbol{0},\boldsymbol{I})$ 的典型大小不依赖 $t$, 优化更均衡.

## A5: variance-exploding 前向过程

$$
\begin{aligned}
q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{t-1})
&=\mathcal{N}\left(
\boldsymbol{x}_{t-1},
(\sigma_t^2-\sigma_{t-1}^2)\boldsymbol{I}
\right),\\
q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})
&=\mathcal{N}\left(
\boldsymbol{x}_{0},
\sigma_t^2\boldsymbol{I}
\right).
\end{aligned} \tag{A5}
$$

PDF 的第一项均值应理解为 $\boldsymbol{x}_{t-1}$, 即每一步在当前状态上增加零均值高斯噪声. 独立高斯增量的方差可相加, 所以从第 0 步直接到第 $t$ 步的累计方差恰好是 $\sigma_t^2$. 这解释了为什么训练时不必真的执行 $t$ 次加噪, 可以直接采样 $\boldsymbol{x}_{t}$.

名称 variance-exploding 的含义是信号均值不缩小, 方差随时间增长. MatterGen 把它用于周期坐标, 因为足够大的 wrapped Gaussian 会趋近环面上的均匀分布.

## A6: variance-exploding 反向采样

$$
\begin{aligned}
\boldsymbol{x}_{t-1}
&=\boldsymbol{x}_{t}
+(\sigma_t^2-\sigma_{t-1}^2)
\boldsymbol{s}_{\boldsymbol{\theta}^{*}}(\boldsymbol{x}_{t},t)\\
&\quad+\sqrt{\sigma_t^2-\sigma_{t-1}^2}\,\boldsymbol{z},
\qquad
\boldsymbol{z}\sim\mathcal{N}(\boldsymbol{0},\boldsymbol{I}).
\end{aligned} \tag{A6}
$$

右侧有 3 部分. 第一项保留当前状态. 第二项沿学习到的 score 移动, 是确定性的去噪漂移. 第三项重新注入与该时间步匹配的随机性, 使算法采样整个分布, 而不是只做梯度上升寻找一个模态.

从 $\boldsymbol{x}_{T}\sim\mathcal{N}(\boldsymbol{0},\sigma_T^2\boldsymbol{I})$ 出发反复使用 A6, 最终得到 $\boldsymbol{x}_{0}$. 在周期坐标情形, 高斯要替换为 wrapped normal, 但"score 漂移加随机扩散"的结构不变.

## A7: variance-preserving 前向过程

令 $\alpha_t=1-\beta_t$ 且 $\bar{\alpha}_t=\displaystyle\prod_{i=1}^{t}\alpha_i$. 则

$$
\begin{aligned}
q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{t-1})
&=\mathcal{N}\left(
\sqrt{1-\beta_t}\,\boldsymbol{x}_{t-1},
\beta_t\boldsymbol{I}
\right),\\
q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})
&=\mathcal{N}\left(
\sqrt{\bar{\alpha}_t}\,\boldsymbol{x}_{0},
(1-\bar{\alpha}_t)\boldsymbol{I}
\right).
\end{aligned} \tag{A7}
$$

每一步先把旧信号缩小 $\sqrt{1-\beta_t}$, 再加入方差为 $\beta_t$ 的噪声. 如果输入方差为 1, 输出方差仍为 $(1-\beta_t)+\beta_t=1$, 所以称为 variance-preserving.

$\bar{\alpha}_t$ 是从 1 到 $t$ 的累计信号保留率. 当 $t$ 很大且 $\bar{\alpha}_t\to0$ 时, 原始样本的贡献消失, 极限分布趋近标准高斯. MatterGen 以此为晶格扩散的基础, 但 A30 会修改其极限均值与方差, 避免生成退化晶胞.

## A8: variance-preserving 反向采样

$$
\begin{aligned}
\boldsymbol{x}_{t-1}
&=\dfrac{1}{\sqrt{1-\beta_t}}
\left(
\boldsymbol{x}_{t}
+\beta_t\boldsymbol{s}_{\boldsymbol{\theta}^{*}}(\boldsymbol{x}_{t},t)
\right)
+\sqrt{\beta_t}\,\boldsymbol{z}.
\end{aligned} \tag{A8}
$$

与 A6 相比, A8 多出 $1/\sqrt{1-\beta_t}$, 用来逆转前向过程对信号的收缩. score 项修正均值, 高斯项保持采样多样性. 这条式子是补充材料为了建立直觉而给出的简化祖先采样形式. 实际实现还使用 predictor-corrector 采样, 即每次预测后再以 Langevin corrector 修正.

## A9: 3 类变量的联合前向扩散

$$
\begin{aligned}
&q(\boldsymbol{A}_{t+1},\boldsymbol{X}_{t+1},\boldsymbol{L}_{t+1}
\mid\boldsymbol{A}_{t},\boldsymbol{X}_{t},\boldsymbol{L}_{t})\\
&\quad=q(\boldsymbol{A}_{t+1}\mid\boldsymbol{A}_{t})
q(\boldsymbol{X}_{t+1}\mid\boldsymbol{X}_{t})
q(\boldsymbol{L}_{t+1}\mid\boldsymbol{L}_{t}),
\qquad t=0,1,\cdots,T-1.
\end{aligned} \tag{A9}
$$

A9 规定前向加噪核按原子类型, 坐标和晶格分解. 这是一种人为选择, 目的是让每一类噪声都有可计算的单步核与一步核. 对原子种类和坐标, 还进一步按原子分解:

$$
\begin{aligned}
q(\boldsymbol{A}_{t+1}\mid\boldsymbol{A}_{t})
&=\prod_{i=1}^{n}q(a^{i}_{t+1}\mid a^{i}_{t}),\\
q(\boldsymbol{X}_{t+1}\mid\boldsymbol{X}_{t})
&=\prod_{i=1}^{n}q(\boldsymbol{x}^{i}_{t+1}\mid\boldsymbol{x}^{i}_{t}).
\end{aligned}
$$

最重要的逻辑是: 前向独立不意味着反向独立. 原子应该变成什么元素, 取决于邻居元素, 当前距离与晶格. 坐标应该如何移动, 也取决于元素类型和晶胞. 因此, 网络在预测任一分支时都读取完整的 $(\boldsymbol{A}_{t},\boldsymbol{X}_{t},\boldsymbol{L}_{t})$.

## 本章结论

A1-A3 确定晶体状态空间, A4 给出学习 score 的通用目标, A5-A8 提供两类连续扩散, A9 将它们组织成晶体联合过程. 下一章要解决两个不能直接套用普通高斯的问题: 元素是离散类别, 分数坐标位于环面.
