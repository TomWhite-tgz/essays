---
title: UMA 精读总览
description: 5 个原子数据域, Mixture of Linear Experts, compute scaling 与跨领域通用原子模型.
---

# UMA 精读总览

## 版本与对象

本组页面精读 *UMA: A Family of Universal Models for Atoms*, arXiv:2506.23971v2. v2 修订于 2026-03-04, 最终 PDF 共 34 页. 主文位于第 1-11 页, References 位于第 12-16 页, Appendix 位于第 17-34 页.

它是一篇独立的研究论文, 不是前一篇 DPA3 或原子模拟基础模型 Perspective 的补充材料. Perspective 曾把 UMA 当作前沿案例讨论, 本组页面则直接审读 UMA 自己的方法, 实验和附录.

本站以 v2 PDF 确定最终编号和页码, 以官方 TeX source 恢复公式与表格. 最终文件包含 Figures 1-9, Tables 1-26, Equations 1-6, 以及 energy referencing 与 normalization 的未编号公式. arXiv abstract 仍写 33 pages, 8 figures, 与最终 PDF 相差 1 页和 1 图, 新增内容主要来自 UMA-S-1.2 的 diatomic 审计.

## 论文真正改变了什么

UMA 把 5 个不同 DFT task 的约 4.59 亿 structures 合并训练一个 equivariant GNN family:

- OMat24 覆盖 inorganic materials.
- OMol25 覆盖 molecules.
- OC20++ 覆盖 adsorbate-surface catalysis.
- OMC25 覆盖 molecular crystals.
- ODAC25 覆盖 MOFs 与 direct air capture.

这些数据约含 300 亿 atoms. Scaling experiment 又把 1 epoch 估为约 500 亿 sampled atoms, 因为训练 sampling ratio 会重复抽取不同任务.

![UMA 数据域总览](/images/uma/fig1.png)

核心架构创新是 Mixture of Linear Experts (MoLE). Router 只读取 element composition, charge, spin 与 DFT task 等全局不变量, 对多个 linear expert 加权. 对固定体系, expert weights 可在 MD 前合并成单一权重矩阵, 让总参数量大幅增加而 active inference graph 基本不变.

## 模型家族与版本

| Model | Total params | Active params | Conservative | 主要用途 |
| --- | ---: | ---: | --- | --- |
| UMA-S-1.1 | 约 150M | 约 6M | 是 | 长时间 MD 与大体系 |
| UMA-S-1.2 | 约 290M | 约 6M | 是 | 2026-03 更新的小模型 |
| UMA-M-1.1 | 约 1.4B | 约 50M | 是 | 通用 accuracy/throughput 折中 |
| UMA-L | 700M dense | 700M | 否 | Scaling proof-of-principle |

UMA-L 仍是 direct-force model, 不能与 conservative S/M 在 NVE, phonon 或优化任务上等同解读. UMA-S-1.1 与 UMA-M-1.1 修复了早期 checkpoint 的 size-extensivity bug. UMA-S-1.2 又改变了训练方式, experts 数和训练数据, 不是只做推理加速的同一 checkpoint.

## 阅读路线

1. [5 个训练数据域与 DFT tasks](/papers/uma/data).
2. [eSEN backbone 与全局条件](/papers/uma/architecture).
3. [Mixture of Linear Experts](/papers/uma/mole).
4. [两阶段训练, 能量参考与算力](/papers/uma/training).
5. [IsoFLOP scaling laws](/papers/uma/scaling).
6. [推理速度, 显存与 active parameters](/papers/uma/inference).
7. [材料与声子证据](/papers/uma/materials).
8. [催化与 AdsorbML](/papers/uma/catalysis).
9. [分子与药物设计证据](/papers/uma/molecules).
10. [分子晶体与 MOFs](/papers/uma/crystals-mofs).
11. [版本演化与 diatomic 失效](/papers/uma/versions).
12. [全部编号公式](/papers/uma/formulas).
13. [局限与审读结论](/papers/uma/critique).
14. [原文定位索引](/papers/uma/source-map).

## 先记住 7 个边界

第一, 论文的 scaling experiment 只覆盖 direct-force pretraining 的 $10^{18}$-$10^{20}$ FLOPs, 最终约 $10^{22}$ FLOPs 训练预算依赖外推. 第二, MoLE 的 2.5 倍 active-parameter 优势随模型增大而缩小, 700M active parameters 时接近消失. 第三, main benchmark tables 混合 zero-shot held-out tests 与经过 MPtrj/sAlex fine-tuning 的 materials applications. 第四, UMA-L 非 conservative, 更大的模型在 HEA, phonon 和 optimization 上反而可能更差. 第五, 6 Å cutoff 无法表示初始相距超过 cutoff 的长程相互作用. 第六, global charge/spin embedding 在 dissociation 后会错误地把总体量复制给断开的 fragments. 第七, code 为 MIT license, checkpoint 使用 gated FAIR Chemistry License, 并有 geographic 与 acceptable-use restrictions, 不能笼统称为完全开放权重.

## 原始资料

- [arXiv:2506.23971v2](https://arxiv.org/abs/2506.23971v2).
- [FAIR Chemistry code](https://github.com/facebookresearch/fairchem).
- [UMA model card](https://huggingface.co/facebook/UMA).
- [UMA documentation](https://fair-chem.github.io/uma/).
