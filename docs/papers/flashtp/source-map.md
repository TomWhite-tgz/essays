---
title: FlashTP 原文定位索引
description: FlashTP 主文与附录的章节, 公式, 图表, 实验配置和精读页面映射.
---

# FlashTP 原文定位索引

本索引以 14 页 ICML 2025 PMLR 版本为准. PDF 页码与论文页脚页码一致, Appendix A 从第 12 页开始, Appendix B 位于第 14 页.

## 章节覆盖

| 原文章节 | 页码 | 内容 | 精读页面 |
| --- | ---: | --- | --- |
| Abstract, Section 1 | 1-2 | 问题, 贡献与 headline 结果 | [总览](/papers/flashtp/) |
| Section 2.1 | 2 | MLIP 与四阶段自动微分链 | [计算链](/papers/flashtp/pipeline) |
| Sections 2.2-2.3 | 2-4 | 等变架构, path 与单条 CGTP | [张量积数学](/papers/flashtp/tensor-product) |
| Sections 3.1-3.3 | 4-5 | 中间流量, 显存尖峰与稀疏性 | [性能瓶颈](/papers/flashtp/bottlenecks) |
| Sections 4.1-4.4 | 5-6 | Fusion, sparse execution 与 path aggregation | [核心优化](/papers/flashtp/optimizations) |
| Section 5 | 6-7 | API, 预处理与 GPU parallelization | [实现](/papers/flashtp/implementation) |
| Sections 6.1-6.2 | 7-9 | Kernel 与端到端实验 | [评价](/papers/flashtp/evaluation) |
| Sections 7-8 | 9 | 相关工作与结论 | [局限](/papers/flashtp/critique) |
| Appendix A | 12-14 | 环境, 配置, 扩展, 消融与 roofline | [评价](/papers/flashtp/evaluation) |
| Appendix B | 14 | 数值稳定性 | [评价](/papers/flashtp/evaluation) |

## 公式覆盖

| 公式 | 位置 | 含义 | 精读页面 |
| --- | --- | --- | --- |
| Equation 1 | Section 2.3, 第 4 页 | Angular-momentum triangle selection rule | [公式 1](/papers/flashtp/tensor-product) |

论文只有 1 个编号公式. 本站另外补出能量到力, 力损失的混合二阶导数, 单 path CG contraction, edge-to-node reduce 与 Amdahl 定律. 这些均是帮助理解的推导, 不冒充论文编号公式.

## 关键图

| 图 | 证据角色 | 精读页面 |
| --- | --- | --- |
| Figure 1 | 区分 forward, force backward, double-backward 和 energy backward | [计算链](/papers/flashtp/pipeline) |
| Figure 2 | 定位 Tensor-Product layer 在等变 interaction block 中的位置 | [张量积数学](/papers/flashtp/tensor-product) |
| Figure 3 | 给出 path 伪代码和单 path 的外积-CG-缩放流程 | [张量积数学](/papers/flashtp/tensor-product) |
| Figure 4 | TP 占 SevenNet-l3i5 推理与训练时间比例 | [性能瓶颈](/papers/flashtp/bottlenecks) |
| Figures 5-6 | 中间流量与 memory-bound profile | [性能瓶颈](/papers/flashtp/bottlenecks) |
| Figure 7 | 逐边输出与 atomic fused reduce 对比 | [核心优化](/papers/flashtp/optimizations) |
| Figure 8 | Sparse COO 与 unique CG value array | [核心优化](/papers/flashtp/optimizations) |
| Figure 9 | Path aggregation 的输入复用 | [核心优化](/papers/flashtp/optimizations) |
| Figure 10 | e3nn 与 FlashTP 调用接口 | [实现](/papers/flashtp/implementation) |
| Figure 11 | 3 项优化的消融 | [核心优化](/papers/flashtp/optimizations) |
| Figure 12 | 铜 MD 的时间与 OOM scaling | [评价](/papers/flashtp/evaluation) |

## 表格覆盖

| 表 | 内容 | 精读页面 |
| --- | --- | --- |
| Table 1 | $l_{\max}=1$ 到 5 的 CG sparsity | [性能瓶颈](/papers/flashtp/bottlenecks) |
| Table 2 | FP32 与 FP64 kernel latency | [评价](/papers/flashtp/evaluation) |
| Table 3 | 单 GPU 训练时间与 peak memory | [评价](/papers/flashtp/evaluation) |
| Table 4 | 8 到 64 GPU 训练 scaling | [评价](/papers/flashtp/evaluation) |
| Table 5 | Microbenchmark irreps 配置与输出扩张 | [实现](/papers/flashtp/implementation) |
| Table 6 | Channel scaling | [评价](/papers/flashtp/evaluation) |
| Table 7 | Fusion, sparsity 与 path 消融 | [核心优化](/papers/flashtp/optimizations) |
| Table 8 | SevenNet 训练配置 | [评价](/papers/flashtp/evaluation) |
| Tables 9-11 | l2i5, l3i5 和 l4i5 各层 irreps 与宽度差异 | [评价](/papers/flashtp/evaluation) |
| Table 12 | 对 FP64 reference 的数值 RMSE | [评价](/papers/flashtp/evaluation) |

## 数字口径速查

| 数字 | 准确口径 |
| --- | --- |
| $41.6\times$ | FP64, $l_{\max}=4$, double-backward kernel 对 e3nn |
| $60.8\times$ | FP32, $l_{\max}=4$, double-backward kernel 对 cuEq |
| $4.2\times$ | 4000 原子铜 MD step 对 e3nn |
| $3.5\times$ | SevenNet-l3i5 单 GPU 每 epoch 时间对 e3nn |
| $6.3\times$ | 4000 原子 MD peak memory 对 e3nn |
| $6.2\times$ | SevenNet-l3i5 训练 peak memory 对 e3nn |
