---
title: PET-MAD 精读总览
description: 小数据, 高多样性和内部一致性驱动的轻量通用原子间势.
---

# PET-MAD 精读总览

## 版本与对象

本组页面精读 *PET-MAD, a lightweight universal interatomic potential for advanced materials modeling*, arXiv:2503.14118v2. 作者为 Arslan Mazitov 等. v2 PDF 共 29 页, 主文位于第 1-10 页, References 位于第 11-16 页, Supplementary Information 位于第 17-29 页.

公式, 图表与补充材料由 v2 TeX source 恢复. 原文包含主文 Figures 1-9 与 Table I, Supplementary Figures S1-S17 与 Table II, 以及补充材料中的 Equations 1-11.

## 论文真正改变了什么

多数 universal MLIP 以数百万至数千万构型换取覆盖. PET-MAD 提出不同路线:

- 用 95,595 个高度多样的构型覆盖 85 种元素.
- 对晶体, 表面, cluster, 2D material, molecular crystal 与 molecular fragment 使用同一套 PBEsol 数值设置.
- 主动加入 rattled, random-composition 和低维构型, 优先覆盖异常环境.
- 用约 3.3M 参数的 unconstrained Point Edge Transformer 拟合.
- 以 LoRA 做低成本领域微调, 以 LLPR 做低成本不确定性传播.

![PET-MAD 数据效率前沿](/images/pet-mad/fig1.png)

作者的核心论点不是 95k 构型在任何意义上都胜过大数据, 而是 structural diversity 与 reference consistency 能显著提高每个 DFT 构型的训练价值.

## 六个应用案例

| 系统 | 工作流 | 最终物理量 |
| --- | --- | --- |
| $\mathrm{Li_3PS_4}$ | MD 与 Green-Kubo | Ionic conductivity |
| GaAs | Interface pinning 与 reweighting | Melting point |
| CoCrFeMnNi | REMD 加 Monte Carlo swaps | Surface segregation |
| Liquid water | PIMD | RDF 与 heat capacity |
| Succinic acid | MD/PIMD 加 shielding model | NMR shielding distribution |
| $\mathrm{BaTiO_3}$ | Flexible-cell MD 与 dipole model | Phase transitions 与 dielectric tensor |

每个案例都比较 PET-MAD, PET-Bespoke 和 PET-MAD-LoRA. 这比只报告静态 test MAE 更能检验模型能否进入复杂采样流程.

## 阅读路线

1. [MAD 数据集与一致 DFT](/papers/pet-mad/data).
2. [PET 架构, 训练与 LoRA](/papers/pet-mad/model).
3. [跨数据集 benchmark 与速度](/papers/pet-mad/benchmarks).
4. [LLPR 不确定性与传播](/papers/pet-mad/uncertainty).
5. [离子输运与 GaAs 熔点](/papers/pet-mad/transport-melting).
6. [合金偏析与液态水](/papers/pet-mad/alloy-water).
7. [NMR 晶体学与 BTO 介电响应](/papers/pet-mad/nmr-bto).
8. [Fine-tuning 学习曲线](/papers/pet-mad/finetuning).
9. [Direct force 失效与 MTS 修复](/papers/pet-mad/direct-force).
10. [全部编号公式](/papers/pet-mad/formulas).
11. [局限与审读结论](/papers/pet-mad/critique).
12. [原文定位索引](/papers/pet-mad/source-map).

## 先记住 6 个边界

第一, internally consistent PBEsol 只保证标签自洽, 不保证接近实验. 第二, benchmark 为每个模型选择与其训练集相容的 DFT reference, 提高了模型误差比较的公平性, 但不同 reference 下的绝对数字不能解释为同一物理真值. 第三, MAD 的随机 structure split 会让相同母晶体生成的原始, rattled, surface 或 cluster 构型跨 split 相关, 因而不是严格 prototype-level OOD 测试. 第四, LLPR 在 MAD test domain 校准良好, 对真正新化学域仍需重新验证. 第五, LoRA 提高目标域精度, 但 Table II 显示它仍会明显损失 MAD 通用精度. 第六, direct-force head 更快却产生灾难性采样错误, MTS 的成功依赖定期调用 conservative force.

## 原始资料

- [arXiv:2503.14118v2](https://arxiv.org/abs/2503.14118).
- [PET-MAD repository](https://github.com/lab-cosmo/pet-mad).
- [Atomistic Cookbook 示例](http://atomistic-cookbook.org/examples/pet-mad/pet-mad.html).

