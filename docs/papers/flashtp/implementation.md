---
title: 实现与 GPU 映射
description: 解释 FlashTP 的 e3nn 接口, 初始化预处理, warp 并行和 constant-memory 策略.
---

# 5. 实现与 GPU 映射

算法层面的非零收缩只有真正映射到 GPU memory hierarchy 才能兑现速度. 论文 Section 5 说明了接口兼容, 初始化预处理, 并行维度和元数据缓存策略.

## 与 e3nn 的接口关系

Figure 10 对比两种调用方式. e3nn 典型流程是先按 `edge_src` 展开 node input, 调用 `TensorProduct`, 再按 `edge_dst` reduce. FlashTP 接口同时接收 node input, edge feature, radial weight, `edge_src` 和 `edge_dst`, 使 scatter, CGTP 和 reduce 能在内部统一调度.

作者强调 FlashTP 保留 e3nn 的矩阵存储顺序与模型结构, 因而现有模型只需少量代码改动. 这项兼容性指论文所支持的 TensorProduct 形式, 不应自动解释为 e3nn 全部 operation 和任意 instruction pattern 都已经覆盖.

## 初始化时做什么

FlashTP 在模型初始化阶段完成两类预处理:

1. 根据模型配置识别可以聚合的 path.
2. 构建 CG coefficient matrix 的稀疏表示与 unique value metadata.

这些信息只由 irreps 和 tensor-product instruction 决定, 不随每批原子结构变化. 把它们移出热路径可避免在每个 MD step 重复分析稀疏模式.

## 3 个并行维度

FlashTP 沿以下维度并行:

- Edge index.
- Aggregated path group.
- 每条 path 的 hidden channel.

同一个 warp 被分配到相同 path, 但处理不同 channel 和 edge index 的 tensor product. 这样 warp 内线程同时访问相同 CG metadata, 有利于广播和 cache reuse.

## Table 5 的 irreps 配置怎样读

e3nn 用 `32x2e` 表示 32 个 degree-2, even-parity channel, 用 `32x1o` 表示 32 个 degree-1, odd-parity channel. $l_{\max}=3$ 的 microbenchmark hidden input 同时包含 degree 0 到 3 的 even 与 odd block, edge angular feature 为 `1x0e+1x1o+1x2e+1x3o`.

Equation 1 只写出 degree 的 triangle rule. 实际 irreps instruction 还要满足 inversion parity compatibility. Table 5 的 output multiplicity 随有效 path 数增长, 例如 $l_{\max}=1$ 的 degree-1 output multiplicity 为 96, $l_{\max}=3$ 时 degree-1 和 degree-2 output multiplicity 分别增至 288 和 352. 这使 $d_i'$ 明显大于 input dimension, 正是 fused reduce 需要避免物化的扩张维度.

## 为什么关注 constant memory

CG sparse metadata 体积小且对同一路径的所有 edge 与 channel 相同, 很适合放入 GPU constant memory. 当一个 compute unit 同时执行多个使用不同 CG matrix 的 path 时, metadata 可能互相驱逐并造成 cache miss stall.

FlashTP 为避免这种冲突, 让一个 thread block 专注于单一 path, 并尽量增大 block size. 实现还在 shared-memory 使用允许的条件下自动选择 block size, 在输入复用和 occupancy 之间取平衡.

## 自动微分支持不是免费获得的

论文分别测量 forward, backward 和 double-backward, 表明 FlashTP 不只是提供 forward CUDA kernel 后依赖通用算子拼回梯度. 针对融合执行计划实现高阶梯度是其训练加速的关键.

这里也存在工程约束. 融合越深, kernel 的寄存器, shared memory 和代码路径压力越大. $l_{\max}$, channel 和 path 配置变化会改变最佳 tile 与 block size, 因此论文的自动选择策略是性能可移植性的一部分, 但实验只覆盖 A100.

## 复现实验的软件与硬件

Appendix A 报告环境:

| 组件 | 版本或配置 |
| --- | --- |
| PyTorch | 2.5.1 + CUDA 12.4 |
| e3nn | 0.5.4 |
| cuEquivariance | 0.2.0 |
| ASE | 3.24.0 |
| 单 GPU | NVIDIA A100 80 GB |
| 多 GPU node | 每 node 8 张 A100 80 GB, NVLink 与 NVSwitch |
| 跨 node 网络 | $100\,\mathrm{GB/s}$ |

版本很重要. GPU kernel library 的性能会随编译器, CUDA, PyTorch 和对照库版本变化. 论文数字是该环境下的可复现实验记录, 不是库名称之间永恒固定的排序.

## 本章结论

FlashTP 的性能来自数学稀疏性与 GPU 映射共同作用. 预处理把静态结构移出热路径, warp 安排让 CG metadata 复用, fused API 让 scatter 与 reduce 不再成为强制 materialization boundary. 这些都是算法描述之外, 但决定端到端收益能否出现的实现条件.
