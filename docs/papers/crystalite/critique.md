---
title: 局限与审读结论
description: Crystalite 最可信的贡献, symmetry, scaling, metric 与 reproducibility 边界.
---

# 局限与审读结论

## 最可信的贡献

Crystalite 证明 dense Transformer 不必完全忽略 crystal geometry. 将 periodic pair geometry 作为 attention bias, 再配合 continuous atom tokenization, 足以在 small-cell CSP 上达到强 accuracy, 在 MP-20 DNG 上形成有竞争力的 stability-diversity-speed balance. v2 主动区分 intensive 与 extensive metrics, 并用 3 套 pipelines 检查 DNG, 这也是实质贡献.

## 7 个关键边界

1. Symmetry 不是 exact. Random translation augmentation, Niggli reduction 与 periodic features 只提供 approximate 或 canonical handling. Edge bias 本身读取 basis-dependent fractional direction.
2. Scaling 不是 linear. Global attention, all-pairs GEM 和 27-image search 都是 $O(N^2)$. 最多 52 atoms 的结果不能外推到 large supercells.
3. DNG 不生成 atom count. $N$ 从 training empirical distribution 先验采样, 限制 composition-size extrapolation.
4. CSP 与 DNG 不是同一模型. v2 才澄清 CSP width 翻倍, sampling steps 从 150 增到 400, type representation 与 GEM branches 也不同.
5. Stability 是 proxy. Main 10,000 samples 用 NequIP relaxation 加 phase-diagram compatibility correction, 没有完整 DFT 或 experimental validation.
6. Metric naming 不稳定. $0.0$ 与 $0.1\,\mathrm{eV/atom}$ thresholds 在 logger, SUN, MSUN 与 main prose 中被不同地称为 stable.
7. Paper-code objective 不闭合. v2 后确认的 public-code loss normalization bug 与 current README weights 均不同于 paper specification, checkpoint 的 exact reducer 又无法从 visible history 证明.

## SOTA 结论应怎样写

可以说 Crystalite 在 paper Table 1 的 3 个 CSP benchmarks 上取得最高 single-sample MR 和最低 matched-only RMSD, 在 Table 2 的统一 NequIP pipeline 中取得最高 SUN 与最快 throughput. 不应说它已证明所有 crystal generation 场景优于 equivariant models, 也不应把 optimized throughput 与 CSP accuracy 当成同一 checkpoint 的 Pareto point.

## 最需要补做的实验

第一, 在 held-out cell sizes 与 highly skewed lattices 上比较 GEM periodic search accuracy, $N^2$ memory 与 runtime. 第二, 做 explicit global translation, rotation, atom permutation 与 lattice-basis transformation tests, 报告 output discrepancy. 第三, 使用 fixed model width, sampling steps 和 compute 做 GEM versus equivariant backbone comparison. 第四, 在 validation set 选择 anti-annealing, 在 untouched datasets 验证. 第五, 对 matched sample subset 做 DFT relaxation 与 hull calculation, 报告 MLIP false-positive rate.

复现方面, 应发布 exact training commit, raw loss reducer, each table checkpoint hash, seed list, $\pm$ estimator 和 threshold manifest. 对 Subatomic Tokenization, 还应分别消融 PCA dimension reduction, fixed chemical descriptors 与 loss rebalancing.

## 总体判断

Crystalite 的 architecture insight 是成立的: 对 small unit cells, standard Transformer 加轻量 periodic geometry bias 可以取代更重的 equivariant denoiser 并保持强结果. GEM 对 CSP RMSD 和 DNG stability 的消融方向一致, 速度优势也有 H100 wall-clock evidence.

但论文标题中的 lightweight 应限定为 benchmark-scale sampling throughput, reliable discovery 则必须限定为 MLIP-based proxy. v2 的配置澄清和后续 code bug 说明, 这项工作仍处在快速修订期. 它是一条值得继续验证的 crystal diffusion design, 还不是 symmetry, scalability 与 thermodynamic reliability 都闭合的通用 generator.
