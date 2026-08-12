---
title: 如何证明模型真的 foundational
description: 从现有 leaderboards 到 scaling, adaptation, physics 和 efficiency 的评测矩阵.
---

# 如何证明模型真的 foundational

## 现有榜单测到了什么

### OC20

OC20 具有明确 ID/OOD splits 与 private test set, 推动 catalyst energy/force prediction. 其 265M 规模也足以做 1M, 10M, 100M 数据 scaling 实验. 但 leaderboard 主要展示 full-data result, 没有把 scaling curve 作为核心交付.

### Matbench Discovery

它测试晶体结构弛豫, thermodynamic stability 和 formation energy. 早期 compliant setting 以 MPtrj 为统一训练集, 后续模型加入各自数据后, 数据优势与架构优势混合, 还存在 train-test leakage 风险.

### NNP Arena 与 MLIP Arena

NNP Arena 用 coupled-cluster reference 比较预训练 MLIP 与 DFT 的 molecular energies, 同时报告 inference speed. MLIP Arena 增加 energy conservation, asymptotic behavior, smoothness, symmetry 和 simulation stability 等无需额外标签的物理测试.

这些方向比单一 MAE 更接近真实可靠性, 但仍没有独立完成 FM 的 scaling 与 fine-tuning qualification.

## 传统 leaderboard 的四个缺口

1. Accuracy overfocus: 可针对 energy 排名优化, 却降低 MD utility.
2. Data confounding: 训练集不同, 无法区分 architecture 与 data.
3. Missing uncertainty: 大模型 ensemble 成本高, 榜单很少评价 calibration 和 failure detection.
4. Missing foundation test: OOD universality 不等于 scaling 与 broad adaptation.

## 建议的四轴评测矩阵

| 轴 | 必要实验 | 关键控制 |
| --- | --- | --- |
| Scaling | 多个 $N,D,C$ 点的 loss curves | 同数据分布, 同训练配方, 报告 compute |
| Adaptation | 多域 learning curves | 相同下游数据量, 与 from scratch 比较 |
| Physical reliability | 守恒, smoothness, asymptotics, MD | 固定积分器, 步长, 初态与时长 |
| Deployment | Latency, throughput, memory, uncertainty | 同硬件, 同体系大小, 同精度 |

再加第五轴 label fidelity: 在同一构型集上分别对目标 DFT, hybrid 与 CCSD(T) reference 测量, 避免把不同 theory 的误差混为模型误差.

## Foundation capacity 应怎样量化

对每个下游任务 $t$, 记录 fine-tuning learning curve $\mathcal{E}_t(n)$. 可以定义在任务集合上的平均样本效率增益:

$$
G=\dfrac{1}{|\mathcal{T}|}
\sum_{t\in\mathcal{T}}
\log\left(
\dfrac{n_{t,\mathrm{scratch}}(\varepsilon_t)}
{n_{t,\mathrm{FT}}(\varepsilon_t)}
\right).
$$

该式是本站提出的解释性指标, 不是论文原公式. 它强调 FM 价值必须在多个任务和固定目标误差上体现, 而不是选一个成功案例.

## Uncertainty 的规模化难题

Deep ensembles 通过多个独立 fits 的方差估计 epistemic uncertainty, 但大型 FM 同时运行多个副本很昂贵. 未来 benchmark 应同时评价:

- Error calibration.
- OOD detection.
- Selective prediction, 即拒绝高风险样本后的误差.
- Uncertainty overhead, 包括额外 latency 和 memory.

单一模型 uncertainty head 更便宜, 但必须防止只学习训练 residual 而不能识别真正 distribution shift.

## 评测数据必须公开且可追溯

作者强调 open data 与 open software 对 FM scaling 的必要性. 如果训练数据不公开, 无法审计 test contamination, label protocol 或失败域. 如果只发布 checkpoint 而不发布训练配方, scaling claim 也难以复现.

因此 foundation model 的可验证性本身应被视作资格的一部分, 即公开 dataset versions, provenance, deduplication, checkpoint family, compute budget 和 evaluation code.

