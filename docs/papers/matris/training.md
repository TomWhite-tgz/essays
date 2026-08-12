---
title: 训练策略与超参数
description: 负载均衡, graph-level loss, denoising 与各 checkpoint 的训练设置.
---

# 训练策略与超参数

## 结构尺寸负载均衡

原子体系大小差异会让 data-parallel GPUs 等待最大 batch. MatRIS 先 shuffle 数据, 分块后按结构尺寸降序排列, 再以 greedy 方式将样本分配给当前累计负载最小的 GPU. 这类似 scheduling 中的 longest-processing-time heuristic.

![结构尺寸分布与负载均衡](/images/matris/distribution.png)

只加入 load balancing 时, S, M, L 的吞吐分别提高 1.75, 1.72, 1.35 倍. 再扩大 batch 后, 相对基础设置的累计加速达到 2.05, 2.14, 2.63 倍. 这些数字证明训练 pipeline 能减少 padding 或等待, 但没有分离数据读取, graph construction 和模型 kernel 的各自贡献.

## Graph-level force loss

若直接对 batch 内全部原子平均, 大结构对 gradient 的权重更高. 原子级形式为

$$
\mathcal L_F^{\mathrm{atom}}=\dfrac{1}{3N_B}\sum_{b=1}^{B}\sum_{i=1}^{N_b}\left\|\widehat{\mathbf F}_{bi}-\mathbf F_{bi}\right\|_2^2,
$$

其中 $N_B=\displaystyle\sum_b N_b$. Graph-level 形式先在每个结构内部平均, 再对结构平均:

$$
\mathcal L_F^{\mathrm{graph}}=\dfrac{1}{B}\sum_{b=1}^{B}\dfrac{1}{N_b}\sum_{i=1}^{N_b}\left\|\widehat{\mathbf F}_{bi}-\mathbf F_{bi}\right\|_2^2.
$$

它改变的不只是 normalization, 还把每个 structure 的总权重变为相同. 原文两个式子还相差一个 factor $1/3$, 因而替换时若不重调 loss weight, gradient scale 也会变化.

## Denoising 辅助任务

训练随机扰动原子坐标, 采样 time step $t$ 与线性 noise schedule, 向结构加入 $\sigma_t\boldsymbol\epsilon$, 再预测 Gaussian noise. 作者先把 force 投影到 relative-position edges 上以获得 invariant scalar 条件.

![Denoising 训练流程](/images/matris/denoising.png)

附录没有充分说明 edge projection 的 normalization, 从多个边标量重建三维噪声的方式, 以及邻居方向不张成三维空间时的处理. 因而该策略可理解, 但尚不足以独立复现.

## 关键训练设置

MPTrj 模型使用 AdamW, cosine schedule, gradient clipping 0.5. S, M, L 分别训练 30, 40, 100 epochs, 最大 learning rate 为 $5\times10^{-4}$, $3\times10^{-4}$, $3\times10^{-4}$. Energy, force, stress 与 magnetic moment 的 loss weights 为 5, 5, 0.1, 0.1. M 和 L 另做 20 epochs denoising.

OAM 模型先在 OMat24 训练 4 epochs, 再在 sAlex 与 MPTrj 上 fine-tune 8 epochs. SPICE 模型训练 200 epochs. MatPES 物性模型只有 3 层和 1.4M 参数. 这些模型不共享同一训练域, 因而跨表格比较时必须同时标注 checkpoint.

