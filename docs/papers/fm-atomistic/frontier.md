---
title: OMol25, UMA 与审读结论
description: v3 新增的 OMol25 和 UMA, 当前最接近 foundation model 的证据与剩余缺口.
---

# OMol25, UMA 与审读结论

## 为什么 v3 很重要

论文初稿完成后, OMol25 dataset 与 UMA model 发布. 作者在 Section 3.5 新增它们, 并调整 "目前没有模型接近 FM" 的判断. 所以 v3 的前沿结论不是抽象路线图, 而是把 UMA 视为最接近该愿景的 prototype.

## OMol25 补了哪些数据缺口

正文报告 OMol25 超过 1 亿 snapshots, 使用 $\omega$B97M-V/def2-TZVPD, 单体系最多 350 atoms, 最多 10 unpaired electrons, total charge 从 $-10e$ 到 $+10e$, 覆盖 83 elements.

其域包括 small molecules, electrolytes, biomolecules 与 metal complexes, 并使用超过 10 种 sampling methods. 相对旧 molecular datasets, 它显著推进:

- Beyond-organic elements.
- Non-covalent interactions.
- Variable charge and spin.
- Complex reactions.
- 部分 long-range configurations.

但 "数据含有远距离构型" 与 "architecture 能表达跨 cutoff 长程作用" 是两回事. 如果图在 6 Å 后断开, 数据本身不能恢复不可见输入.

## UMA 的系统设计

UMA 联合训练 OMol25, OMat24, ODAC23, OC20 和一个未发表 Open Molecular Crystal dataset, 总量接近 5 亿. Architecture 基于 eSEN, 并加入 mixture of linear experts (MoLE).

作者强调 MoLE 的两项作用:

1. 多数据集 multi-task 训练优于各数据集单独训练.
2. 训练时可激活大量可学习参数, inference 时只使用较小子集, 保持速度和显存效率.

这使 UMA 同时具备 data diversity, parameter scaling 与 compute scaling evidence, 因而比只覆盖单一 PBE domain 的 universal potential 更接近 FM.

## 已经展示的能力

Perspective 报告 UMA 与 eSEN-OMol 在 Rowan NNP Arena 的 neutral closed-shell organic molecular energy 榜领先. GMTKN55 相对 coupled-cluster 的 error 比此前最佳模型降低近 5 kcal/mol.

文中进一步称, 对 variable charge, variable spin, metal-containing large systems 和 barrier heights, UMA 相对 CCSD(T) 的 energy error 已低于 $\omega$B97M-D3BJ/def2-QZVP DFT, 对 intermolecular non-covalent interactions 则接近该 DFT baseline.

这些是强 transfer evidence, 但应注意:

- Perspective 引用外部 UMA 和 OMol25 结果, 本文没有重新运行实验.
- NNP Arena 主榜描述为 neutral closed-shell organic energies, 与后文 variable charge/spin 分析不是同一子集.
- 低于某一 DFT baseline 不等于达到统一 chemical accuracy, 需看每类任务绝对误差.

## 剩余明显失败

OMol25 evaluation 中 charge, spin 和 long-range interactions 相对 reference DFT 仍有大于 100 meV 的误差. 作者将其联系到 naive charge/spin handling 与 6 Å graph cutoff.

这恰好说明 data scaling 与 architecture support 必须共同满足. 若同一 geometry 在不同 charge/spin 下共享输入, 标签函数是多值的. 若两个 fragment 超过 cutoff, message passing 图断开. 这些不是再加相同输入数据就必然消失的问题.

## UMA 是否已经是 foundation model

按本文自己的三项判据审计:

| 判据 | v3 提供的证据 | 判断 |
| --- | --- | --- |
| 广泛下游优于 from scratch | 多域表现与 NNP Arena 很强, 但标准化 fine-tuning matrix 不完整 | 部分满足 |
| 参数, 数据, 算力 scaling | 文中称 UMA 展示 parameter 与 compute scaling | 最接近满足 |
| Emergent capability | 高质量 reference transfer 有迹象, 但机制和阈值证据有限 | 尚未充分证明 |

所以最稳妥结论是 UMA 是 prototype foundation MLIP, 而非已经完成全部资格验证的终点.

## Perspective 的贡献与局限

最有价值的贡献是收紧术语, 并把架构, 数据, training 和 evaluation 放入同一系统视角. 它还准确预测了几个关键矛盾: strict physics 与 scalable kernels, local graphs 与 long range, broad low-fidelity data 与 accurate fine-tuning, giant teacher 与 simulation-speed student.

局限也很清楚:

- 没有统一实验验证三项 FM 判据.
- 对 bitter lesson 与 rotation augmentation 的表述强于本文直接证据.
- Dataset sizes 横跨不同记录单位和信息密度.
- v3 后插入 OMol25/UMA 后, 个别表格方法名和 Figure 2 字母没有完全同步校正.
- "emergence" 仍缺少可操作统计定义.

## 最终判断

这篇 Perspective 不应当被读成一份现有模型排行榜. 它提出的是资格审查框架:

$$
\text{大而通用的势}
\neq
\text{基础模型},
$$

除非模型同时给出 scaling curves, 跨域 adaptation gains, 新能力证据和物理可靠性测试. v3 中 UMA 让这条路线从愿景变成可信 prototype, 也用 charge, spin 和 long-range 的失败提醒我们, 规模不能替代输入可辨识性与正确的相互作用结构.

