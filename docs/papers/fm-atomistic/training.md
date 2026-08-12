---
title: Pre-training, distillation 与实验对齐
description: 自监督, 多 fidelity, soft constraints, teacher-student 与 differentiable simulation.
---

# Pre-training, distillation 与实验对齐

## 为什么 MLIP 的 pre-training 不像语言模型

原子构型通常已经配有 energy 或 force labels, 因而 supervised learning 仍是主流. 自监督路线则使用大量无量子标签的 3D geometries, 通过 denoising, masked atoms, atom replacement 或 twin objectives 学习化学表示.

Geometric denoising 可写成从扰动构型 $\widetilde{\bm r}=\bm r+\bm\epsilon$ 恢复原结构或噪声. 它迫使网络学习局部几何分布, 但预训练收益依赖构型分布. 在 equilibrium conformers 上学到的 denoising score 不自动覆盖 transition states 或 high-energy contacts.

作者还讨论用已有 MLIP 生成 synthetic energy/force labels. 这能廉价扩大数据, 前提是 teacher 在目标区域可靠. 否则 synthetic pre-training 会规模化复制 teacher bias.

## Multi-fidelity pre-training

低成本 semi-empirical 或 GGA 数据提供覆盖, 少量 hybrid 或 coupled-cluster 数据提供精度. 目标不是把全部标签视为同一真值, 而是让模型知道标签来自哪个 fidelity.

可行结构包括 shared representation 加 method-conditioned heads. 训练时低 fidelity 学习广泛几何, 高 fidelity 校正能量差. 若没有 method identity, 多 fidelity 会产生标签冲突.

## Soft physical constraints

Perspective 提议把物理放入 loss 而非 architecture. 例如 rotation augmentation, direct-force curl penalty 和 symmetry regularization. 优点是模型 kernel 保持通用, 更容易扩大参数和分布式训练.

但 soft constraint 只在采样点附近被惩罚. 部署前必须单独测量 constraint residual, 不能从训练 loss 很小推断全域严格守恒.

## Figure 3: Distillation 作为 post-training

![MLIP foundation model 的蒸馏流程](/images/fm-atomistic/distillation.png)

大 teacher 在广泛数据上学习 general-purpose representation, 多个小 students 再针对不同 domain 专门化. 作者引用的工作通过匹配 energy Hessians, 将 MACE-OFF, MACE-MP-0 与 JMP 等 teacher 蒸馏为小模型, inference 最多快 50 倍.

Hessian matching 的意义是让 student 不只复现能量点值, 还复现局部 PES curvature. 对 vibrational properties 与稳定 MD, 曲率信息比单纯 teacher energy labels 更关键.

## 直接力 teacher 到保守 student

这一路线把训练与部署需求分开:

- Teacher 使用 direct-force head, 避免 gradient-force 训练的额外成本.
- Student 预测标量能量并通过 $-\nabla E$ 给出力.
- Distillation 把 teacher 的表征或局部曲率转移给 student.

它可以恢复 student 的形式保守性, 但不能自动消除 teacher 的 accuracy bias. 若 teacher 在 high-energy 或 long-range 区域错误, student 仍会模仿该错误. Distillation 解决的是容量, 速度与物理结构的折中, 不是 reference truth.

## 用实验量 post-train

RDF, phonon DOS, diffusivity, density 和 viscosity 是 trajectory 或 ensemble averages, 不是单构型标签. Fine-tuning 需要对完整模拟求梯度, 直接反向传播成本极高.

作者列出三类近似:

- Reweighting, 用旧分布估计新参数下期望.
- Implicit differentiation, 对平衡条件求导.
- Adjoint method, 反向传播连续或离散动力系统.

静态 equilibrium observables 已有进展, dynamical observables 仍是主要技术难点. 实验数据还混合温度, 压强, 样品纯度与测量误差, 对齐时必须明确条件变量.

## 一个完整训练栈

Perspective 隐含的最佳流程不是单一 loss, 而是:

$$
\text{低成本广覆盖预训练}
\longrightarrow
\text{多 fidelity 监督}
\longrightarrow
\text{高质量下游微调}
\longrightarrow
\text{保守 student 蒸馏}
\longrightarrow
\text{实验可观测量对齐}.
$$

每一步修正不同误差源, 不能把最后一个 checkpoint 的表现全部归功于 architecture.

