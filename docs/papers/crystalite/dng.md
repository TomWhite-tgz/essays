---
title: DNG, SUN 与生成速度
description: MP-20 de novo generation 的 quality-diversity-stability trade-off 与速度证据.
---

# DNG, SUN 与生成速度

## Main results

各 model 生成 10,000 crystals, 再用同一 NequIP relaxation pipeline 评测 stability. 关键结果如下:

| Model | Structural validity | UN | Stable | SUN | Density $W_1$ | Time per 1k |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| FlowMM | 93.03 | 83.99 | 46.05 | 31.64 | 1.389 | 1560 s |
| CrystalDiT | 77.82 | 56.86 | 83.41 | 41.70 | 0.202 | 73.72 s |
| DiffCSP | 99.93 | 87.89 | 50.28 | 38.60 | 0.192 | 237 s |
| MatterGen | 99.78 | 90.26 | 51.70 | 42.29 | 0.088 | 2639 s |
| ADiT | 99.52 | 56.91 | 76.90 | 36.76 | 0.231 | 84.81 s |
| Crystalite | 99.61 | 77.33 | 69.72 | 47.49 | 0.051 | 22.36 s, 5.14 s optimized |

Crystalite 在表中 SUN, density distribution 与 speed 最好. 但它不是 validity, composition validity, uniqueness, novelty, UN, raw stability 或 N-ary distribution 的逐项最佳. SUN 领先来自较均衡的 stability-diversity product.

## Training trade-off

![DNG training trade-off](/images/crystalite/tradeoff.png)

训练推进时, stability 上升, UN 下降. Atom-type loss 较低的 run 更慢拟合 composition, 保持较长时间的 novelty 与较平坦 SUN curve. 这意味着 checkpoint selection 本身是 generation method 的一部分. 若只按 validation denoising loss 选 checkpoint, DNG discovery ranking 可能不同.

## SUN 不能由表中两列直接相乘

表中 Crystalite 的 $77.33\%\times69.72\%=53.91\%$, 并不等于 SUN 47.49%. 原因是 SUN 应使用 unique-and-novel subset 中的 conditional stability, 而 displayed Stable 是另一 population 上的 overall rate. 论文附录把定义写为

$$
\operatorname{SUN}
=\operatorname{UN}\times
\widehat p(\mathrm{stable}\mid\mathrm{UN}).
$$

Main table 没有显示第二个 factor, 容易让读者误以为两列可直接相乘.

更严重的是 threshold terminology. Logger 把 $e_{\mathrm{hull}}\leqslant0$ 称 stable, 把 $e_{\mathrm{hull}}\leqslant0.1\,\mathrm{eV/atom}$ 称 metastable. Main text 又常把后者简称 stable. 因而主表标为 SUN 的量按 logger terminology 对应 MSUN convention, 必须结合 pipeline version 解释.

## Speed benchmark

所有速度在单张 NVIDIA H100 上测量, 每个 model 使用能放进显存的最大 batch. 标准 Crystalite 为 22.36 s per 1k, optimized `bfloat16` 为 5.14 s. Relative to standard ADiT, 分别约快 3.8 和 16.5 倍. Relative to MatterGen, 约快 118 和 513 倍.

这是真实 wall-clock throughput evidence, 但不是 equal-batch latency test. Models 使用的 sampling steps 也未在主表并列, 最大 batch 策略测量的是 optimized throughput. 对 online single-crystal latency 或 large cells, 不能直接使用这些 ratios.
