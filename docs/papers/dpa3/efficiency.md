---
title: 推理效率与成本
description: 参数量, 系统大小, 高阶图与 CUDA 优化如何共同决定 DPA3 速度.
---

# 推理效率与成本

## 测试协议

Supplementary Figure S-2 使用等密度 water box, 从 48 atoms 扩至最多 12288 atoms. 所有模型通过 ASE calculator 在单张 80 GB NVIDIA A800 上端到端运行, 每个尺寸重复 100 次, 同时计算 energy, force 与 pressure tensor.

![DPA3 与 MACE 推理效率](/images/dpa3/fig-s2.png)

测试比较 DPA3-L3/L6/L12/L24, 标准 MACE(M/L), 以及使用 `cuda_mace` custom kernels 的 MACE(M/L)-OPT.

## 系统大小为何重要

小系统中, Python, graph construction 与 kernel launch overhead 占比高. 随原子数增长, per-atom time 才接近稳定 throughput. 原文观察 MACE 约在 400 atoms 后收敛, DPA3 约在 1000 atoms 后收敛.

因此用单个小分子测一次 wall time, 再声称某架构整体更快, 会混合固定 overhead 与渐近计算成本.

## 精度与速度对应关系

- DPA3-L3 是未优化比较中最快, 约比 MACE(M) 快 2 倍, SPICE energy LWAMAE 与 MACE(M) 相同.
- DPA3-L6 与 MACE(M) 速度接近, 但 energy LWAMAE 低于 MACE(L).
- DPA3-L12 快于标准 MACE(L).
- DPA3-L24 更准, 也明显更慢并更早受显存限制.

这些结果说明 DPA3 在 generic implementation 下有良好 accuracy-throughput tradeoff, 但不能把 architecture 与 kernel engineering 分离.

## Optimized MACE 改变排序

小系统上 custom kernels 未必有优势, 大系统上则明显超越 standard implementation. 渐近区间内, MACE(M)-OPT 的速度可匹配 DPA3-L3, MACE(L)-OPT 也超过标准 MACE 与 DPA3-L6.

公平结论不是 DPA3 永远比 MACE 快, 而是:

- 当前 DPA3 实现相对标准 MACE 有竞争力.
- MACE 的 specialized kernels 展示了实现优化可显著改变排名.
- DPA3 若获得同等级 kernel fusion 可能继续改善, 但论文没有实测这一反事实.

## 高阶图的隐藏成本

Supplementary Table S-10 显示, 在 $r_c^1=6$ Å 基础上加入 $G^{(2)}$ 与 4 Å cutoff, WBM energy MAE 从 39.5 降至 34.7 meV/atom, 但 time 从 0.4 增至 1.3 ms/atom. 将 angle cutoff 增至 4.5 Å 后 MAE 为 32.2, time 增至 1.8 ms/atom.

LiGS 的 expressive power 不是免费的. Edge 数近似随邻居组合增长, angle graph 的 cost 对密度和 cutoff 特别敏感. 水盒 benchmark 不能代表高配位金属, 多孔结构或高度非均匀体系的相同成本比例.

## 参数量不是 FLOPs

DPA3-L24 只有约 4.9M 参数, 但 graph edges, angle edges, 自动微分和 memory traffic 可能主导推理. 论文同时报告 parameter count 与 wall time 是优点. 部署时还应补充 peak memory, neighbor density, precision, compilation mode 与多 GPU scaling.
