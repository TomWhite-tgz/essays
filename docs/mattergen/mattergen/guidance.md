---
title: 属性适配与条件引导
description: 逐式解读 MatterGen 补充材料公式 B45-B47 及离散 classifier-free guidance.
---

# 5. 属性适配与条件引导

本章覆盖 Supplementary B.1-B.2. 无条件 MatterGen 学会生成训练分布中的合理晶体, 但材料设计要求模型偏向指定化学体系, 空间群, 带隙, 体模量或磁性. B45 解释怎样把属性注入预训练网络, B46-B47 解释采样时怎样放大属性约束.

## B45: 残差式属性 adapter

给定属性嵌入 $\boldsymbol{g}$, 第 $L$ 个交互层中第 $j$ 个节点的更新为

$$
\begin{aligned}
\widetilde{\boldsymbol{H}}^{(L)}_j
=\boldsymbol{H}^{(L)}_j
+f^{(L)}_{\mathrm{mixin}}
\left(
f^{(L)}_{\mathrm{adapter}}(\boldsymbol{g})
\right)
\mathbb{I}(\text{property is not null}).
\end{aligned} \tag{B45}
$$

$f_{\mathrm{embed}}$ 先把原始属性标签变成向量 $\boldsymbol{g}$. 每个消息传递层之前有一个两层 MLP $f^{(L)}_{\mathrm{adapter}}$, 再经过无偏置线性层 $f^{(L)}_{\mathrm{mixin}}$ 映射到节点隐藏维度. 同一属性向量被加到该晶体的所有节点表示上.

设计有 3 个关键点.

第一, 这是残差注入. 原有表示 $\boldsymbol{H}^{(L)}_j$ 保留, 条件只增加一个偏置方向. 第二, mix-in 层以零初始化, 所以微调刚开始时新增项严格为 0, 模型输出与预训练无条件模型相同. 第三, null 指示函数使同一微调模型既能做有条件预测, 也能做无条件预测, 为 B47 的两次前向计算提供基础.

### adapter 不等于只训练 adapter

Nature 终稿明确说明, 微调时更新全部神经网络权重, 不只是新增的 adapter 和 mix-in 层. 所以这里的 adapter 主要提供稳定的条件注入结构与零初始化起点, 并不是参数高效微调意义上的冻结骨干网络.

微调仍使用 A41-A44 的同类目标, 只是输入加入属性标签. 无标签或主动置空的条件训练无条件分支, 非空条件训练条件分支.

## B46: classifier-free guidance 的目标分布

对目标属性 $c$ 和引导强度 $\gamma$, 定义

$$
\begin{aligned}
p_{\gamma}(\boldsymbol{M}_t\mid c)
&\propto p(c\mid\boldsymbol{M}_t)^{\gamma}
p(\boldsymbol{M}_t)\\
&\propto
\left(
\dfrac{p(\boldsymbol{M}_t\mid c)}{p(\boldsymbol{M}_t)}
\right)^{\gamma}
p(\boldsymbol{M}_t)\\
&\propto
p(\boldsymbol{M}_t\mid c)^{\gamma}
p(\boldsymbol{M}_t)^{1-\gamma}.
\end{aligned} \tag{B46}
$$

第一行从 Bayes 直觉出发. $p(\boldsymbol{M}_t)$ 保持样本像一般材料, $p(c\mid\boldsymbol{M}_t)^{\gamma}$ 奖励满足属性的样本. 第二行用 Bayes 公式
$p(c\mid\boldsymbol{M}_t)\propto p(\boldsymbol{M}_t\mid c)/p(\boldsymbol{M}_t)$
改写. 与 $\boldsymbol{M}_t$ 无关的 $p(c)$ 被吸收到比例常数中.

当 $\gamma=1$ 时, 得到普通条件分布 $p(\boldsymbol{M}_t\mid c)$. 当 $\gamma=0$ 时, 回到无条件分布. 当 $\gamma>1$ 时, 条件分布被强化, 无条件分布指数 $1-\gamma$ 为负, 实质上放大"条件模型相对无条件模型更偏好的方向". 所有条件生成实验采用 $\gamma=2$.

引导通常提高条件命中率, 但可能降低多样性或把样本推向条件模型的外推区域. $\gamma=2$ 是实验选择, 不是由 B46 推导出的最优值.

## B47: 连续变量的引导 score

对分数坐标取对数梯度:

$$
\begin{aligned}
\nabla_{\boldsymbol{X}_t}
\log p_{\gamma}(\boldsymbol{X}_t\mid c)
=&\,\gamma
\nabla_{\boldsymbol{X}_t}
\log q(\boldsymbol{X}_t\mid c)\\
&+(1-\gamma)
\nabla_{\boldsymbol{X}_t}
\log q(\boldsymbol{X}_t).
\end{aligned} \tag{B47}
$$

幂在取对数后变成系数, 乘积变成和, 所以 B46 直接给出两个 score 的线性组合. 把式子改写为

$$
\boldsymbol{s}_{\mathrm{guided}}
=\boldsymbol{s}_{\mathrm{uncond}}
+\gamma
(\boldsymbol{s}_{\mathrm{cond}}-\boldsymbol{s}_{\mathrm{uncond}}),
$$

可以更清楚地看出机制. 先从无条件 score 出发, 再沿"有条件与无条件之差"前进 $\gamma$ 倍. 当 $\gamma=2$ 时, 它越过普通条件 score, 对属性方向做外推.

同一公式也适用于连续晶格 score. 实现上, 条件前向传入 $\boldsymbol{g}_c$, 无条件前向传入 null embedding. 多属性模型则同时传入 $\boldsymbol{g}_{c_1},\boldsymbol{g}_{c_2},\cdots,\boldsymbol{g}_{c_N}$.

### 多属性并非任意组合即可复用

补充材料指出, 当前方案对每一种属性组合都要重新微调一个模型. 例如, 单独训练高磁性模型和低供应链风险模型, 并不能自动组合为双目标模型. 作者将基于条件独立假设组合多个单属性模型留作未来工作.

## 离散原子类型怎样做 guidance

离散类别没有可取的坐标梯度, 所以不能直接使用 B47. 模型先按 A16 预测干净类别分布:

$$
\begin{aligned}
\widetilde q(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_t,c)
\propto\sum_{\boldsymbol{a}_0}
q(\boldsymbol{a}_{t-1},\boldsymbol{a}_t\mid\boldsymbol{a}_0)
\widetilde q(\boldsymbol{a}_0\mid\boldsymbol{a}_t,c).
\end{aligned}
$$

因此, guidance 应施加在 $\boldsymbol{a}_0$ 的预测分布上:

$$
\begin{aligned}
\widetilde q_{\gamma}
(\boldsymbol{a}_0\mid\boldsymbol{a}_t,c)
&\propto
\widetilde q(c\mid\boldsymbol{a}_0,\boldsymbol{a}_t)^{\gamma}
\widetilde q(\boldsymbol{a}_0\mid\boldsymbol{a}_t)\\
&\propto
\widetilde q(\boldsymbol{a}_0\mid c,\boldsymbol{a}_t)^{\gamma}
\widetilde q(\boldsymbol{a}_0\mid\boldsymbol{a}_t)^{1-\gamma}.
\end{aligned}
$$

用模型近似并取对数后得到

$$
\begin{aligned}
\log p_{\boldsymbol{\theta},\gamma}
(\boldsymbol{a}_0\mid\boldsymbol{a}_t,c,t)
=&\,\gamma
\log p_{\boldsymbol{\theta}}
(\boldsymbol{a}_0\mid c,\boldsymbol{a}_t,t)\\
&+(1-\gamma)
\log p_{\boldsymbol{\theta}}
(\boldsymbol{a}_0\mid\boldsymbol{a}_t,t).
\end{aligned}
$$

连续情形在线性组合 score, 离散情形在线性组合 log-probability 或 logits. 两者本质相同, 都在对数概率空间中放大条件与无条件预测之差. 合成 guided 类别分布后, 再放回 A16 的边缘化公式得到 $t\to t-1$ 的原子类型转移.

## 条件标签怎样编码

Supplementary D 给出不同条件的具体表示.

- 化学体系使用目标元素集合的 multi-hot 编码.
- 空间群使用 one-hot 编码.
- 磁密度, 带隙和体模量等标量使用 Transformer 风格的正弦编码.
- 多属性任务同时输入磁密度与 HHI 供应链风险标签.

编码只是告诉网络目标是什么, 不保证标签充分描述真实需求. 例如, 只以铁磁构型计算的磁密度可能把实际反铁磁材料判为高磁性, 只用平均体模量也会掩盖高度各向异性的软方向.

## 本章结论

B45 保留无条件生成能力作为微调起点, B46 定义被强化的条件分布, B47 将其变成连续 score 的线性组合. 离散元素分支则在 logits 层完成同构操作. 条件生成的成功不仅取决于 guidance, 也受标签规模, 标签物理定义和 $\gamma$ 外推强度限制.
