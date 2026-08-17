---
title: 原文定位索引
description: Crystalite v2 的章节, Figures, Tables, Equations 与代码证据定位.
---

# 原文定位索引

## 文本结构

| 内容 | PDF 页码 |
| --- | ---: |
| Abstract 与 Introduction | 1-2 |
| Related Work | 2-3 |
| Methodology | 3-8 |
| Experimental Setup | 8-9 |
| CSP 与 DNG Results | 9-12 |
| Conclusion | 12 |
| References | 12-15 |
| Appendix A, Materials representation | 16-18 |
| Appendix B, Subatomic Tokenization | 19-21 |
| Appendix C, Architecture 与 configurations | 22-26 |
| Appendix D, EDM 与 anti-annealing | 27-29 |
| Appendix E, Evaluation metrics | 30-34 |
| Appendix F, Additional results | 35-38 |
| Appendix G, Generated SUN crystals | 39 |

## Figures

| Figure | 内容 | PDF 页码 |
| --- | --- | ---: |
| 1 | GEM overview | 2 |
| 2 | Oxygen 与 titanium subatomic tokens | 4 |
| 3 | Full Crystalite architecture | 6 |
| 4 | DNG training trade-off | 8 |
| 5 | Million-sample uniqueness 与 UN | 11 |
| 6 | Unit cell 与 periodic repetition | 16 |
| 7 | Fractional to Cartesian coordinates | 17 |
| 8 | 2D PCA of element tokens | 19 |
| 9 | Fe token neighbors | 21 |
| 10 | Detailed GEM | 24 |
| 11 | Subatomic Tokenization ablation | 35 |
| 12 | GEM DNG ablation | 36 |
| 13 | GEM CSP ablation | 36 |
| 14 | 9 generated SUN crystals | 39 |

ArXiv abstract page 写 `39 pages, 13 figures`, 但 v2 PDF 编号实际到 Figure 14. 本站以 PDF 为准.

## Tables

| Table | 内容 | PDF 页码 |
| --- | --- | ---: |
| 1 | CSP results | 10 |
| 2 | Main DNG quality, stability 与 speed | 10 |
| 3 | LeMat-GenBench | 12 |
| 4 | Task-specific configurations | 26 |
| 5 | MatterGen pipeline | 35 |
| 6 | DNG anti-annealing grid | 37 |
| 7 | CSP anti-annealing grid | 38 |

## Equations

| Range | 内容 | PDF 页码 |
| --- | --- | ---: |
| 1-18 | Main method | 4-8 |
| 19-32 | Crystal representation 与 symmetries | 16-18 |
| 33-39 | Subatomic Tokenization | 19-21 |
| 40-58 | Architecture 与 GEM | 22-25 |
| 59-86 | EDM 与 anti-annealing | 27-29 |
| 87-103 | DNG, CSP 与 sample-scaling metrics | 30-34 |

## 版本与代码证据

- v1 source archive, submitted 2026-04-02.
- v2 source archive, revised 2026-07-01.
- Repository PDF SHA-256: `b25819400bb09ac07766c750f23e662a9f8fcba726bb2ff7e97ddee6810bb5ac`.
- Official v2 PDF hash 与 repository hash 完全一致.
- Public code commit audited: [`3b2d4eacf3f0b17a04851b7bed1fcedc9733cda9`](https://github.com/joshrosie/crystalite/commit/3b2d4eacf3f0b17a04851b7bed1fcedc9733cda9).
- Loss normalization record: [GitHub Issue 1](https://github.com/joshrosie/crystalite/issues/1).

本站图片均来自 v2 official source archive, 没有重绘 result data.
