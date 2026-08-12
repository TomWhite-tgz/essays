---
title: 数据缺口与标签质量
description: Figure 2 的十类数据缺口, level-of-theory 误差和跨数据集融合风险.
---

# 数据缺口与标签质量

## Figure 2: 规模之外缺什么

![基础 MLIP 所需的数据缺口](/images/fm-atomistic/data-gaps.png)

Figure 2 提出 10 个优先补齐方向:

1. Beyond-organic elements.
2. Non-covalent interactions.
3. Variable charge, spin 与 excited states.
4. Complex reactivity.
5. Long-range interactions.
6. Solid-solid interfaces.
7. Surfaces under applied potential.
8. Defects.
9. Solid-liquid interfaces.
10. Rich quantum information.

源码 caption 用 a-j 标记这 10 项, 正文却在多处使用不同字母, 甚至写到 Figure 2k. 应以内容名称而不是正文子图字母定位.

## Molecular domain 的主要缺口

传统 molecular datasets 主要覆盖 H, C, N, O, 再加少量 S, F, Cl, Br. 这不足以支持 metal-organic complexes, complex electrolytes, metalloenzymes 和 disordered proteins. Charge 与 spin 也是独立输入变量: 相同 nuclei 和 geometry 在不同电子态下具有不同能量与力.

复杂反应尤其缺少 transition states 与 condensed-phase mechanisms. Table 1 中 Transition-1x 是唯一明确以 reaction paths 和 transition states 为核心的大型集合. 若训练数据只采 minima 与 normal modes, 模型不能仅靠规模推断所有键断裂路径.

## Materials domain 的主要缺口

作者强调 solid-solid interfaces, solid-liquid interfaces, defects 和 applied-potential surfaces. 这些体系往往同时要求:

- 更大 supercells 与更长 length scale.
- Charge transfer 与 long-range electrostatics.
- 非平衡局域环境.
- 超越普通 PBE/RPBE 的 density functional.

因此它们既是 data gap, 也是 architecture gap 和 label-quality gap.

## Rich quantum information 为什么重要

Electron densities, orbitals, QTAIM descriptors 和 NBO interactions 提供比总能量与原子力更细的监督. 预训练模型可先学习 atom-level 与 bond-level quantum representations, 再适配 energy, forces 或 response properties.

这可能让 "foundation" 不再等同于一个巨大 MLIP, 而是一个可被重构为 MLIP 的化学表示模型. 但不同量子描述符带有 method dependence, basis dependence 与 gauge choices, 数据标准化比普通标量标签更困难.

## 三类 reference error

### Electronic-structure method

作者指出 standard GGA 的 RMS error 通常是领先 hybrid functionals 的 2-4 倍, 后者又至少比 gold-standard CCSD(T) 大约 10 倍. 这些是综述性数量级, 依 benchmark 和性质变化, 不应当作所有体系的固定换算.

### Basis set 或 plane-wave settings

分子 hybrid DFT relative energies 往往至少需 triple-zeta, 最好 quadruple-zeta 才接近 complete-basis-set limit. Table 1 中仍有大数据集使用 def2-SVP 或 6-31G*. 材料侧对应 plane-wave cutoff, k-point sampling, pseudopotential 和 quadrature quality.

### Numerical protocol 与数据维护

SCF convergence, orbital instability, spin symmetry breaking, thermodynamic limit 和 local-correlation domain approximation 都会制造系统误差. tmQM 缺失氢原子的案例说明, 结构级错误也可能在发布后才暴露, 需要持续版本维护而非一次性上传.

## 为什么 dataset fusion 困难

若两个数据源对同一构型使用不同理论设置, 标签满足

$$
E^{(a)}(\bm r)\neq E^{(b)}(\bm r).
$$

直接合并并训练单一未条件化 head, 会把协议差异当作噪声. 可选策略包括 task-specific heads, level-of-theory conditioning, delta learning, hierarchical fidelity objectives 或显式 calibration. 这一问题与 DPA-2 精读中的多任务标签协议完全相连.

## Fine-tuning 数据的角色

预训练阶段可容忍更广但质量不均的数据, fine-tuning 则负责:

- 迁移至 hybrid DFT, meta-GGA 或 coupled cluster.
- 修正 specific domain 的 charge, spin 和 reaction chemistry.
- 预测 spectra 与 response properties.
- 用 RDF, solvation free energy, density 和 viscosity 等实验量对齐 bulk behavior.

但 fine-tuning 不能凭空补全 pre-training representation 从未编码的变量. 如果模型输入没有总电荷, 自旋或外场, 同一几何的多值标签在函数意义上不可辨识.

