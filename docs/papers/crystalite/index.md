---
title: Crystalite 精读总览
description: 从晶体表示, Subatomic Tokenization, GEM, EDM 与生成评测审读 Crystalite.
---

# Crystalite 精读总览

## 版本与对象

本组页面精读 *Crystalite: A Lightweight Transformer for Efficient Crystal Modeling*, arXiv:2604.02270v2. v1 提交于 2026-04-02, v2 修订于 2026-07-01. v2 PDF 共 39 页, 包含 14 幅图, 7 张表与 103 个编号公式.

仓库中的 `MLIP/2604.02270v2.pdf` 与 arXiv 官方 v2 PDF 的 SHA-256 完全一致. 本站以 v2 PDF 确定最终页码和数值, 以 v1 与 v2 官方 TeX archives 审计版本差异, 并以作者公开代码核对实现.

## 论文真正改变了什么

Crystalite 不使用 equivariant GNN 作为 denoiser. 它保留标准 diffusion Transformer, 每个 atom 对应一个 token, 整个 lattice 对应一个 global token, 再加入 3 个 crystal-specific components:

- Subatomic Tokenization, 用 period, group, block 与 valence occupancies 构造连续 element descriptor.
- Geometry Enhancement Module (GEM), 将 periodic minimum-image pair geometry 转成 additive attention bias.
- Channel-wise anti-annealing, 在 EDM sampling 时分别加速 atom type, coordinate 与 lattice channels 的 reverse drift.

![Crystalite 架构](/images/crystalite/architecture.png)

## 一句话理解

Crystalite 用 $O(N^2)$ global attention 加上周期几何 bias, 换掉 equivariant message passing. 它在最多 20 或 52 atoms 的 benchmarks 上很快且准确, 但 lightweight 不等于 large-cell linear scaling, approximate symmetry 也不等于 exact equivariance.

## 阅读路线

1. [问题定义与两类任务](/papers/crystalite/problem).
2. [晶体表示, 周期性与对称性](/papers/crystalite/representation).
3. [Subatomic Tokenization](/papers/crystalite/tokenization).
4. [EDM 联合扩散与损失](/papers/crystalite/diffusion).
5. [Transformer 架构与 GEM](/papers/crystalite/architecture).
6. [Anti-annealing 与任务配置](/papers/crystalite/sampling).
7. [CSP 结果](/papers/crystalite/csp).
8. [DNG, SUN 与生成速度](/papers/crystalite/dng).
9. [评测指标与 thermodynamic pipeline](/papers/crystalite/metrics).
10. [生成晶体案例](/papers/crystalite/discoveries).
11. [消融与大样本行为](/papers/crystalite/ablations).
12. [v1 到 v2 的变化](/papers/crystalite/versions).
13. [代码复现审计](/papers/crystalite/code-audit).
14. [全部编号公式](/papers/crystalite/formulas).
15. [局限与审读结论](/papers/crystalite/critique).
16. [原文定位索引](/papers/crystalite/source-map).

## 先记住 7 个边界

第一, DNG 与 CSP 使用不同 width, type encoding, GEM configuration, training steps 与 sampling steps. 第二, DNG 的 atom count $N$ 直接从 training empirical distribution 采样, 不是模型联合生成. 第三, GEM 保留 full self-attention, Pair geometry 还要搜索 27 个 periodic images, 因而成本为 $O(N^2)$ 而非 graph cutoff 的 $O(N)$. 第四, 模型只通过 canonical cell preprocessing 与 translation augmentation 近似处理部分 symmetry, 没有 exact rotation 或 lattice-basis equivariance. 第五, main table 将 $0.1\,\mathrm{eV/atom}$ 门槛称为 stable, implementation 却把它记为 metastable, 术语不一致. 第六, 公开代码在 v2 后修复了 loss normalization bug, 当前复现 recipe 与论文 weights 不相同. 第七, 所谓 state-of-the-art 只相对于表中 baselines, fixed single-sample protocol 与作者选定的 evaluation pipelines.

## 原始资料

- [arXiv:2604.02270v2](https://arxiv.org/abs/2604.02270v2).
- [Crystalite code](https://github.com/joshrosie/crystalite).
- [公开 checkpoint 与数据资产](https://huggingface.co/datasets/joshrosie/crystalite-datasets).
