---
title: 微基准与端到端证据
description: 审计 FlashTP 的 kernel latency, 数值稳定性, MD 推理, 单卡训练和多卡训练实验.
---

# 6. 微基准与端到端证据

FlashTP 的实验分成 kernel microbenchmark 与 end-to-end 两层. 前者回答融合后的 CGTP 有多快, 后者回答把它装进 SevenNet 后真实训练与 MD 能加速多少. 两层数字的分母不同, 必须分别报告.

## Microbenchmark 设置

Appendix A.1 使用 NequIP 风格 Tensor-Product layer. 合成图有 512 个 node, 每个 node 随机连接到另外 511 个 node 中的 64 个不同 destination, 共 32768 条 edge. 3 个实现共享完全相同的拓扑和随机输入.

Hidden channel 固定为 32, $l_{\max}$ 从 1 扫到 5, 同时测试 FP32 和 FP64. 对照是 e3nn 0.5.4 与 NVIDIA cuEquivariance 0.2.0. 每个配置分别测 forward, backward 和 double-backward latency.

这个设置控制了图, irreps 和输入, 适合隔离 kernel 差异. 但固定 64 出边的均匀随机图不代表所有原子邻接图, 特别是 fused atomic reduce 的冲突程度可能不同.

## Table 2 的 headline speedup

以下选取 FP32 的代表结果, latency 单位为 ms:

| $l_{\max}$ | 阶段 | e3nn | cuEq | FlashTP | 对 e3nn 加速 |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | Forward | 2.05 | 0.61 | 0.22 | $9.4\times$ |
| 2 | Backward | 32.26 | 2.28 | 1.86 | $17.3\times$ |
| 3 | Double-backward | 254.13 | 204.07 | 8.73 | $29.1\times$ |
| 4 | Double-backward | 1196.89 | 1822.67 | 29.99 | $39.9\times$ |
| 5 | Double-backward | 3752.63 | 1835.29 | 93.11 | $40.3\times$ |

摘要中的最高 $41.6\times$ 对 e3nn 加速来自 FP64, $l_{\max}=4$ 的 double-backward. 最高 $60.8\times$ 对 cuEq 加速来自 FP32, $l_{\max}=4$ 的 double-backward:

$$
\dfrac{1822.67}{29.99}\approx60.8.
$$

这两个最高值不是同一个配置, 也不是完整模型速度. 它们是单个 Tensor-Product kernel phase 的峰值对照.

作者对 FP32 所有 $l_{\max}$ 取平均后, FlashTP 相对 e3nn 的 forward, backward 和 double-backward 加速分别为 $6.75\times$, $14.37\times$ 和 $26.54\times$. 高阶梯度收益最大, 与 Section 3 的 memory-bound profile 一致.

## Channel scaling

Appendix Table 6 固定 $l_{\max}=3$, 把 hidden channel 从 32 增至 64 和 128. FlashTP 的 latency 近似随 channel 线性增长, 相对 e3nn 的加速保持稳定:

| Channel | Forward | Backward | Double-backward |
| ---: | ---: | ---: | ---: |
| 32 | $7.2\times$ | $13.8\times$ | $29.1\times$ |
| 64 | $6.8\times$ | $13.5\times$ | $28.9\times$ |
| 128 | $6.7\times$ | $13.4\times$ | $28.8\times$ |

这比只测一个 channel 更有说服力, 但仍未覆盖不同 edge count, degree distribution 和 mixed irreps pattern 的完整空间.

## Roofline 还显示多少空间

Appendix A.4 用 A100 的 $19.5\,\mathrm{TFLOP/s}$ 与 $1.9\,\mathrm{TB/s}$ 估算 $l_{\max}=3$ FP32 的理论 latency 下界. Forward, backward 和 double-backward 分别为 $0.92$, $1.78$ 和 $2.70\,\mathrm{ms}$, 实测为 $2.54$, $6.15$ 和 $8.73\,\mathrm{ms}$.

实测仍约为 roofline 估计的 $2.8$, $3.5$ 和 $3.2$ 倍. 所以 FlashTP 显著优于对照, 但作者自己的分析也表明它尚未达到硬件理论边界.

## 数值稳定性检查

Fusion 会改变浮点求和次序. Appendix B 以 e3nn FP64 为 reference, 比较 e3nn FP32 与 FlashTP FP32 的输出及梯度 RMSE. 论文把 8 个 tensor 项目的平均 RMSE 汇总为 $5.64\times10^{-6}$ 与 $4.60\times10^{-6}$.

分项结果有的 FlashTP 更小, 有的略大. 例如 forward output RMSE 分别为 $9.9565\times10^{-7}$ 与 $9.9171\times10^{-7}$, double-backward hidden gradient 为 $2.5270\times10^{-7}$ 与 $3.5300\times10^{-7}$. 合理结论是两者误差同量级, 不是 FlashTP 在数值精度上普遍优于 e3nn.

## MD 推理实验

Figure 12 把预训练 SevenNet-l3i5 接入 ASE, 模拟铜原子系统. 每次运行 500 个 MD step, 取最后 100 步平均. 系统规模增加到发生 OOM 为止.

- FlashTP 最多支持约 28000 个原子.
- 该上限是 e3nn 的 $4.7\times$, 是 cuEq 的 $3.1\times$.
- 在 4000 原子处, FlashTP 比 e3nn 快 $4.2\times$, 比 cuEq 快 $6.2\times$.
- 同一点 peak memory 比 e3nn 少 $6.3\times$, 比 cuEq 少 $4.3\times$.

Appendix A.5 说明 FlashTP 最终 OOM 来自仍使用默认 e3nn 的 Linear layer, 而不是 Tensor-Product layer. 这既说明 TP 瓶颈已被明显缓解, 也说明优化会把系统瓶颈转移到其他层.

## 单 GPU 训练

训练使用 MPF 数据集 168921 个样本, 平均每个样本 29 个原子, batch size 16, FP32, Adam 与 Huber loss. Table 3 报告每 epoch 时间和 peak memory:

| 模型 | 实现 | 时间 | Peak memory |
| --- | --- | ---: | ---: |
| SevenNet-l2i5 | e3nn | 31 min | 3.78 GB |
| SevenNet-l2i5 | FlashTP | 20 min | 0.89 GB |
| SevenNet-l3i5 | e3nn | 76 min | 8.52 GB |
| SevenNet-l3i5 | FlashTP | 22 min | 1.37 GB |
| SevenNet-l4i5 | e3nn | 213 min | 17.43 GB |
| SevenNet-l4i5 | FlashTP | 32 min | 2.07 GB |

对应 e3nn 时间加速约为 $1.6\times$, $3.5\times$ 和 $6.7\times$. $l_{\max}$ 越高, Tensor-Product layer 占比越大, 端到端收益越明显. 摘要中的训练 $3.5\times$ 与显存 $6.2\times$ 指 SevenNet-l3i5, 不是所有模型的统一数字.

Tables 9-11 还揭示一个需要控制的变量. l2i5 和 l3i5 的高 degree hidden channel 会逐级缩小, 而 l4i5 在 degree 0 到 4 上都使用 128 channels. 所以从 l3i5 到 l4i5 的计算增长同时来自更高 $l_{\max}$ 和更宽的高阶表示. $6.7\times$ 端到端加速证明 FlashTP 特别适合这个更重配置, 不能把 l2, l3, l4 之间的全部差异单独归因于 $l_{\max}$.

cuEq 在 l2i5 上训练 23 min, 接近 FlashTP 的 20 min. 到 l3i5 和 l4i5 时分别为 97 min 与 358 min, 慢于对应 e3nn. 论文解释为 cuEq 的 shared-memory 策略随 $l_{\max}$ 增大而受容量限制.

## 多 GPU 训练

SevenNet-l3i5 保持每 GPU batch size 16, 从 8 张扩展到 64 张 A100:

| GPU 数量 | e3nn | FlashTP | 加速 |
| ---: | ---: | ---: | ---: |
| 8 | 735 s | 164 s | $4.5\times$ |
| 16 | 399 s | 87 s | $4.6\times$ |
| 32 | 218 s | 49 s | $4.4\times$ |
| 64 | 123 s | 30 s | $4.1\times$ |

加速从 8 卡到 64 卡基本保持, 略微下降可由跨 node 通信占比上升解释. 这证明单 kernel 优化没有在 data-parallel scaling 中被完全吞没, 但论文没有给出通信与计算的更细时间分解.

## 本章结论

FlashTP 的证据链完整经过 microkernel, 数值误差, 单卡 MD, 单卡训练和多卡训练. 最强结果集中在高 $l_{\max}$ 与 double-backward, 正好对应原实现最重的流量瓶颈. 应当保留数字的作用域: $41.6\times$ 与 $60.8\times$ 是峰值 kernel 加速, SevenNet-l3i5 的完整 MD 与训练加速则是 $4.2\times$ 与 $3.5\times$.
