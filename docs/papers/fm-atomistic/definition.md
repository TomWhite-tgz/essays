---
title: Foundation model 的资格判据
description: 区分 foundation model, universal potential, transferable MLIP 与 large atomic model.
---

# Foundation model 的资格判据

## 从 LLM 类比开始, 但不能停在类比

语言与视觉 FM 的典型特征是大规模预训练, 参数和数据 scaling, 可被少量数据适配到多个下游任务. 原子模拟也希望获得类似能力: 用一个预训练模型覆盖分子与周期体系, 再以少量 system-specific 数据得到准确 PES 或新性质.

但 token prediction 与原子模拟之间有一个根本差异. 原子模型的输出必须参与数值积分, 自由能计算和高阶响应. 小的局部误差会沿轨迹传播, 物理对称性和守恒律也具有明确含义. 因而 "像 LLM 一样大" 不是资格判据.

## 四个常被混用的术语

| 术语 | 最低含义 | 不自动意味着什么 |
| --- | --- | --- |
| Transferable MLIP | 能迁移到训练分布之外的相关体系 | 跨任务预训练, scaling law |
| Universal potential | 在一个宽化学域与固定标签协议上直接使用 | 多 level of theory, emergent capability |
| Large atomic model | 大数据与共享表示, 可做多任务或迁移 | 一定满足 FM 的严格判据 |
| Foundation model | 可扩展预训练加广泛迁移加新能力 | 不能只由参数量或数据量命名 |

作者以 MACE-MP-0 为反例. 它在 Materials Project 的 PBE(+U) 数据上训练, 能跨许多晶体体系稳定运行并支持自由能, 光谱和相图应用. 但训练任务仍是固定化学域和固定 level of theory 的 energy/force prediction, 且输入没有区分同一几何下不同总电荷与自旋. 作者因此称其为优秀的 universal PBE potential, 而不是完整 FM.

## 判据 1: 广泛迁移必须胜过 from scratch

预训练模型在下游任务上表现好还不够. 真正需要比较的是

$$
\mathcal{E}_{\mathrm{FT}}(n)<\mathcal{E}_{\mathrm{scratch}}(n),
$$

其中两者使用相同数量 $n$ 的下游标签, 前者从预训练 checkpoint 微调, 后者随机初始化. 更强的证据还应比较达到同一误差所需的标签数:

$$
n_{\mathrm{FT}}(\varepsilon)<n_{\mathrm{scratch}}(\varepsilon).
$$

论文原文没有给出这两个公式, 这里把它们写出只是为了明确 "superior" 应怎样被检验. 一个 zero-shot 模型若使用了与测试域重叠的海量数据, 也不能替代受控的样本效率比较.

下游范围至少应跨越:

- 不同体系, 如分子, 晶体, 界面, 缺陷和反应.
- 不同标签协议, 如 GGA, hybrid DFT 和 coupled cluster.
- 静态与动态量, 如能量, 力, 声子, 输运和谱学.
- 能量与力之外的响应, 如场依赖性质或电子结构描述符.

## 判据 2: Scaling laws 必须分解三个轴

作者要求模型展示参数 $N$, 数据量 $D$ 和算力 $C$ 增加时误差持续降低. 常见经验形式可写作

$$
L(N,D,C)\approx L_\infty+aN^{-\alpha}+bD^{-\beta}+cC^{-\gamma}.
$$

这不是论文编号公式, 而是将其 heuristic scaling 叙述显式化. 可靠实验需要在多个尺度点上改变单一轴, 报告训练预算, 数据组成和误差置信区间. 如果数据质量随 $D$ 一起改变, 或大模型采用不同优化配方, 曲线就不能纯粹归因于尺度.

## 判据 3: Emergent capability

作者举的例子包括由 Cartesian geometry 加 DFT energy 预训练, 最终预测高质量 CCSD(T) 数据或 magnetic-field-dependent properties. 这要求输出能力明显不同于原训练标签.

但 emergent 不能只意味着 "误差跨过人为阈值". 若连续损失平滑改善, 离散成功率可能突然跳升. 因而应同时报告连续指标, 尺度曲线与任务机制, 不只宣布某个模型第一次答对.

## 一个层级式资格测试

本文的定义可整理为四层:

1. Coverage: 训练数据跨多个化学与材料域.
2. Scaling: 扩大参数, 数据和算力有可预测收益.
3. Adaptation: 多个下游任务上优于同预算 from scratch.
4. Emergence: 出现预训练标签没有直接教授的新能力.

现有 universal MLIP 往往达到第一层的一部分和第三层的若干案例. Perspective 的核心主张是, 不应因此跳过第二层和第四层就直接使用 FM 名称.

