---
title: 代码复现审计
description: 将 EquiformerV3 v1 论文公式映射到公开仓库并记录复现边界.
---

# 代码复现审计

## 审计对象

本站以 v1 提交前最后一个公开 commit [`124cc76bcd371e87f6839cb6d7fe40fefc6d3f2b`](https://github.com/atomicarchitects/equiformer_v3/commit/124cc76bcd371e87f6839cb6d7fe40fefc6d3f2b) 为主审计对象. 它提交于 2026-04-09. 同时检查到 2026-04-17 的 [`a7300c58df683dc99cb48027d5bfd4c887486c48`](https://github.com/atomicarchitects/equiformer_v3/commit/a7300c58df683dc99cb48027d5bfd4c887486c48); 两者之间的 repository diff 只涉及 README 和删除仓库内临时 PDF, 没有 model source 变化. 后续两项脚本修复也写在 README 所引用的命令与路径中.

## 论文到代码

| 论文组件 | 代码位置 |
| --- | --- |
| SwiGLU-$S^2$ variants | `experimental/models/equiformer_v3/activation.py` |
| Merged LN | `layer_norm.py`, `EquivariantMergeLayerNorm` |
| Smooth softmax | `softmax.py`, `GraphSoftmax.forward` 的 `exp_rescale` argument |
| SO(2) fusion | `so2_ops.py`, `SO2Linear` |
| Attention 与 FFN | `transformer_block.py` |
| Main model 与 heads | `equiformer_v3.py`, `output_block.py` |
| Equivariance tests | `experimental/tasks/test_equivariance/` |
| Body-order tests | `experimental/tasks/test_fashp_many_body/` |
| Matbench pipeline | `experimental/tasks/matbench_discovery/` |

## 核心一致性

- `EquivariantMergeLayerNorm` 只中心化 degree 0, 再跨所有 degrees 计算 shared RMS, affine bias 也只加到 degree 0.
- `GraphSoftmax` 在 exp 后, denominator aggregation 前应用 `exp_rescale`, 对应 envelope 进入 softmax numerator 与 denominator.
- 正式 config 的 `sep-merge_gates2_swiglu` 将 grid channels 分成两半逐点相乘, 投回 irreps 后乘 scalar sigmoid gate. Gate 与 linear `FromSphere` 可交换, 与论文公式一致.
- OMat24 configs 确实使用 `norm_type: merge_layer_norm`, `use_envelope: true`, attention grid $(14,8)$ 与 FFN grid $(14,14)$ for $L_{\max}=4$.

## 发现的实现风险

`S2Activation_SwiGLU_MemoryEfficient.forward` 的公开代码先计算 `x_grid`, 却调用 `from_grid(inputs)` 而非 `from_grid(x_grid)`. 这与相邻普通版本及其他 memory-efficient variants 不一致, 看起来是潜在 dead-path bug. 主论文 configs 使用 `sep-merge_gates2_swiglu`, 没有使用这个 class, 因而不能据此否定报告结果, 但使用者不应盲目切换到所有名字含 `_mem` 的 variants.

代码还允许 `grid_drop`; 注释明确说 dropout 会产生 non-equivariant training. 这不与 deterministic inference equivariance 冲突, 但说明 `strict equivariance` 需附带 evaluation mode 与 disabled stochastic operations 的条件.

## 复现成熟度

| 项目 | 状态 |
| --- | --- |
| Model implementation | 完整公开 |
| Main YAML configs | 已公开 |
| Training launch scripts | 已公开, 含 cluster-specific assumptions |
| Checkpoints | Hugging Face 提供 |
| Dataset preprocessing | 提供脚本, 需下载大型外部数据 |
| Exact environment | 提供 conda requirements, 版本栈较重 |
| Cheap smoke reproduction | 未提供 |
| Reported full-cost reproduction | 需要多节点 H100, 本站未重跑 |

本站完成的是 static source audit, PDF/source consistency check 与站点构建验证, 不把未执行的大规模训练表述为 independently reproduced.
