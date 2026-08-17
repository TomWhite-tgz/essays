---
title: score 网络与联合损失
description: 逐式解读 MatterGen 补充材料公式 A32-A44.
---

# 4. score 网络与联合损失

本章覆盖 Supplementary A.8-A.9 和公式 A32-A44. 前几章已经定义 3 种前向噪声. 现在需要一个共享网络读取带噪晶体, 分别输出元素 logits, 原子坐标 score 与晶格 score, 再用 3 类损失联合训练.

## 网络骨架

MatterGen 改造 GemNet-dT, 使用 4 个消息传递层, $7\,\text{\AA}$ 邻居截断和 512 维节点与边表示. GemNet-dT 原本直接预测非保守力, 因而天然适合输出像力一样旋转等变的坐标 score.

这里"不保守"表示输出不要求是某个标量能量对坐标的负梯度. 对生成模型而言, 目标本来就是带噪分布的 score, 没有必要先预测能量再求导.

## A32: 原子类型分类头

$$
\log p_{\boldsymbol{\theta}}
(\boldsymbol{A}_0\mid\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)
=\boldsymbol{H}^{(L)}\boldsymbol{W}. \tag{A32}
$$

$\boldsymbol{H}^{(L)}\in\mathbb{R}^{n\times d}$ 是最后一个消息传递层的节点表示, 每一行对应一个原子位置. $\boldsymbol{W}\in\mathbb{R}^{d\times K}$ 把每个节点映射到 $K$ 个类别 logits, 其中包括 MASK 类.

式子左侧写作 log probability, 但正文明确说是未归一化 log-probabilities. 实现中还需对类别维做 softmax 才得到概率. 由于 $\boldsymbol{H}^{(L)}$ 已聚合坐标, 晶格, 带噪元素和扩散时间, 这不是独立位置的元素频率分类, 而是条件于完整晶体环境预测 $\boldsymbol{A}_0$.

## A33: 边长对晶格矩阵的导数

设周期边 $(i,j,\boldsymbol{k})$ 的分数位移与笛卡尔位移分别为

$$
\begin{aligned}
\boldsymbol{d}_{ij\boldsymbol{k}}
&=\boldsymbol{x}^{j}_t-\boldsymbol{x}^{i}_t+\boldsymbol{k},\\
\widetilde{\boldsymbol{d}}_{ij\boldsymbol{k}}
&=\boldsymbol{L}_t\boldsymbol{d}_{ij\boldsymbol{k}},\\
\widetilde{d}_{ij\boldsymbol{k}}
&=\left\lVert\widetilde{\boldsymbol{d}}_{ij\boldsymbol{k}}\right\rVert_2.
\end{aligned}
$$

则

$$
\begin{aligned}
\dfrac{\partial\widetilde{d}_{ij\boldsymbol{k}}}{\partial\boldsymbol{L}_t}
&=\dfrac{\partial}{\partial\boldsymbol{L}_t}
\left\lVert
\boldsymbol{L}_t
(\boldsymbol{x}^{j}_t-\boldsymbol{x}^{i}_t+\boldsymbol{k})
\right\rVert_2\\
&=\dfrac{1}{\widetilde{d}_{ij\boldsymbol{k}}}
\widetilde{\boldsymbol{d}}_{ij\boldsymbol{k}}
\boldsymbol{d}_{ij\boldsymbol{k}}^{\mathsf{T}}.
\end{aligned} \tag{A33}
$$

推导使用 $\mathrm{d}\lVert\boldsymbol{y}\rVert_2/\mathrm{d}\boldsymbol{y}=\boldsymbol{y}/\lVert\boldsymbol{y}\rVert_2$. 改变晶格矩阵会改变每条边的真实长度, A33 给出这种敏感度.

外积
$\widetilde{\boldsymbol{d}}\boldsymbol{d}^{\mathsf{T}}$
是 $3\times3$ 矩阵, 正好与晶格 score 同形. 它把网络对一条边"应变长还是变短"的标量意见转化为对 9 个晶格矩阵分量的更新方向.

## A34: 从所有边聚合一层晶格 score

第 $l$ 层边表示为 $\boldsymbol{m}^{l}_{ij\boldsymbol{k}}$. 标量网络 $\phi^{l}$ 为每条边预测一个系数. 初始构造为

$$
\begin{aligned}
\widehat{\boldsymbol{s}}^{l}_{\boldsymbol{L},\boldsymbol{\theta}}
(\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)
=\dfrac{1}{|\mathcal{E}|}
\sum_{(ij\boldsymbol{k})\in\mathcal{E}}
\phi^{l}(\boldsymbol{m}^{l}_{ij\boldsymbol{k}})
\dfrac{
\widetilde{\boldsymbol{d}}_{ij\boldsymbol{k}}
\boldsymbol{d}_{ij\boldsymbol{k}}^{\mathsf{T}}
}{
\widetilde{d}_{ij\boldsymbol{k}}
}.
\end{aligned} \tag{A34}
$$

$1/|\mathcal{E}|$ 做边数归一化, 避免更大晶胞或更多邻居仅因边多而产生更大的 score. $1/\widetilde d$ 来自 A33 的长度导数. $\phi^l$ 决定每条边对晶胞形变的方向和强度.

这个构造类似从成对相互作用累积 virial 或应力, 但 $\phi^l$ 是生成网络学到的去噪系数, 不是实际力或能量导数.

## A35: 矩阵形式暴露非对称问题

将分数边向量和笛卡尔边向量分别堆成
$\boldsymbol{D},\widetilde{\boldsymbol{D}}\in\mathbb{R}^{3\times|\mathcal{E}|}$,
并令

$$
\boldsymbol{\Phi}^{l}
=\operatorname{diag}
\left(
\dfrac{
\phi^{l}(\boldsymbol{m}^{l}_{ij\boldsymbol{k}})
}{|\mathcal{E}|\widetilde d_{ij\boldsymbol{k}}}
\right),
$$

则

$$
\widehat{\boldsymbol{s}}^{l}_{\boldsymbol{L},\boldsymbol{\theta}}
=\widetilde{\boldsymbol{D}}
\boldsymbol{\Phi}^{l}
\boldsymbol{D}^{\mathsf{T}}
=\boldsymbol{L}_t\boldsymbol{D}
\boldsymbol{\Phi}^{l}
\boldsymbol{D}^{\mathsf{T}}. \tag{A35}
$$

$\boldsymbol{D}\boldsymbol{\Phi}^{l}\boldsymbol{D}^{\mathsf{T}}$ 是对称矩阵, 但左侧额外乘 $\boldsymbol{L}_t$ 后一般不再对称. A27-A28 已把晶格扩散限制在对称矩阵子空间, 所以非对称 score 会指向该子空间之外, 与前向过程不一致.

## A36: 把晶格 score 对称化

作者再右乘 $\boldsymbol{L}_t^{\mathsf{T}}$, 并修改距离归一化:

$$
\begin{aligned}
\boldsymbol{s}^{l}_{\boldsymbol{L},\boldsymbol{\theta}}
&=\boldsymbol{L}_t\boldsymbol{D}
\widetilde{\boldsymbol{\Phi}}^{l}
\boldsymbol{D}^{\mathsf{T}}\boldsymbol{L}_t^{\mathsf{T}}\\
&=\widetilde{\boldsymbol{D}}
\widetilde{\boldsymbol{\Phi}}^{l}
\widetilde{\boldsymbol{D}}^{\mathsf{T}},
\end{aligned} \tag{A36}
$$

其中

$$
\widetilde{\boldsymbol{\Phi}}^{l}
=\operatorname{diag}
\left(
\dfrac{
\phi^{l}(\boldsymbol{m}^{l}_{ij\boldsymbol{k}})
}{|\mathcal{E}|\widetilde d_{ij\boldsymbol{k}}^{2}}
\right).
$$

任意形如 $\boldsymbol{Y}\boldsymbol{C}\boldsymbol{Y}^{\mathsf{T}}$ 且 $\boldsymbol{C}$ 为对角矩阵的结果都对称, 因而 A36 自动落在对称晶格子空间.

距离平方归一化还赋予尺度不变性. 若所有笛卡尔边按比例 $c$ 放大, 两个外积因子给出 $c^2$, 分母 $\widetilde d^2$ 也给出 $c^2$, 二者抵消. 所以晶胞整体缩放不会仅凭尺寸改变无量纲的输出形式.

## A37: 跨层累积晶格 score

$$
\boldsymbol{s}_{\boldsymbol{L},\boldsymbol{\theta}}
(\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)
=\sum_{l=1}^{L}
\boldsymbol{s}^{l}_{\boldsymbol{L},\boldsymbol{\theta}}
(\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t). \tag{A37}
$$

不同消息传递层包含不同感受野与抽象程度的边信息. A37 不是只读取最后一层, 而是把每层提出的晶格修正相加. 输出保持 A36 的对称性, 尺度不变性和旋转等变性.

## A38-A39: 为什么它像应力张量

补充材料用 $\rho$ 表示超胞复制, 用 $\boldsymbol{R}$ 表示旋转. 对称应力型输出满足

$$
\boldsymbol{\sigma}'(\rho\boldsymbol{M})
=\boldsymbol{\sigma}(\boldsymbol{M}). \tag{A38}
$$

$$
\boldsymbol{\sigma}'(\boldsymbol{R}\boldsymbol{M})
=\boldsymbol{R}
\boldsymbol{\sigma}(\boldsymbol{M})
\boldsymbol{R}^{\mathsf{T}}. \tag{A39}
$$

A38 表示复制同一周期结构不改变强度型张量. A39 是二阶张量的旋转规律. A36 中以边数归一化并以距离平方归一化的外积恰好具有这两种性质.

这里"像应力"描述变换规律, 不表示网络在预测热力学应力. 目标是 $\nabla_{\boldsymbol{L}_t}\log q(\boldsymbol{L}_t\mid\boldsymbol{L}_0)$, 即噪声晶格分布的 score.

## A40: 主动加入晶格取向信息

纯周期 GNN 可能无法区分产生同一无限周期结构的两个等价原胞. 为提高晶格 score 的表达力, 作者把边相对 3 个晶格向量的夹角余弦拼入输入:

![同一二维周期结构的两个等价晶胞选择. 周期图相同, 但晶格基底不同.](/images/mattergen/equivalent-lattices.png)

$$
\begin{aligned}
\widehat{\boldsymbol{m}}^{\mathrm{inp}}_{ij\boldsymbol{k}}
=\Big(
&\boldsymbol{m}^{\mathrm{inp}}_{ij\boldsymbol{k}},
\cos(\boldsymbol{d}_{ij\boldsymbol{k}},\boldsymbol{l}^{1}),\\
&\cos(\boldsymbol{d}_{ij\boldsymbol{k}},\boldsymbol{l}^{2}),
\cos(\boldsymbol{d}_{ij\boldsymbol{k}},\boldsymbol{l}^{3})
\Big).
\end{aligned} \tag{A40}
$$

余弦在整体旋转和平移下不变, 但会随具体晶胞基底选择而变化. 因此, 这个设计有意识地放弃"任意等价原胞选择下不变". 作者通过把所有训练结构预先转换为唯一的 Niggli-reduced cell 来固定规范, 从而让同一周期结构尽量只有一个训练表示.

### 审读判断

这是一个典型的规范固定. 与其强迫网络在所有等价晶胞表示上完全不变, 作者先选标准代表元, 再让网络看见标准基底信息. 优点是表达力更强, 缺点是模型依赖 Niggli reduction 的数值稳定性与一致实现, 在简并晶格附近尤其需要谨慎.

## A41: 3 类损失的总和

$$
L
=\lambda_{\mathrm{coord}}L_{\mathrm{coord}}
+\lambda_{\mathrm{cell}}L_{\mathrm{cell}}
+\lambda_{\mathrm{types}}L_{\mathrm{types}}. \tag{A41}
$$

坐标和晶格是连续变量, 使用 score matching. 原子类型是离散变量, 使用 D3PM 变分损失与交叉熵. 3 个 $\lambda$ 不仅改变数值尺度, 也改变共享 GNN 容量在 3 个任务间的分配.

## A42: 坐标 score matching

$$
\begin{aligned}
L_{\mathrm{coord}}
=\sum_{t=1}^{T}\sigma_t^2(n)
\mathbb{E}_{q(\boldsymbol{x}_0)}
\mathbb{E}_{q(\boldsymbol{x}_t\mid\boldsymbol{x}_0)}
\Big[
\big\lVert
&\boldsymbol{s}_{\boldsymbol{x},\boldsymbol{\theta}}
(\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)\\
&-\nabla_{\boldsymbol{x}_t}
\log q(\boldsymbol{x}_t\mid\boldsymbol{x}_0)
\big\rVert_2^2
\Big].
\end{aligned} \tag{A42}
$$

它是 A4 在 wrapped normal 坐标核上的实例. 真实目标由 A23-A24 计算, 噪声尺度使用 A22 的 $n$ 归一化版本. 式中只写一个原子, 完整损失还要对晶体内所有原子求和.

网络输入完整带噪晶体, 说明每个原子的去噪方向由所有分支共同决定. 训练目标虽然按原子求和, 消息传递并没有把原子独立处理.

## A43: 晶格 score matching

$$
\begin{aligned}
L_{\mathrm{cell}}
=\sum_{t=1}^{T}
(1-\overline{\alpha}_t)\sigma_t^2(n)
\mathbb{E}_{q(\boldsymbol{L}_0)}
\mathbb{E}_{q(\boldsymbol{L}_t\mid\boldsymbol{L}_0)}
\Big[
\big\lVert
&\boldsymbol{s}_{\boldsymbol{L},\boldsymbol{\theta}}
(\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)\\
&-\nabla_{\boldsymbol{L}_t}
\log q(\boldsymbol{L}_t\mid\boldsymbol{L}_0)
\big\rVert_2^2
\Big].
\end{aligned} \tag{A43}
$$

目标分布是 A30 的高斯, 所以真实晶格 score 可解析求得. 前因子 $(1-\overline{\alpha}_t)\sigma_t^2(n)$ 对应当前晶格噪声方差, 用来均衡不同时刻 score 幅值.

坐标损失中的 $\sigma_t^2(n)$ 与晶格损失中的额外 $1-\overline\alpha_t$ 反映两条前向过程不同: 坐标使用 VE, 晶格使用 VP 并带定制极限方差.

## A44: 原子类型联合条件损失

$$
\begin{aligned}
L_{\mathrm{types}}
=\mathbb{E}_{q(\boldsymbol{a}_0)}\Bigg[
&\sum_{t=2}^{T}
\mathbb{E}_{q(\boldsymbol{a}_t\mid\boldsymbol{a}_0)}
\Big[
D_{\mathrm{KL}}\big[
q(\boldsymbol{a}_{t-1}\mid\boldsymbol{a}_t,\boldsymbol{a}_0)
\mathbin{\|}\\
&\qquad p_{\boldsymbol{\theta}}
(\boldsymbol{a}_{t-1}\mid
\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)
\big]\\
&\qquad-\lambda_{\mathrm{CE}}
\log p_{\boldsymbol{\theta}}
(\boldsymbol{a}_0\mid
\boldsymbol{X}_t,\boldsymbol{L}_t,\boldsymbol{A}_t,t)
\Big]\\
&-\mathbb{E}_{q(\boldsymbol{a}_1\mid\boldsymbol{a}_0)}
\log p_{\boldsymbol{\theta}}
(\boldsymbol{a}_0\mid
\boldsymbol{X}_1,\boldsymbol{L}_1,\boldsymbol{A}_1,1)
\Bigg].
\end{aligned} \tag{A44}
$$

A44 是 A12-A13 的晶体条件版本. 中间时间的 KL 项训练一步反向转移, 交叉熵项直接训练干净元素预测, 最后一项单独处理 $t=1$ 到 $t=0$ 的重建.

与 A12 相比, 最大变化是模型分布现在条件于 $\boldsymbol{X}_t$ 和 $\boldsymbol{L}_t$. 这使反向元素恢复能够利用键长, 配位和晶胞信息. 式子为单个原子书写, 实际对所有原子求和.

## 3 条分支怎样在一次采样中配合

训练完成后, 采样从坐标均匀先验, 晶格 A31 先验和元素 MASK 先验出发. 每个时间步用同一个网络产生 3 类输出:

1. 用坐标 score 执行 wrapped VE 反向更新.
2. 用晶格 score 执行定制 VP 反向更新.
3. 用元素 logits 与 A16 计算 D3PM 反向转移.

Supplementary D.1 报告把连续时间区间离散为 $T=1000$ 步, 每个 predictor 步后增加一个 Langevin corrector. 坐标和晶格的 corrector signal-to-noise ratio 分别为 0.4 和 0.2.

## A.10 消融实验怎样支持这些公式

Table A2 在 MP-20 上训练 MatterGen-MP 与 6 个消融版本. 完整模型的 average RMSD 为 $0.11\,\text{\AA}$, S.U.N. 为 $22.56\%$. 结果最强的不是所有改动都同时改善两个指标, 而是不同组件对失败模式有清楚对应.

- 移除 A22 的原子数噪声缩放后, RMSD 改善到 $0.09\,\text{\AA}$, 但 S.U.N. 降至 $20.59\%$. 作者以更接近实际发现用途的 S.U.N. 为优先, 保留缩放.
- 移除 A27-A28 的对称晶格扩散后, RMSD 为 $0.18\,\text{\AA}$, S.U.N. 为 $17.70\%$.
- 用 CDVAE 的单一最近周期像 heuristic 代替 A23 的 wrapped normal score 后, RMSD 恶化到 $1.41\,\text{\AA}$, S.U.N. 降至 $5.18\%$.
- 移除 A40 的 lattice angle augmentation 后, RMSD 为 $1.32\,\text{\AA}$, S.U.N. 仅 $2.16\%$.
- 用 one-hot 元素上的连续 VPSDE 代替 A10-A17 的 D3PM 后, RMSD 为 $0.58\,\text{\AA}$, S.U.N. 为 $4.32\%$.
- 用标准零均值 VPSDE 代替 A30-A31 的晶格先验时, sampling 因 exploding lattices 失败, 没有可报告指标.

最有力的消融是 wrapped score, lattice angle 和 D3PM, 因为退化幅度远大于随机波动可能解释的范围. A22 的证据更像任务指标取舍, 不能说它同时改善所有几何质量.

## A.11 与 CDVAE 和 DiffCSP 的结构差异

CDVAE 先由 latent variable 一次预测晶格, 随后的 diffusion decoder 只修正坐标和原子类型. 初始晶格错误无法在去噪轨迹中纠正. 它还以最高权重的一个周期副本近似 A23, 而不是截断求和多个副本. VAE posterior 与标准高斯 prior 的 mismatch 也可能使无条件采样偏离训练 latent 分布.

DiffCSP 同样是纯扩散模型, 但以 fractional-coordinate GNN 为主, 原始任务多为给定组成的 crystal structure prediction. 它可扩散元素, 但在 one-hot 表示上使用连续扩散, 而不是 D3PM. MatterGen 的网络内部使用真实笛卡尔距离, 因为同一物理结构扩为超胞时, 笛卡尔距离保持不变, 分数距离会随晶胞表示改变.

需要精确区分"扩散变量"和"网络几何". MatterGen 对分数坐标定义前向扩散, 避免 A26 的历史晶格依赖, 但 GNN 消息传递使用由当前晶格换算出的笛卡尔边, 获得物理长度的可比性. 这两句话并不矛盾.

## 本章结论

A32-A40 不是普通的"用 GNN 输出 3 个头". 它仔细处理了每个输出应满足的数学结构: 元素头是分类 logits, 坐标头像力一样等变, 晶格头像对称应力一样变换. A41-A44 再把连续 score matching 与离散 D3PM 统一到共享表示中. 至此, 无条件 MatterGen 的全部 44 个 A 类编号公式已经闭合.
