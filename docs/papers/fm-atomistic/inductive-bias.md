---
title: 物理归纳偏置与 bitter lesson
description: 原子模型应硬编码多少物理, 以及规模化学习能否替代结构约束.
---

# 物理归纳偏置与 bitter lesson

## 两种路线

Perspective 把未来路线放在一条张力轴上:

| 路线 | 优点 | 代价与风险 |
| --- | --- | --- |
| 硬编码物理约束 | 少数据, 保证对称性或守恒结构 | 操作昂贵, loss landscape 复杂, GPU scaling 困难 |
| 扩大通用架构, 数据与算力 | 表达力强, kernel 更规整, 易分布式训练 | 约束只被近似学习, OOD 时可能失效 |

作者借用 Sutton 的 bitter lesson, 主张应认真探索减少 architecture-specific constraints 的路线. 其论点不是所有物理都应删除, 而是约束是否必须嵌入模型, 应由规模化证据而非传统直觉决定.

## 旋转等变是最容易的案例吗

作者认为 rotational equivariance 很容易满足, rotation augmentation 在几乎所有案例中都足够且便宜. 这是一项较强判断, 需要拆开看.

数据增强可让经验风险近似满足旋转对称:

$$
\mathcal{L}_{\mathrm{aug}}
=\mathbb{E}_{R\sim\mathrm{SO}(3)}
\left[\ell\left(f(R\bm r),R\bm y\right)\right].
$$

但有限旋转采样不提供对全部 $R$ 的严格保证. 对标量能量问题, 增强可能足够实用; 对高阶张量输出, 长轨迹累积或极端 OOD, exact equivariance 仍可能显著提高样本效率和可靠性.

因此原文支持 "augmentation 是可扩展替代方案", 不等于已经证明 "严格等变没有价值".

## 能量守恒不能与旋转增强简单类比

若模型直接预测力 $\widehat{\bm F}(\bm r)$, 保守性要求构型空间中满足可积性. 局部形式是 Jacobian 对称, 或 curl 为 0:

$$
\dfrac{\partial \widehat F_i}{\partial r_j}
=\dfrac{\partial \widehat F_j}{\partial r_i}.
$$

训练时惩罚 curl 可以鼓励这一性质, 但有限样本上的小 penalty 不能保证所有构型都存在全局标量势能. 相比之下, 定义 $\widehat{\bm F}=-\nabla_{\bm r}\widehat E$ 在数值精度内提供结构保证, 代价是训练与推理中的自动微分.

Perspective 提出的折中是:

1. 大 teacher 用 direct forces 高效预训练.
2. Post-training 时把知识蒸馏给 gradient-force student.
3. 部署时由 student 提供能量守恒与更快推理.

## MD stability 其实有两种失败

作者明确区分:

- Pathological instability: 数据不足或数值问题导致体系爆炸, 即使时间步很小也可能发生.
- Non-conservative drift: 直接力沿闭合路径做非零功, NVE 人工升温, NVT 动力学被 thermostat 掩盖或扭曲.

一个模型可以保守但在未覆盖的短距离区产生巨大错误力, 因而爆炸. 也可以静态力误差小却非保守, 因而长时漂移. 物理可靠性不能压缩成单一 "stable" 标签.

## Bitter lesson 尚未在 MLIP 中定论

论文列举 scalable attention, robotics, weather 和 AlphaFold 等领域作为减少归纳偏置的启发. 但它没有提供一组 MLIP 控制实验, 在同样数据, 参数和算力下证明 unconstrained architecture 随规模最终全面超过 constrained architecture.

更稳妥的结论是: MLIP 社区应同时测量 accuracy scaling 与 constraint violation scaling. 如果误差随尺度下降而 curl, energy drift 或 asymptotic error 不下降, 数据规模并没有自动学会物理. 如果二者都系统改善, 才能说明 soft constraints 路线在该域成立.

