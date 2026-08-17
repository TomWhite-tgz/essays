---
title: 原文定位索引
description: EquiformerV3 v1 的章节, figures, tables, equations 与代码证据定位.
---

# 原文定位索引

## 文本结构

| 内容 | PDF 页码 |
| --- | ---: |
| Abstract 与 Introduction | 1-2 |
| Related Works 与 Background | 2-4 |
| EquiformerV3 method | 4-7 |
| OC20, OMat24 与 Matbench experiments | 7-10 |
| References | 10-16 |
| Appendix A, Overall architecture | 17 |
| Appendix B, Body-order experiments | 17-18 |
| Appendix C, Equivariance errors | 18-20 |
| Appendix D, OC20 details | 20 |
| Appendix E, OMat24 details | 21 |
| Appendix F, Matbench details | 22-23 |

## Figures

| Figure | 内容 | PDF 页码 |
| --- | --- | ---: |
| 1 | EquiformerV3 overall architecture 与 attention | 4 |
| 2 | Layer normalization statistics | 5 |
| 3 | Gate, $S^2$ 与 SwiGLU-$S^2$ activation | 6 |

## Tables

| Table | 内容 | PDF 页码 |
| --- | --- | ---: |
| 1 | OC20 sequential architecture ablation | 7 |
| 2 | OMat24 validation MAE 与 model sizes | 8 |
| 3 | Matbench Discovery, MPtrj-only | 9 |
| 4 | Matbench Discovery, OMat24 transfer | 9 |
| 5 | Body-order counterexamples | 18 |
| 6 | FFN activation equivariance errors | 19 |
| 7 | Attention activation equivariance errors | 19 |
| 8 | OC20 hyperparameters | 20 |
| 9 | OMat24 hyperparameters | 21 |
| 10 | MPtrj hyperparameters | 22 |
| 11 | OMat24 to MPtrj+sAlex hyperparameters | 23 |

## Equations

| Equation | 内容 | PDF 页码 |
| ---: | --- | ---: |
| 1-3 | Ordinary attention 与 smooth cutoff attention | 5 |
| 4-5 | $S^2$ projection 与 inverse projection | 6 |
| 6 | Sphere-grid tensor product | 6 |
| 7 | SwiGLU-$S^2$ | 7 |
| 8 | Stacked self tensor products | 18 |

## 版本与代码证据

- Official v1 PDF SHA-256: `5e65064b4da5f7b8e7cb67d297b98d5f3c81339f429b5a67bd47699d3a686140`.
- Official v1 source archive SHA-256: `c76b954f9e3c5409db76683df5358bceb4a153bbcc9f04a7e9125961a837503a`.
- v1-time public code commit audited: [`124cc76bcd371e87f6839cb6d7fe40fefc6d3f2b`](https://github.com/atomicarchitects/equiformer_v3/commit/124cc76bcd371e87f6839cb6d7fe40fefc6d3f2b).
- Later repository state checked: [`a7300c58df683dc99cb48027d5bfd4c887486c48`](https://github.com/atomicarchitects/equiformer_v3/commit/a7300c58df683dc99cb48027d5bfd4c887486c48), with no model source changes from the v1-time commit.
- Public checkpoints: [mirror-physics/equiformer_v3](https://huggingface.co/mirror-physics/equiformer_v3).

本站 3 张方法图片来自 official v1 source archive, 没有重绘 result data.
