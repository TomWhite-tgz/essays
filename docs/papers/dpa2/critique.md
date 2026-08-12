---
title: 局限与审读结论
description: 审查 DPA-2 的统一性, 数据覆盖, 评价公平性, 平滑性, 迁移和蒸馏边界.
---

# 10. 局限与审读结论

DPA-2 最值得肯定的是没有把 heterogeneous DFT labels 粗暴视为同一 target. Shared descriptor 与 task heads 给出一个合理的多任务分解, zero-shot 和 few-shot experiments 也比只报告 source accuracy 更接近 LAM 主张. 但 "large", "unified" 与 "generalizable" 都需要限定作用域.

## 统一 descriptor 不等于统一 PES

多任务模型有 18 个 fitting heads. 对一个新构型, 如果不指定 task head, 模型没有唯一 energy prediction. 不同 heads 可以代表不同 functionals, basis settings 或应用数据分布.

这不是缺陷, 而是避免 label conflict 的设计. 但它意味着 DPA-2 v2 更准确的称呼是 universal representation backbone, 不是直接覆盖所有 labels 的单一 universal potential.

## 73 种元素不等于构型空间完整

作者主动承认 pre-training data 缺少二维材料. 类似缺口还可能出现在 charged systems, excited states, strong correlation, extreme thermodynamic conditions, defects, interfaces 与 rare reactions.

Element coverage 只回答 token vocabulary, 不回答每种元素的 oxidation states, coordination, phase 与 temperature-pressure coverage. Zero-shot 可靠性仍取决于 local-environment overlap.

## 数据与权重高度不均衡

Drug 和 OC2M 占约 $84\%$ training frames, 但 task weights 各为 2.0, 小型 domain tasks 可通过较高相对 weight 被频繁抽样. 权重同时进入 WARMSE.

这种设计合理但主观. 论文没有系统展示 weight sensitivity, gradient conflict 或 task balancing alternatives. 一个任务改善可能来自其他数据的正迁移, 也可能因采样竞争发生负迁移.

## Multi-task source fitting 并非免费

Table S3 中 multi-task energy WARMSE 为 18.6, 高于 matched single-task 的 14.9; force 为 116.3 对 111.1. Multi-task 用部分 source accuracy 换 transfer.

这符合有限容量 shared representation 的预期. 更大的 descriptor, gradient surgery 或 adaptive task sampling 是否能改善 Pareto frontier, 论文没有探索.

## Zero-shot 门槛不能代表 MD readiness

RMSE 低于 label standard deviation 只说明优于 constant predictor. 一些被归为有 generalization 的 force errors 仍在数百 $\mathrm{meV/\text{\AA}}$.

真正部署前还需要 target-specific validation, uncertainty or extrapolation detection, stable trajectories, phase behavior 与 application observables. 论文自己的 pipeline 也通过 fine-tuning 和 distillation 承认 zero-shot 通常不够.

## Architecture baseline 不是完全最优比较

Table S2 统一 100 万 steps, batch size 1 和 32 GB GPU, 但其余 hyperparameters 沿用各代码默认值. 部分模型 OOM, 部分 unresolved, elementwise bias 还需要额外 preprocessing.

DPA-2 energy WARMSE 第一而 force 第二, 所以不能概括为全面优于所有 equivariant baselines. 更有说服力的是 MPtrj-controlled comparison: DPA-2 与 MACE 在相同大数据源下差距有限, 而 multi-task DPA-2 改善显著, 支持 data/training scheme 是 transfer 收益主因.

## Learning curve 仍受任务构造影响

Pre-training 与 downstream splits 常在同一材料族内设计, 例如单元/二元 cluster 到三元 cluster, pure metals 到 alloys, PBE 到 PBEsol. 这是有意义的 systematic transfer benchmark, 但比完全未知 chemistry 更接近 related-domain adaptation.

"节省两个数量级数据" 来自 H2O-PBE0TS-MD 等具体 accuracy target. 不同 task, metric 和 target error 会产生不同 reduction factor.

## Smooth softmax 的严格性依赖实现

Equation 35-36 用 $s=20$ 把 cutoff edge 的内部 softmax contribution 压到约 $\mathrm{e}^{-20}$. 若采用固定 padded slots, 整个表达式可随 switch 平滑变化. 若 neighbor index set 在 cutoff 硬切换, finite shift 只把 discontinuity 变得极小, 不会在实数数学中严格归零.

论文宣称二阶连续, 但没有在正文提供 implementation-level proof 或 finite-difference derivative test. Figure S3 是有用的数值结果, 仍不能单独证明所有构型上的严格 $C^2$.

## t-SNE 容易被过度解释

Periodic-table grouping 与 environment separation 是直观证据. 但 t-SNE 不保全 global geometry, 作者关于 outermost s electrons 的解释也不是由 embedding 独立识别出的机制.

更强的 representation audit 可以使用 linear probes, controlled environment interpolation, distance preservation 和跨 random seeds stability.

## Distillation 不能修正 teacher

Teacher-driven labels 大幅减少 DFT calls, 但 student 只能逼近 teacher. Teacher 与 student 共同偏离 DFT 的区域不会被 model deviation 发现. 三类 application tests 缓解了担忧, 仍只覆盖 water structure, one solid electrolyte 和 two ferroelectric compositions.

## 总体评价

DPA-2 的 strongest evidence chain 是:

1. Multi-head formulation 正确处理 heterogeneous PES labels.
2. 同 architecture 的 MT 与 ST comparison 显示 descriptor transfer 改善.
3. Fine-tuning learning curves 证明 low-data initialization benefit.
4. Distillation 把昂贵 teacher 转换为接近 full-data student accuracy 的 production potential.
5. RDF, diffusion 与 phase-transition tests 把评价推进到 trajectory observables.

最需要限制的结论是 "universal". 当前结果证明 18 个 source tasks 能共同训练更 transferable 的 descriptor, 并在 15 个相关 downstream datasets 上受益. 它没有证明任意 chemistry, DFT level 或 dynamical regime 都能 zero-shot 使用. 作为 LAM workflow prototype, 论文成立; 作为完成态 universal atomic model, 证据仍不足.
