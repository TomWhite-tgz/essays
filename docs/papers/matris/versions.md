---
title: v1 到 v3 的实际变化
description: 基于官方 TeX source 的逐版本差异审计.
---

# v1 到 v3 的实际变化

## 提交时间

| 版本 | arXiv 时间 | 主要变化 |
| --- | --- | --- |
| v1 | 2026-03-02 15:52:41 UTC | 首次提交 |
| v2 | 2026-03-05 16:45:08 UTC | 标题, 文字与分子能量表修正 |
| v3 | 2026-03-06 02:36:46 UTC | 通讯作者脚注修正 |

## v1 到 v2

标题把错误的 `Machine Learning Interaction Potentials` 改为 `Machine Learning Interatomic Potentials`. 正文还修正 `Quantum Mechanism` 等语法和术语问题, 并重新安置 denoising 的文字说明.

最重要的数值变化发生在 molecular zero-shot table. MACE-OFF-L 在 MD22, ANI-1x, AIMD-Chig 的 energy MAE 从 0.041, 0.406, 0.050 改为 2.29, 5.82, 8.25. MatRIS-M 对应从 0.031, 0.301, 0.009 改为 2.23, 4.15, 1.55. Force columns 与其他主要实验未变.

修正后 MatRIS 的相对排序基本保持, 但绝对 energy error 增大约 1 到 3 orders of magnitude. 因此引用这张表时必须注明使用 v2 或 v3, 不能沿用 v1 数值.

## v2 到 v3

v3 只改变作者脚注. Guangming Tan 新增 `Corresponding author`, Weile Jia 改为复用同一 footnote. Method, equations, figures, tables 与实验结果均未变化, archive 中所有 non-TeX files 也 byte-identical.

因此仓库选择 v3 的原因很简单: 它是当前最新版, 包含 v2 的数值修正与最终作者信息. `v3` 不表示模型又训练了第三版, 也不表示主方法在 v3 发生变化.

## OpenReview 与 arXiv 不完全同步

OpenReview 页面对应 ICLR 2026 poster, 但可检索到的 camera-ready PDF 仍出现旧标题与旧通讯作者信息. 对最终文字, 分子表和作者脚注, 本站以 arXiv v3 source 与 PDF 为准.

