---
title: 表征, 消融与能量守恒
description: 解读 DPA-2 的 t-SNE 表征, repformer ablation 和 NVE energy-drift 实验.
---

# 9. 表征, 消融与能量守恒

本章汇总 3 类机制证据. Figure 5 问 descriptor 学到了什么, Table S5 问 repformer 哪些 branches 有用, Figure S3 问 conservative 与 $C^2$ design 是否在 NVE 中避免 energy drift.

## Figure 5: t-SNE chemical map

作者取 final repformer 的 single-atom representations, 用 t-SNE 投影到二维. 相同元素通常形成 cluster, periodic-table 相近元素在图中呈现一定邻近关系:

- IA 与 IIA elements 位于相近区域.
- Non-metals 与 transition metals 大致分区.
- Cu, Ag, Au 更靠近 Li, 作者联系到它们都具有一个 outermost s electron.
- Ca, Sr 靠近 Zn, Cd, 作者联系到两个 outermost s electrons.
- Hydrogen 分成两簇, water environments 更靠近 metal-like region, molecular datasets 更靠近 non-metal region.

这些现象说明 representation 同时编码 element identity 与 environment, 不是简单 one-hot lookup.

## 同一元素的环境分离

Figure 5(c) 比较 Alloy 与 OC2M 中的 Al. 远离 adsorbate 的 catalyst Al 更接近 all-metal Alloy points, 靠近 adsorbate 的 Al 在 latent space 中分离.

Figure 5(d) 对 C 给出类似现象. OC2M adsorbate 中越靠近 catalyst surface 的 C, 越远离 Drug molecular C cluster.

Figure 5(e) 中 SSE-PBE 与 SSE-PBESol 的 S representations 重叠, 但按相邻 P 或 Si/Ge/Sn 分成两类. 作者据此说 descriptor 对 DFT labeling accuracy 不敏感而对 chemical environment 敏感.

### t-SNE 证据边界

t-SNE 强调局部邻域, 会扭曲全局距离, 结果还依赖 perplexity, random seed 与 sampling. 2D cluster 不能证明原高维空间具有相同全局几何, 也不能证明某个电子结构解释是唯一原因.

PBE 与 PBEsol points 重叠说明 model 没有按 task label source 简单分群. 但 descriptor 本身由多任务 gradients 训练, "对 labeling accuracy 不敏感" 是解释, 不是从一张 t-SNE 图严格识别出的 causal property.

## Table S5: Repformer ablation

论文分别对 single-atom 和 pair channels 从左到右 sequentially remove components. 报告的是 18 个 pre-training datasets 上 average test-RMSE increase:

| Channel | 移除项 | $\Delta E$ | $\Delta F$ |
| --- | --- | ---: | ---: |
| Single atom | Conv | +5.1 | +41.2 |
| Single atom | Sym_f | +0.7 | +10.4 |
| Single atom | Sym_g | +17.1 | +51.3 |
| Single atom | Local attention | +14.6 | +58.4 |
| Pair | Prod_f | +4.6 | +21.7 |
| Pair | Gate | +4.7 | +34.6 |
| Pair | Attention | +0.6 | +14.1 |

单位分别为 $\mathrm{meV/atom}$ 与 $\mathrm{meV/\text{\AA}}$. Single-atom local attention 和 sym_g 对 force accuracy 很重要. Pair branch 中 direction gate 比剩余 attention 部分更重要, 支持 Equation 32 的 angle-aware design.

Sequential ablation 有顺序依赖. 例如 local attention 的增量是在 conv, sym_f, sym_g 已按顺序移除后的状态测得, 不是 full model 单独移除 local attention 的 marginal effect. 表格适合证明所有 branches 组合有用, 不适合精确排列独立贡献.

## Figure S3: NVE energy drift

作者选 3 个 OC2M structures, 从 330 K 开始运行 100 ps NVE MD, 比较 GemNet-OC, EquiformerV2 和 DPA-2. 前两者直接预测 forces, 不保证来自同一 energy gradient; DPA-2 使用 Equation 2 的 conservative forces.

结果中 GemNet-OC 与 EquiformerV2 出现明显 total-energy drift, DPA-2 没有可见 drift. 这支持 conservativity 与 smooth cutoff 对 NVE 的价值.

## 为什么该实验不是 accuracy ranking

3 个模型训练程度很不相同:

- GemNet-OC 训练 1000 万 steps, reported force MAE 为 $0.026\,\mathrm{eV/\text{\AA}}$.
- EquiformerV2 训练 1500 万 steps, reported force MAE 为 $0.016\,\mathrm{eV/\text{\AA}}$.
- DPA-2 只训练 100 万 steps, force MAE 为 $0.116\,\mathrm{eV/\text{\AA}}$.

作者明确称 DPA-2 只是 illustrative case. 实验要说明较低 instantaneous force error 的 non-conservative model 仍可能 energy drift, 不是说这个 DPA-2 checkpoint 的 force accuracy 更好.

Energy drift 还会受 integrator, timestep 与 numerical precision 影响. 论文图展示固定设置下的对比, 没有系统扫描 timestep convergence. 更强的验证应报告 drift rate 与 timestep scaling.

## 结构要求与实验之间的闭环

| 设计 | 机制证据 | 行为证据 |
| --- | --- | --- |
| Shared descriptor | Figure 5 环境与元素聚类 | Zero-shot 与 few-shot transfer |
| Repformer branches | Table S5 removal error | Source 与 downstream RMSE |
| Energy-gradient force | Equation 2 | Figure S3 NVE stability |
| $C^2$ switch 与 smooth attention | Equation 13, 35-36 | Figure S3 无可见 drift |

最后一行仍是联合证据. NVE 图没有分别消融 switch 与 softmax, 因而不能单独量化每项对 drift 的贡献.

## 本章结论

DPA-2 的机制证据覆盖 representation geometry, architecture ablation 和 dynamical conservation. 它们支持 descriptor 确实编码环境, repformer 各 branch 并非冗余, conservative design 对 NVE 有用. 同时, t-SNE 解释, sequential ablation 和 3 条 NVE trajectories 都有明确边界, 不能替代更广泛的跨体系动力学验证.
