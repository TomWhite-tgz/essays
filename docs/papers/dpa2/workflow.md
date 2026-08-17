---
title: LAM 工作流与问题定义
description: 解释 DPA-2 为什么采用 shared descriptor, task-specific heads, fine-tuning 与 distillation.
---

# 1. LAM 工作流与问题定义

## 传统模型生成为什么成为瓶颈

MLIP 把量子计算标注的能量与力拟合成可用于长时间, 大体系模拟的势能面. 但传统流程通常为每个应用重新运行 AIMD 或 active learning, 再从头训练模型. 论文举例指出, 一个 Al-Mg-Cu 通用势的 14.1 万个训练构型消耗超过 1000 万 CPU hours 做标注.

更根本的问题是 out-of-domain generalization. 一个势在训练分布内精确, 不意味着加入新元素, 改变相态或扩展温压后仍可靠. DPA-2 将模型生成问题改写为表示复用问题: 能否先用多个领域学到通用原子环境 descriptor, 再用较少下游标签完成适配.

## 为什么不能简单合并全部 DFT 标签

两个数据集即使包含相同构型, 只要使用不同 exchange-correlation functional, basis, pseudopotential, cutoff 或 $k$-point sampling, 能量与力标签就可能系统性不同. 这意味着不存在一个函数必须同时精确等于所有标签.

把数据直接拼成 super-dataset 会要求同一个 head 拟合相互不一致的 PES. DPA-2 改为

$$
E_k(\mathcal{X})
=E^{\boldsymbol{\theta},\boldsymbol{\xi}_k}(\mathcal{X}),
$$

其中 $\boldsymbol{\theta}$ 是共享 descriptor 参数, $\boldsymbol{\xi}_k$ 是第 $k$ 个标签协议独有的 fitting head. 所有任务共同塑造 $\boldsymbol{\theta}$, 只有任务 $k$ 更新 $\boldsymbol{\xi}_k$.

因此, "统一" 发生在 representation 层. 模型并没有宣称不同 DFT 理论给出同一个能量标尺.

## Figure 1 的三阶段工作流

### 多任务预训练

每个 pre-training dataset 保留自己的 energy/force labels 与 fitting head. 一个训练 step 可以抽取多个任务, 各自计算损失, 对 shared descriptor 汇总梯度. 任务采样概率由人工设置的 weight 控制.

预训练的产物不是单个应用势, 而是 unified descriptor 与一组 source-task heads.

### 下游微调

下游模型以预训练 descriptor 初始化. Fitting head 可以选择最相似 source task 的 head, 也可以随机初始化. 下游 energy bias 必须根据下游标签重新拟合, 因为不同 DFT 设置的绝对能量基准不同.

论文的主要收益度量是 sample efficiency: 达到同一 test RMSE 时, 微调需要多少下游构型, 相比同架构随机初始化节省多少数据.

### 面向应用的蒸馏

完整 DPA-2 约 515 万参数且包含 attention, 不适合直接承担所有大规模 MD. 作者把 fine-tuned DPA-2 作为 teacher, 用更轻的无 attention DPA-1 作为 student:

1. Teacher 在目标应用条件下运行 MD 并生成标签.
2. 比较 teacher 与 student 对轨迹构型的预测差异.
3. 把差异超过阈值的构型加入 student 训练集.
4. 重复直到 student 达到精度要求或不再改善.

这是一种 teacher-driven concurrent learning. 它把昂贵模型的知识压缩到目标构型域, 不要求 student 复现 teacher 在所有预训练领域的能力.

## 作者对 LAM 的 4 项要求

论文列出 DPA-2 作为 PES 模型应满足:

1. Highly generalizable.
2. Extensive, 并尊重 translation, rotation 与同种原子 permutation symmetry.
3. Conservative, 即力和 virial 由总能量导数得到.
4. 对坐标至少具有连续二阶导数.

后 3 项主要是物理与数值约束. 第一项则必须通过跨数据集 zero-shot, fine-tuning learning curve 和 application validation 证明. 它不能只由模型结构推出.

## "Large" 在哪里

DPA-2 的 shared descriptor 约 500 万参数, 远小于语言模型语境中的大模型. 论文使用 large atomic model 更强调训练与使用范式:

- 跨学科数据预训练.
- 一个 backbone 服务多个任务.
- 下游少样本适配.
- 通过蒸馏部署.
- 数据, 评测和版本持续演化.

因此, LAM 是生态和迁移学习概念, 不是单纯按参数数量划定的类别.

## 本章结论

DPA-2 的中心命题不是 "一个势直接解决所有体系", 而是 "异构 PES 标签可以共同训练一个 transferable descriptor". Fine-tuning 负责把通用表示校准到目标标签协议, distillation 再把目标域能力压缩为生产模型. 后续所有实验都应分别检验这三个阶段, 不能只用 pre-training RMSE 代替完整工作流证据.
