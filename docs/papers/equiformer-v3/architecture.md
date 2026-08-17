---
title: 完整架构与数据流
description: 拆解 EquiformerV3 的 embedding, attention, FFN 与 output heads.
---

# 完整架构与数据流

## 总图

![完整架构](/images/equiformer-v3/equiformer-v3.png)

输入 graph 由 cutoff neighborhood 构造. Atom embedding 只写入 node feature 的 $L=0$ 部分. Edge-degree embedding 则从 spherical harmonics 与 radial information 建立 directional components, 对邻边求和后加入 node state.

## 一个 Transformer block

每个 block 是 pre-norm residual structure:

1. Equivariant merged layer normalization.
2. Equivariant graph attention.
3. Residual connection.
4. 第二个 merged normalization.
5. Node-wise equivariant FFN.
6. Residual connection.

### Attention path

对 edge $(i,j)$, source 与 target features concatenate 后旋到 edge-aligned frame. 第一层 SO(2) linear 同时产生 scalar branch 与 irreps branch. Scalar branch 经 normalization, leaky ReLU 和 radial function 得到 attention logits $z_{ij}$. Irreps branch 经 SwiGLU-$S^2$ 与第二层 SO(2) linear 得到 value $\mathbf v_{ij}$.

平滑 softmax 给出 $a_{ij}$, 再将 message 旋回 global frame 并对 $j\in\mathcal N(i)$ 聚合.

### FFN path

FFN 是 node-wise operation. 两个 equivariant linear layers 之间放 SwiGLU-$S^2$. 论文把 hidden size 提高到原来的 $4\times$, 理由是 node-wise FFN 比 edge-wise tensor operation 便宜, 可用较少 runtime 增加参数容量.

## 输出 heads

- Energy head 读取 degree 0 scalars, 产生 per-atom energy 后按结构求和.
- Direct force head 读取 degree 1 features, 映射到 3D vector.
- Gradient force 由 scalar total energy 对 positions 求负梯度.
- Stress 在 gradient setting 中由 energy 对 strain 求导.

论文对 direct pre-training 再 gradient fine-tuning 的使用尤其重要. 这不是单一 head 同时给出所有表格结果, 而是两阶段切换 prediction parameterization.

## 局域性与复杂度

Attention 只在 cutoff graph 上执行, 不是全局 $O(N^2)$ self-attention. 若每个 atom 最多保留 $K$ 个 neighbors, edge operations 近似按 $O(NK)$ scaling. 但常数依赖 $(L_{\max}+1)^2C$, SO(2) order truncation $M_{\max}$, grid resolution 与 edge count, 因而不同体系密度下的实际吞吐不能只用 atom count 推断.
