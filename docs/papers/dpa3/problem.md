---
title: LAM 问题与设计目标
description: DPA3 如何把 scaling, 异构 DFT 与物理约束转化为架构要求.
---

# LAM 问题与设计目标

## 从 task-specific MLIP 到 LAM

在 Born-Oppenheimer 近似下, 原子体系的 ground-state PES 可写为核种类与核坐标的函数. DFT 是这个对象的实用近似, MLIP 则学习 DFT 映射. Task-specific MLIP 只需覆盖某个局部化学空间, LAM 的目标却是跨领域复用同一个模型.

作者把差距拆成 4 个问题:

1. Generalizability. 现有 LAM 的下游精度仍通常不及针对单一问题训练的 MLIP.
2. Scaling. 增加参数, 数据和算力是否会可预测地降低泛化误差.
3. Label incompatibility. 不同 XC functional, basis, pseudopotential 与软件实现定义的标签不能直接视为同一 PES.
4. Physical consistency. 力应来自能量梯度, 并满足平移, 旋转与同种原子置换对称性.

## 为什么不能简单合并全部 DFT 数据

同一构型在不同 DFT 协议下可能有不同能量, 力和 stress. 若直接把它们送入单输出网络, 模型面对的是一对多映射. DPA-2 的方案是 shared descriptor 加 per-dataset fitting head. 这保留了不同 PES, 但 head 参数随任务数增长.

DPA3 将数据集身份 $c(\mathcal D_m)$ 与环境 descriptor 一起送入统一 fitting network:

$$
E_i=\mathcal F\left(v_i^{(1,L)},c(\mathcal D_m)\right)+e_m(Z_i).
$$

这样不同标签协议仍可拥有不同输出, 但主要网络共享. 它是 conditional PES, 而不是把异构 DFT 强行平均成一个无条件 PES.

## Scaling 需要什么架构

仅增加 GNN 层数并不保证更好. 深层消息传递可能 oversmooth, normalization 可能压掉有用幅值, 无界 activation 还可能数值爆炸. DPA3 的对应设计是:

- 以 trainable step size 控制每层 residual update.
- 以 SiLUT 在大正值区域转入 tanh tail.
- 不使用 LayerNorm 或 BatchNorm.
- 最终只读取 $G^{(1)}$ 的原子 feature, 避免深层时跨阶 pooling 反而降精度.

## 论文的 LAM 资格主张

作者认为 DPA3 同时具备 scaling law, multi-task scalability, conservativeness 与 symmetry. 其中前两项是本文的新实验主张, 后两项主要来自模型构造. 需要区分:

- Energy-gradient force 能直接推出 conservative force.
- Invariant input 与 symmetric aggregation 能支持相应对称性.
- Scaling law 必须由有限实验区间外推, 不是架构定义自动保证.
- Universal PES 是远期目标, 31 个训练数据集仍只覆盖有限化学与构型空间.

## 与 DPA-2 的关系

DPA3 是 DPA 系列的新架构, 不是 DPA-2 的补充材料. 两者共享 DeePMD-kit 生态与多任务动机, 但 descriptor 不同:

| 维度 | DPA-2 | DPA3 |
| --- | --- | --- |
| 核心结构 | 原子图上的 attention descriptor | LiGS 上的 message passing |
| 异构标签 | Per-dataset fitting heads | Unified head 加 dataset encoding |
| 扩容方式 | 增宽与结构配置 | 主要增加 update layers |
| 默认高阶几何 | Edge attention 与 symmetrization | 显式 $G^{(2)}$ angle graph |
| 本文重点 | 多任务迁移与蒸馏 | 深度 scaling 与参数高效多任务 |
