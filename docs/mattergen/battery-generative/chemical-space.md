---
title: 化学空间与生成偏差
description: 元素分布, SOAP 描述符与 t-SNE 图的正确解读.
---

# 化学空间与生成偏差

## 元素频率已经显示分布偏移

![生成数据与训练数据的元素分布](/images/battery-generative/element-distribution.png)

<p class="figure-note">原论文图 5. 生成数据覆盖的元素范围比训练数据窄, 高频元素也不完全相同.</p>

MatterGen 学到的是训练分布与条件引导共同决定的生成分布, 不是对周期表的均匀搜索. 论文发现生成样本偏向训练数据的高密度区域, 最终稳定含 Li 集合又偏向金属合金. 后者可能同时来自训练集不平衡和金属相较低的预测形成能.

这解释了为什么仅使用凸包能条件并不能有效定向正极. 合金可能很稳定, 却未必有合适的高电压插层骨架. 更直接的策略可以加入化学体系, 密度, 氧化态, 电压代理或可脱锂约束, 但那将不再是本文刻意测试的单条件零样本设定.

补充材料 Figure S2 和 Figure S3 进一步比较了 MP, MatterGen 训练集与过滤后的生成集. 它们确认训练数据中 Li 频率最高, 生成数据的元素尾部更窄. 但每个 panel 都按本 panel 的最高频元素单独归一化, 不能把柱高直接解释为跨数据集的绝对比例. 完整图和代码口径见 [补充材料与公开数据审计](./supplementary).

## SOAP 在表示什么

对原子 $i$ 周围的邻域, SOAP 先把离散邻居平滑为元素分辨的原子密度. 用径向基和球谐函数展开后, 再形成对旋转不变的功率谱特征. 可以把结构级描述符概念性写成

$$
\mathbf{s}(M)=\operatorname{Average}_{i\in M}\left[\operatorname{SOAP}(\mathcal{N}_i)\right].
$$

公开 notebook 给出的实际参数是:

- 截断半径 $r_{\mathrm{cut}}=4.5\,\text{Å}$.
- 径向基数 $n_{\max}=8$.
- 最大球谐阶数 $l_{\max}=6$.
- 高斯宽度 $\sigma=0.2$.
- `average="outer"`, `periodic=True`.
- 幂函数径向权重和 `mu1nu1` 压缩.

因此这个表示重点刻画约 $4.5\,\text{Å}$ 内的局部化学环境. 它可以区分氧化物, 氟化物, 磷酸盐等局部配位类别, 但不能完整表达长程 Li 扩散通道, 大尺度层状堆垛或电化学反应路径.

## t-SNE 在做什么

t-SNE 把高维 SOAP 点映射到二维. 它用高维相似度 $p_{ij}$ 与二维相似度 $q_{ij}$ 构造目标

$$
\mathcal{L}_{\mathrm{tSNE}}=
\displaystyle\sum_{i\neq j}p_{ij}\log\left(\dfrac{p_{ij}}{q_{ij}}\right).
$$

最小化这个 KL 散度主要保留局部邻居关系. 公开代码使用 `perplexity=min(50, N-1)`, 但没有固定 `random_state`. 因而不同运行可能得到旋转, 翻转甚至局部布局不同的二维图.

![Li 生成结构与 MP 数据的 SOAP t-SNE 图](/images/battery-generative/chemical-space-mp.png)

<p class="figure-note">原论文图 6. 红点落入多个蓝色簇, 说明生成结构具有多类局部环境, 也大体跟随 MP 数据分布.</p>

## 图 6 和图 7 能证明什么

![生成结构与完整训练数据的 SOAP t-SNE 比较](/images/battery-generative/chemical-space-training.png)

<p class="figure-note">原论文图 7. 图 a 比较 Li 生成结构与 MP 加 Alexandria 训练数据. 图 b 比较最终 DFT 集合与 Li-MP 数据.</p>

这些图支持三个有限结论:

1. 生成样本不是集中在单一局部配位类别.
2. 许多生成局部环境与训练数据中的氧化物, 氟化物, 硫族化物等类别相近.
3. 最终 DFT 子集仍分布在多个可视化簇中, 但有明显类别不平衡.

这些图不能单独证明:

- 生成模型均匀覆盖了完整化学空间.
- 两个二维点云的全局距离具有定量意义.
- 红点位于蓝点之间就代表结构新颖.
- 局部 SOAP 相似意味着电压, 容量或循环性能相似.
- 可视化覆盖等同于高 recall. 公开指标的 recall 约为 2.67%, 恰好提醒读者覆盖图与覆盖率不是一回事.

论文把这一步称为 unsupervised clustering, 但公开代码的核心是 SOAP 后接 t-SNE, 并未显示一个独立聚类算法为每个点学习类别. 图上的功能团标签更接近对可视化区域的人工解释. 因而更准确的称呼是无监督表征与降维可视化.
