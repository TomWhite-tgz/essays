---
title: 局限与审读结论
description: MatRIS 的可信贡献, 尚未闭合的证据与复现清单.
---

# 局限与审读结论

## 最可信的贡献

MatRIS 最有说服力的部分不是一个单项 SOTA, 而是小到中等规模 invariant 模型在广泛任务上形成的 accuracy-cost compromise. MPTrj compliant Matbench, MatCalc, MDR 与 molecular tests 共同表明, 显式三体双图能够在 4.3M 到 10.4M 参数范围内保持较强表现. Graph-level weighting 和 size-aware load balancing 也直接针对真实大规模训练问题.

## 关键证据缺口

1. 复杂度口径. Attention 对已有 edges 线性, line graph construction 对局部配位数仍可能平方增长.
2. 效率口径. Inference benchmark 排除 graph construction, training GPU-days 又跨代码栈和估计来源.
3. 消融口径. 两组表都累积删除模块, 不能隔离单个设计的 causal effect.
4. 复现口径. Denoising projection, DFT functional correction 与若干 formula indices 不充分明确.
5. 泛化口径. 不同表使用 MPTrj, OAM, SPICE, MatPES 或单任务训练, 不是一个 checkpoint 的统一 zero-shot evidence.
6. 动力学口径. 只有 3 条 80 ps NVE trajectories, 没有 drift statistics 和 baseline.

## 还应补做什么

最有价值的 follow-up 是在同一 PyTorch stack 和相同 GPU 上比较 MatRIS, eSEN, MACE 与 EquiformerV2, 同时计入 neighbor list 和 line graph construction. 应报告不同 density, cutoff 与 coordination 下的 wall time, memory 和 angle-edge count.

消融应采用 factorial design, 至少独立开关 dimension-wise softmax, separable branch, learnable envelope, denoising, magnetic moment 与 graph-level loss, 并给出多个 seeds. 分子测试需要公开 functional alignment 的公式和 fitted references. NVE 测试则应报告 energy drift slope, temperature distribution, 多 initial conditions 与更长 trajectory.

## 总体判断

MatRIS 成功证明了一点: 强预训练 MLIP 不必只能依赖高阶 equivariant tensor products, 显式三体 invariant graph 也能达到很有竞争力的精度和训练成本. 但论文尚未严格证明端到端线性 scaling, 也没有证明其可靠性跨越全部材料, 分子和催化任务.

最准确的结论是, MatRIS 提供了一套工程上有吸引力的双图 MLIP 设计, 其主结果值得重视, 而复杂度, 复现细节和动力学证据仍需要代码与受控 benchmark 补齐.

