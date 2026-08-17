---
title: 问题定义与两类任务
description: Crystalite 如何把 crystal generation 拆成 DNG 与 composition-conditioned CSP.
---

# 问题定义与两类任务

## 核心问题

Crystal generative models 常用 equivariant GNNs 显式处理几何与 symmetry. 代价是 architecture complex, sampling slow, 每个 diffusion step 都需执行 geometry-heavy message passing. Crystalite 追问一个更窄的问题: standard Transformer 若只注入少量 periodic geometry, 能否在保持吞吐的同时达到竞争性 crystal generation quality?

论文不是证明 equivariance 不重要. 它把 inductive bias 从 hidden tensor transformation 移到 input token, attention logits 与 sampling rule. 因而更准确的对照是 full equivariant denoiser 与 geometry-biased invariant Transformer 的工程取舍.

## DNG

De novo generation 学习

$$
p_\theta(\mathbf A,\mathbf F,\mathbf L).
$$

模型从 noise 联合产生 atom types, fractional coordinates 与 lattice. 但 unit-cell atom count 不由 denoiser 建模, 而是先采样 $N\sim p_{\mathrm{train}}(N)$. 所以完整生成过程实际上是

$$
p(N,\mathbf A,\mathbf F,\mathbf L)
=p_{\mathrm{train}}(N)p_\theta(\mathbf A,\mathbf F,\mathbf L\mid N).
$$

这种选择简化 variable-length generation, 同时把 atom-count distribution 固定为训练先验.

## CSP

Crystal structure prediction 已知 composition, 只学习

$$
p_\theta(\mathbf F,\mathbf L\mid\mathbf A).
$$

Atom-type features 在 training 与 sampling 中固定, type loss 设为零. Main result 使用 single sample per composition, 通过 `StructureMatcher` 判断 match, 再只对 matched pairs 计算 RMSD.

## 不能把两个任务当成同一 checkpoint

v2 明确修正了 v1 的统一配置说法. DNG model width 为 512, 使用 PCA-16 Subatomic Tokenization 与 150 sampling steps. CSP width 为 1024, 使用 95-dimensional atomic-number features 与 400 sampling steps. MP-20 CSP 同时使用 distance 与 edge bias, MPTS-52 CSP 只使用 edge bias.

因此论文证明的是同一 model family 能适配两项任务, 不是一个 67M checkpoint 同时完成 DNG 和 CSP.

## 主张层级

论文的 strongest evidence 是 3 个 CSP datasets 上的 match rate 和 RMSD, 以及 MP-20 DNG 的 SUN-speed trade-off. 更宽的 crystal discovery 主张仍依赖 MLIP relaxation 与 reference phase diagram, 没有对主表 10,000 samples 全部执行 DFT relaxation 或 synthesis validation.

