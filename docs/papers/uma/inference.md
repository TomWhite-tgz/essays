---
title: 推理速度, 显存与 active parameters
description: MoLE pre-merge, H100 benchmark, graph generation 排除项与大体系折中.
---

# 推理速度, 显存与 active parameters

## Benchmark protocol

主文 Table 3 使用单张 NVIDIA H100 80GB, PyTorch 2.6.0, CUDA 12.4, Python 3.12 与 TF32-high precision. 测试体系为 periodic fcc carbon, lattice constant 3.8 Å, 每个 atom 在 6 Å 内约有 50 neighbors.

UMA 使用 `torch.compile`, CUDA graphs 与 pre-merged MoLE. Benchmark 不包含 graph generation. 作者称内部 CUDA graph builder 最多使 largest-system throughput 降约 10%.

## Steps per second

| Atoms | UMA-S | UMA-S-1.2 | UMA-M | eSEN-30M | Orb-v3 | MACE-MPA-0 | MACE-OFF23-L |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 44 | 53 | 21 | 8 | 77 | 38 | 89 |
| 1000 | 16 | 24 | 3 | 1.7 | 30 | 24 | 20 |
| 10000 | 1.6 | 1.3 | 0.2 | OOM | 3.7 | 2.9 | OOM |
| 50000 | 0.2 | 0.2 | OOM | OOM | OOM | OOM | OOM |
| 100000 | 0.1 | 0.1 | OOM | OOM | OOM | OOM | OOM |

UMA-S 对 1000 atoms 的 16 steps/s, 若 MD timestep 为 1 fs, 对应约 1.38 ns/day, 与正文 1.4 ns/day 一致. 时间尺度换算依赖 1 fs 这一未在表中明写的假设.

## UMA-S-1.2 的速度更新

1.2 使用 `fairchem>=2.16.0` 的 `umas_fast_gpu` backend, 100 和 1000 atoms 时明显加速. 但在 10000 atoms row 中 1.2 为 1.3 steps/s, 反而低于旧 S 的 1.6. 因而论文所说 significant inference optimizations 主要由小到中等体系数据支持, 不是表内每个 size 都更快.

旧 UMA-S/M/L 数字没有用新 backend 重测, 作者明确说为 record keeping 保留. 这使横向版本速度比较同时混合 checkpoint 和 software stack 差异.

## 为什么 1.4B total params 仍能运行

UMA-M 的 1.4B total params 在固定 global condition 下合并成约 50M active params. Sequential simulation 不逐 expert 执行, 所以速度更接近 50M dense model.

Pre-merge 不会让 total checkpoint 消失. Appendix 说不合并时 speed 相近, 但全部 expert parameters 占用更多 GPU memory. 合并后能否从设备卸载原始 experts, 取决于具体 runtime 与 workload, 论文未给 memory trace.

## 大体系显存策略

超过 1000 atoms 时, UMA 使用 edge-based activation checkpointing, 以额外计算换显存. 因而 10k-100k rows 的速度不仅是模型复杂度, 还包含重计算策略.

UMA-S 可容纳 100k+ atoms 是突出优势, 但测试只有 uniform fcc carbon 与约 50 neighbors. 对更高密度, 多组分, 长 cutoff 或不均匀 graph, 最大 atoms 会变化.

## Baseline 公平性

论文尽量统一 precision, GPU 与 neighbor count, 但仍有差异:

- MACE-MPA-0 无法 `torch.compile`.
- 各模型原始 cutoff 与 max-neighbor settings 不同.
- UMA graph generation 被排除.
- 不同 models 的 kernel maturity 不同.
- Orb-v3 在 100-10000 atoms 都比 UMA-S 更快, 所以 UMA 不是绝对速度第一.

最稳妥的结论是 UMA-S 兼具 strong accuracy, conservative force 与 unusually large system capacity. 不能把 total parameter count 与 inference cost 直接比较, 也不能把 synthetic throughput 当作完整 MD wall time.
