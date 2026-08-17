---
title: 数据集与标签协议
description: 审计 DPA-2 的 18 个预训练数据集, 15 个下游任务, 任务权重与数据划分逻辑.
---

# 2. 数据集与标签协议

Table 1 是理解 DPA-2 的核心表. 它不仅列出数据量, 还定义哪些数据参与 pre-training, 哪些只用于 downstream evaluation, 以及多任务采样和 WARMSE 汇总使用的 weight.

## 预训练数据

18 个任务合计 5119379 个构型, 其中 train 4045094, test 1074285, 覆盖 73 种元素.

| 数据集 | 训练构型 | 主要领域 | Weight |
| --- | ---: | --- | ---: |
| Alloy | 71482 | 53 元素合金 | 2.0 |
| Cathode-P | 58690 | Li/Na 层状氧化物 | 1.0 |
| Cluster-P | 139200 | 单元与二元金属团簇 | 1.0 |
| Drug | 1379956 | 8 元素药物样分子 | 2.0 |
| FerroEle-P | 6966 | 钙钛矿铁电体 | 1.0 |
| OC2M | 2000000 | 表面吸附与催化 | 2.0 |
| SSE-PBE-P | 15019 | 固态电解质 | 1.0 |
| SemiCond-P | 136867 | 半导体 | 1.0 |
| H2O-PD | 46077 | 水和冰 | 1.0 |
| Ag $\cup$ Au-PBE | 16696 | 单质 Ag 与 Au | 0.2 |
| Al $\cup$ Mg $\cup$ Cu | 24252 | 3 种纯金属 | 0.3 |
| Cu, Sn, Ti, V, W | 88331 | 单元素金属 | 每项 0.1 |
| C12H26 | 33898 | 十二烷热解 | 0.1 |
| HfO2 | 27660 | 氧化铪 | 0.1 |

Drug 与 OC2M 两项就占 training frames 的约 $84\%$. Weight 没有严格按样本数成比例, 它人为提高较小但被认为重要或多样的数据集出现频率.

## 下游数据

15 个任务合计 14082851 个构型, 其中 train 13003158, test 1079693. 设计上包含几类迁移:

- **Composition transfer**. Cluster-P 的单元和二元团簇迁移到 Cluster-D 的三元团簇.
- **Element combination transfer**. 纯 Al, Mg, Cu 迁移到二元和三元 AlMgCu alloy.
- **Held-out element or compound transfer**. SSE-PBE-P 的 Ge/Si 体系迁移到含 Sn 的 $\mathrm{Li}_{10}\mathrm{SnP}_2\mathrm{S}_{12}$.
- **Label protocol transfer**. SSE-PBE 迁移到 SSE-PBESol, AgAu-PBE 迁移到 PBED3.
- **Domain-related molecular transfer**. Drug 迁移到 ANI-1x 与 Transition-1x.
- **Water functional transfer**. H2O-PD 迁移到 DPLR, SCAN0, PBE0TS 与 PBE0TS-MD.

这些任务不是同一种难度. 有的下游与预训练共享元素和局部结构, 只改变组合或 DFT protocol; 有的包含预训练 source task 缺少的元素; 有的跨分子构型类型. 汇总 WARMSE 会压缩这种异质性.

## 数据从哪里来

数据标签来自 VASP, Gaussian, ABACUS, CP2K 等程序, 使用 PBE, PBEsol, SCAN, hybrid functional, dispersion correction 与不同 basis/pseudopotential 设置. 构型生成来源包括 DP-GEN, relaxation trajectory, AIMD, high-temperature sampling, NEB reaction path 与公开 benchmark.

这正是多 head 设计的实验动机. 数据多样性不仅是 chemical diversity, 也是 label-function diversity.

## P 与 D 的划分实例

### Cathode

Cathode-P 包含多数 $\mathrm{Li}_x\mathrm{TMO}_2$, $\mathrm{Na}_x\mathrm{MnO}_2$ 和全部 $\mathrm{TMO}_2$. Cathode-D 保留 $\mathrm{Li}_x\mathrm{NiO}_2$ 及 Na 与 Ni, Fe, Co, Cr 的组合. 这是同结构族内 composition hold-out.

### Cluster

Cluster-P 使用单元素和二元素金属团簇, Cluster-D 使用 7 种三元素组合. 这检验表示能否把已学元素环境组合到更复杂 cluster.

### Semiconductor

SemiCond-P 包含 Si, Ge 与 11 类二元半导体, SemiCond-D 保留 AlN, BAs, InAs, InP, InSb, InSe 和 InTe. 多个下游体系含 In, 而 source task 本身不含 In, 但 In 可从其他 pre-training datasets 学到.

### Alloy

Al $\cup$ Mg $\cup$ Cu 只包含纯元素, AlMgCu-D 包含二元和三元合金. 论文还用覆盖 53 元素及多种 alloy environment 的 Alloy task 作为另一种 source head, 从而比较 narrow source 与 broad source.

## Weight 同时控制训练与评价

设第 $k$ 个任务权重为 $a_k$, 任务抽样概率为

$$
p_k=\dfrac{a_k}{\displaystyle\sum_{j=1}^{K}a_j}.
$$

论文中 $\displaystyle\sum_k a_k=13.2$. 同一组权重也用于汇总各任务 RMSE. 这样做使训练目标与报告重点一致, 但权重属于作者的价值选择, 不是由统计理论唯一决定.

例如, Alloy, Drug 与 OC2M 各为 2.0, 多个单元素金属只为 0.1. 改变权重会同时改变 descriptor 学到的折中以及 WARMSE 排名. 因而每任务结果比单一 WARMSE 更具有可诊断性.

## 数据规模不能直接等于信息规模

相邻 MD frames 高度相关, 一个包含百万帧的数据集不一定提供百万个独立环境. 不同任务的原子数, 元素多样性和构型生成策略也不同. Table 1 报告 frame count, 没有统一报告 unique local environments 或有效样本数.

## 本章结论

DPA-2 的数据设计刻意制造 3 种异质性: chemical space, configurational space 与 label protocol. Multi-task learning 的价值必须在 held-out downstream tasks 上体现, 因为 pre-training test RMSE 只说明模型能同时拟合这些 source tasks. 数据划分具有代表性, 但仍是作者构造的迁移场景, 不能自动代表所有真实下游应用.

