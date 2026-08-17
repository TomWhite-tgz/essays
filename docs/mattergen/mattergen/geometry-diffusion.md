---
title: 周期坐标与晶格扩散
description: 逐式解读 MatterGen 补充材料公式 A19-A31.
---

# 3. 周期坐标与晶格扩散

本章覆盖 Supplementary A.6-A.7 和公式 A19-A31. 这 13 条公式解决晶体扩散中最有特色的几何问题: 原子坐标有周期边界, 晶格本身也在随时间变化, 而不同原子数的晶胞还需要具有相近的物理密度尺度.

## A19: wrapped normal 的概率密度

$$
\mathcal{N}_{\mathrm{W}}
\left(
\overline{\boldsymbol{x}};
\boldsymbol{x},\sigma^{2}\boldsymbol{I},\boldsymbol{I}
\right)
=\sum_{\boldsymbol{k}\in\mathbb{Z}^{3}}
\mathcal{N}
\left(
\overline{\boldsymbol{x}};
\boldsymbol{x}-\boldsymbol{k},\sigma^{2}\boldsymbol{I}
\right). \tag{A19}
$$

普通高斯只在欧氏空间中以一个均值为中心. 周期空间中, $\boldsymbol{x}$, $\boldsymbol{x}+\boldsymbol{k}$ 和 $\boldsymbol{x}-\boldsymbol{k}$ 都是同一点. A19 因而把位于所有整数平移像上的高斯密度相加, 再把结果限制回一个基本胞.

例如, 一维坐标 $x=0.99$ 附近的密度不仅在 $0.99$ 处大, 还会通过相邻副本在 $0.01$ 附近保持连续. 这消除了晶胞边界处的人为断裂.

$\mathcal{N}_{\mathrm{W}}(\boldsymbol{\mu},\boldsymbol{\Sigma},\boldsymbol{B})$ 的最后一个参数给出周期基底. A19 使用 $\boldsymbol{B}=\boldsymbol{I}$, 对应分数坐标的单位周期边界. 当转到笛卡尔坐标时, 周期基底会变为当前晶格 $\boldsymbol{L}_t$.

## A20: 分数坐标的一步加噪

$$
q(\boldsymbol{x}_{t}\mid\boldsymbol{x}_{0})
=\mathcal{N}_{\mathrm{W}}
\left(
\boldsymbol{x}_{t};
\boldsymbol{x}_{0},
\sigma_t^{2}\boldsymbol{I}
\right). \tag{A20}
$$

这是 A5 的 variance-exploding 一步核在环面上的版本. 均值保持为干净坐标, 方差随时间增大. 当 $\sigma_t$ 足够大时, 各个周期副本严重重叠, 环面上的密度趋近均匀分布. 因此, 坐标分支的终点先验可以直接取 $[0,1)^3$ 上的均匀分布.

这里的一步是 one-shot, 表示从 $0$ 直接采样到任意 $t$, 不是只从 $t-1$ 走到 $t$. 它让训练能够随机选择噪声时间, 而不必模拟完整前向轨迹.

## A21: 分数噪声在真实空间中的形状

$$
\begin{aligned}
q(\widetilde{\boldsymbol{x}}_t
\mid\boldsymbol{x}_0,\boldsymbol{L}_t)
=\mathcal{N}_{\mathrm{W}}\Big(
&\widetilde{\boldsymbol{x}}_t;
\boldsymbol{L}_t\boldsymbol{x}_0,\\
&\sigma_t^2\boldsymbol{L}_t\boldsymbol{L}_t^{\mathsf{T}},
\boldsymbol{L}_t
\Big).
\end{aligned} \tag{A21}
$$

A2 给出 $\widetilde{\boldsymbol{x}}_t=\boldsymbol{L}_t\boldsymbol{x}_t$. 高斯随机变量经过线性变换 $\boldsymbol{L}_t$ 后, 均值左乘 $\boldsymbol{L}_t$, 协方差按 $\boldsymbol{\Sigma}\mapsto\boldsymbol{L}_t\boldsymbol{\Sigma}\boldsymbol{L}_t^{\mathsf{T}}$ 变换. 因而, 分数坐标中各向同性的噪声, 在真实空间中通常是沿晶格方向拉伸的椭球.

关键不是公式变换本身, 而是它暴露了一个尺度问题. 如果两个晶胞的分数噪声 $\sigma_t$ 相同, 体积更大的晶胞会得到更大的笛卡尔位移. 协方差行列式为

$$
\left|\det\boldsymbol{\Sigma}_t\right|
=\left(
\sigma_t^3|\det\boldsymbol{L}_t|
\right)^2.
$$

因此, 噪声的广义方差随晶胞体积变化.

## A22: 按原子数缩放坐标噪声

$$
\sigma_t(n)=\dfrac{\sigma_t}{\sqrt[3]{n}}. \tag{A22}
$$

作者假设数据中的晶体具有大致恒定的原子数密度, 即 $n/\operatorname{Vol}(\boldsymbol{L})$ 的典型尺度近似不随 $n$ 改变. 于是 $|\det\boldsymbol{L}|\propto n$. 若仍使用固定 $\sigma_t$, A21 的广义方差将随 $n^2$ 增长.

将每个坐标方向的标准差除以 $\sqrt[3]{n}$ 后, 三维尺度的乘积除以 $n$, 抵消 $|\det\boldsymbol{L}|\propto n$ 的增长:

$$
\left|\det\boldsymbol{\Sigma}_t\right|
=\left(
\dfrac{\sigma_t^3}{n}|\det\boldsymbol{L}_t|
\right)^2.
$$

这是一种数据尺度归一化, 不是严格物理定律. 若训练集含有大量密度异常的多孔晶体, 分子晶体或高压相, "体积正比于原子数"的近似会变弱.

## A23-A24: wrapped normal 的 score

Nature 终稿将 score 写为

$$
\nabla_{\overline{\boldsymbol{x}}}
\log q_{\sigma}(\overline{\boldsymbol{x}}\mid\boldsymbol{x})
=-\sum_{\boldsymbol{k}\in\mathbb{Z}^{3}}
w_{\boldsymbol{k}}
\dfrac{
\overline{\boldsymbol{x}}-\boldsymbol{x}+\boldsymbol{k}
}{\sigma^{2}}. \tag{A23}
$$

其中

$$
\begin{aligned}
w_{\boldsymbol{k}}
&=\dfrac{1}{Z}
\exp\left(
-\dfrac{
\left\lVert
\overline{\boldsymbol{x}}-\boldsymbol{x}+\boldsymbol{k}
\right\rVert_2^2
}{2\sigma^2}
\right),\\
Z
&=\sum_{\boldsymbol{k}'\in\mathbb{Z}^{3}}
\exp\left(
-\dfrac{
\left\lVert
\overline{\boldsymbol{x}}-\boldsymbol{x}+\boldsymbol{k}'
\right\rVert_2^2
}{2\sigma^2}
\right).
\end{aligned} \tag{A24}
$$

A19 是高斯混合. 对混合密度求对数梯度后, score 等于每个周期副本的高斯 score 按后验责任度 $w_{\boldsymbol{k}}$ 加权平均. $Z$ 把所有权重归一化, 所以 $\displaystyle\sum_{\boldsymbol{k}}w_{\boldsymbol{k}}=1$.

负号非常重要. 对单个高斯, score 指向均值, 即从 $\overline{\boldsymbol{x}}$ 指回 $\boldsymbol{x}-\boldsymbol{k}$. 当点靠近边界时, 相邻周期副本可以具有相近权重, 其贡献共同给出连续的最短周期去噪方向.

无限求和不能直接计算. 作者利用高斯尾部快速衰减, 截断到 $\lVert\boldsymbol{k}\rVert_{\infty}\leqslant13$, 共 $(2\times13+1)^3=19683$ 个平移向量. Supplementary Fig. A1 检查不同截断范围下的 score 范数, 并显示较小截断在高噪声区不能正确趋近 0.

![不同整数平移截断范围下的 wrapped normal score 范数. 深色曲线对应最终采用的 $\lVert\boldsymbol{k}\rVert_{\infty}\leqslant13$.](/images/mattergen/wrapped-score-truncation.png)

### 为什么高噪声时 score 应趋近 0

当 wrapped normal 接近环面均匀分布时, $\log q$ 几乎是常数, 常数的梯度为 0. 如果数值截断后仍产生明显非零 score, 采样器会在本应无方向偏好的高噪声区得到伪漂移.

## A25: 若直接扩散笛卡尔坐标, 分解会被破坏

$$
\begin{aligned}
&q(\widetilde{\boldsymbol{X}}_{t+1},\boldsymbol{L}_{t+1},\boldsymbol{A}_{t+1}
\mid\widetilde{\boldsymbol{X}}_t,\boldsymbol{L}_t,\boldsymbol{A}_t)\\
&\quad=q(\widetilde{\boldsymbol{X}}_{t+1}
\mid\widetilde{\boldsymbol{X}}_t,\boldsymbol{L}_{t+1},\boldsymbol{L}_t)
q(\boldsymbol{L}_{t+1}\mid\boldsymbol{L}_t)
q(\boldsymbol{A}_{t+1}\mid\boldsymbol{A}_t).
\end{aligned} \tag{A25}
$$

与 A9 比较, 坐标核现在必须同时条件于旧晶格和新晶格. 原因是从 $t$ 到 $t+1$ 时, 要先用 $\boldsymbol{L}_t^{-1}$ 把旧笛卡尔位置变成分数坐标, 加入周期噪声, 再用 $\boldsymbol{L}_{t+1}$ 转回新晶格下的笛卡尔坐标.

因此, "坐标加噪"和"晶格加噪"不再是两个独立核. A9 的简单联合训练结构被破坏, 且一步坐标分布会依赖整条晶格轨迹.

## A26: 笛卡尔一步核依赖全部历史晶格

$$
\begin{aligned}
&q\left(
\widetilde{\boldsymbol{x}}_t
\mid\widetilde{\boldsymbol{x}}_0,
\{\boldsymbol{L}_{t'}\}_{t'=1}^{t}
\right)\\
&=\mathcal{N}_{\mathrm{W}}\Bigg(
\widetilde{\boldsymbol{x}}_t;
\boldsymbol{L}_t\boldsymbol{L}_0^{-1}\widetilde{\boldsymbol{x}}_0,\\
&\qquad
\boldsymbol{L}_t
\left[
\sum_{t'=1}^{t}
\sigma_{t'}^2
\boldsymbol{L}_{t'}^{-1}
(\boldsymbol{L}_{t'}^{\mathsf{T}})^{-1}
\right]
\boldsymbol{L}_t^{\mathsf{T}},
\boldsymbol{L}_t
\Bigg).
\end{aligned} \tag{A26}
$$

均值 $\boldsymbol{L}_t\boldsymbol{L}_0^{-1}\widetilde{\boldsymbol{x}}_0$ 表示保持初始分数位置不变, 只把它放进时间 $t$ 的晶格. 协方差中的求和则累积每一步噪声, 但每一步都要先通过当时的逆晶格映射回分数空间, 最后再通过 $\boldsymbol{L}_t$ 映射到当前笛卡尔空间.

这条式子说明直接扩散笛卡尔坐标的两个代价. 第一, 为得到随机时间 $t$ 的训练样本, 需要先采样 $\boldsymbol{L}_1,\cdots,\boldsymbol{L}_t$ 的完整轨迹, 失去 one-shot 训练优势. 第二, 长轨迹中反复出现晶格逆矩阵和协方差累加, 数值上可能不稳定. 因此, MatterGen 选择扩散分数坐标, 仅让网络输出以笛卡尔等变形式表示.

## A27: 用极分解固定晶格旋转自由度

Nature PDF 用 $\widetilde{\boldsymbol{L}}$ 表示任意取向的原始晶格, 用 $\boldsymbol{L}$ 表示对称晶格:

$$
\widetilde{\boldsymbol{L}}
=\boldsymbol{U}\boldsymbol{L},
\qquad
\boldsymbol{U}=\boldsymbol{W}\boldsymbol{V}^{\mathsf{T}},
\qquad
\boldsymbol{L}=\boldsymbol{V}\boldsymbol{\Sigma}\boldsymbol{V}^{\mathsf{T}}. \tag{A27}
$$

若原始矩阵的奇异值分解为
$\widetilde{\boldsymbol{L}}=\boldsymbol{W}\boldsymbol{\Sigma}\boldsymbol{V}^{\mathsf{T}}$,
则 A27 把它拆成旋转矩阵 $\boldsymbol{U}$ 与对称正定矩阵 $\boldsymbol{L}$. 晶体分布对整体旋转不敏感, 所以模型没有必要把 3 个旋转自由度也当作要生成的物理内容.

固定旋转后, 对称 $3\times3$ 晶格只有 6 个独立分量, 而不是 9 个. 这降低了扩散维数, 也避免选择一个旋转不变的 9 维晶格先验.

## A28: 对称高斯晶格噪声

从 $\widehat{\boldsymbol{z}}\in\mathbb{R}^{6}$ 采样 6 个独立标准高斯分量, 构造

$$
\boldsymbol{z}
=
\begin{pmatrix}
\widehat{z}_1 & \widehat{z}_4 & \widehat{z}_5\\
\widehat{z}_4 & \widehat{z}_2 & \widehat{z}_6\\
\widehat{z}_5 & \widehat{z}_6 & \widehat{z}_3
\end{pmatrix}. \tag{A28}
$$

上下三角共享同一随机变量, 因而 $\boldsymbol{z}=\boldsymbol{z}^{\mathsf{T}}$. 把这种噪声加到对称晶格后仍为对称矩阵. 需要注意, 对称不自动保证正定. 噪声晶格在中间时间可能不是有效的几何晶胞, 但先验均值和噪声尺度会被设计为减少严重退化情形.

## A29: 朴素晶格 VP 扩散的问题

$$
q(\boldsymbol{L}_t\mid\boldsymbol{L}_0)
=\mathcal{N}
\left(
\sqrt{\overline{\alpha}_t}\,\boldsymbol{L}_0,
(1-\overline{\alpha}_t)\boldsymbol{I}
\right). \tag{A29}
$$

若直接套用 A7, 当 $t$ 很大时均值趋近零矩阵, 终点接近以零为中心的高斯. 对晶格而言, 零附近意味着很短的晶格向量, 很小的体积和可能很尖的夹角. 在这种晶胞里, 原子异常密集, 固定截断半径的 GNN 会看到极不正常的邻居图.

因此, "数学上方便的标准高斯"不是"适合晶体生成的先验". A30 将终点移动到具有合理密度尺度的近立方晶格附近.

## A30: 定制晶格先验的均值与方差

$$
\begin{aligned}
q(\boldsymbol{L}_t\mid\boldsymbol{L}_0)
=\mathcal{N}\Big(
&\sqrt{\overline{\alpha}_t}\,\boldsymbol{L}_0
+(1-\sqrt{\overline{\alpha}_t})\mu(n)\boldsymbol{I},\\
&(1-\overline{\alpha}_t)\sigma_t^2(n)\boldsymbol{I}
\Big).
\end{aligned} \tag{A30}
$$

信号权重 $\sqrt{\overline{\alpha}_t}$ 从 1 降到 0. 与此同时, 先验均值权重 $1-\sqrt{\overline{\alpha}_t}$ 从 0 升到 1. 因此, 均值从真实晶格 $\boldsymbol{L}_0$ 平滑插值到 $\mu(n)\boldsymbol{I}$.

$\mu(n)\boldsymbol{I}$ 是边长为 $\mu(n)$ 的立方晶格. 取

$$
\mu(n)=\sqrt[3]{nc},
$$

其平均晶胞体积为 $nc$, 原子数密度为 $1/c$, 与 $n$ 无关. 常数 $c$ 可设为训练集平均密度的倒数.

作者也令极限标准差按 $\sigma(n)=\sqrt[3]{n\nu}$ 缩放. 于是大晶胞具有相应更大的长度噪声, 但均值与标准差之比

$$
\lim_{t\to\infty}
\dfrac{|\mu(n)|}{\sigma(n)}
=\left(\dfrac{c}{\nu}\right)^{1/3}
$$

不依赖原子数. 这让不同 $n$ 的晶格先验具有相近的信噪难度.

## A31: 晶格终点分布

$$
q(\boldsymbol{L}_T)
=\mathcal{N}
\left(
\mu(n)\boldsymbol{I},
\sigma_T^2(n)\boldsymbol{I}
\right). \tag{A31}
$$

当 $\overline{\alpha}_T$ 足够接近 0 时, A30 退化为 A31. 采样从近立方但带随机形变的晶格开始. 作者报告其晶格夹角主要落在 $60^\circ$ 到 $120^\circ$ 之间, 与 Niggli-reduced 晶胞和随机结构搜索常用初始范围相符.

"趋向立方"是一种先验偏置, 不表示生成结果必须是立方晶系. 反向 score 可以把先验变形成低对称晶格. 该偏置的作用是让初始几何处于 GNN 更容易处理的尺度区间.

## 本章结论

A19-A24 在环面上定义坐标噪声及其精确 score, A25-A26 解释选择分数坐标而非笛卡尔坐标的计算原因, A27-A31 则把晶格变成固定旋转的 6 维对称变量, 并为它设计密度归一化先验. 下一章将说明同一个等变 GNN 如何同时输出元素 logits, 坐标 score 与晶格 score.
