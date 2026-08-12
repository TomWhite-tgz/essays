---
title: 零样本与少样本证据
description: 审计 DPA-2 的单任务基准, 多任务 source accuracy, zero-shot WARMSE 和 downstream learning curves.
---

# 7. 零样本与少样本证据

DPA-2 的 generalizability 证据分 3 层: 同分布 single-task architecture benchmark, multi-task model 对 source tasks 的拟合, 以及真正重要的 downstream zero-shot 与 few-shot transfer. 三者不能相互替代.

## Table S1: ANI-1x single-task benchmark

DPA-2 用约 500 万 ANI-1x training conformations 训练约 20.2 epochs, 在 ANI-MD, DrugBank, GDB07-09, GDB10-13, S66x8 和 Tripeptide 6 个 test sets 上与 ANI-1x ensemble 比较.

DPA-2 的 energy 与 force RMSE 在全部 6 项均更低. 例如 ANI-MD energy 从 $5.94\pm1.48$ 降到 $3.31\,\mathrm{kcal/mol}$, force 从 $4.24\pm0.63$ 降到 $1.42\,\mathrm{kcal/(mol\,\text{\AA})}$.

这说明 DPA-2 architecture 能拟合 molecular PES, 但不涉及 multi-task pre-training, 也不证明 condensed-matter transfer.

## Table S2: 与 5 类架构的同预算比较

GemNet-OC, EquiformerV2, NequIP, Allegro, MACE 和 DPA-2 在每个 pre-training dataset 上各训练 100 万 steps, batch size 1, 单张 32 GB GPU. 汇总 WARMSE 为:

| 模型 | Energy | Force |
| --- | ---: | ---: |
| GemNet-OC | 22.4 | 74.6 |
| EquiformerV2 | 14.0 | 188.9 |
| NequIP | 36.3 | 142.5 |
| Allegro | 23.4 | 108.4 |
| MACE | 29.1 | 112.8 |
| DPA-2 | 13.6 | 99.2 |

单位分别为 $\mathrm{meV/atom}$ 与 $\mathrm{meV/\text{\AA}}$. DPA-2 energy WARMSE 最低, force WARMSE 第二, 不是两个指标都第一.

### 公平性限制

所有模型步数与 batch size 相同, 但 learning rate 与其他 hyperparameters 使用各 package defaults. 作者还为不自动处理 elementwise energy bias 的模型预先减去 least-squares bias. 部分任务出现 OOM 或 unresolved errors. 这是固定计算步数下的实用比较, 不是对每个 baseline 充分调参后的最优 frontier.

## Table S3: 多任务拟合 source tasks 的代价

Multi-task 与按有效样本次数配平的 single-task DPA-2 在 18 个 source tasks 上比较:

| 模式 | Energy WARMSE | Force WARMSE |
| --- | ---: | ---: |
| Single-task | 14.9 | 111.1 |
| Multi-task | 18.6 | 116.3 |

Multi-task force error 接近 single-task, energy error 更高. 按 WARMSE 直接计算, energy 增幅约为

$$
\dfrac{18.6-14.9}{14.9}\approx24.8\%.
$$

正文称 energy RMSE "roughly 40% higher", 与表格汇总值的直接比值不完全一致. 更稳妥的表述是 source energy fitting 有明显退化, force fitting 仅小幅退化. Multi-task 的价值必须由 downstream transfer 补偿.

## Table 2: Zero-shot 比较

Weighted average results 为:

| 模型 | Pre-training | Energy WARMSE | Force WARMSE |
| --- | --- | ---: | ---: |
| MACE-MP-0 | MPtrj | 104.0 | 575.6 |
| DPA-2 | MPtrj | 68.3 | 516.6 |
| DPA-2 ST | 相关单任务数据 | 100.2 | 628.0 |
| DPA-2 MT | 全部 18 个任务 | 50.1 | 238.8 |

DPA-2 MT 相对 DPA-2 ST 的 energy WARMSE 降约 $50\%$, force WARMSE 降约 $62\%$. 这直接支持多任务 descriptor 比单 source descriptor 更 transferable.

MACE-MP-0 与 DPA-2 都在 MPtrj 训练时, DPA-2 较好但差距远小于 MT 的提升. 作者据此判断主要收益来自 multi-task data/training, 不只是 architecture.

## "有 zero-shot 能力" 的门槛很弱

Table 2 把 model RMSE 小于 test-label standard deviation 视为出现 zero-shot generalization. 这相当于优于预测常数均值的 baseline. 它能排除完全失效, 但不代表 force error 足以进行稳定 MD.

例如 DPA-2 MT 的 Transition-1x force RMSE 为 $363.8\,\mathrm{meV/\text{\AA}}$, 略低于 label standard deviation $368.1\,\mathrm{meV/\text{\AA}}$. 按论文定义属于有 generalization, 但工程上并不能据此判定反应动力学准确.

## 逐任务结果并非全部改善

Multi-task 对很多 task 大幅改善, 例如 SemiCond-D force 从 ST 的 $1439.4$ 降到 $439.3\,\mathrm{meV/\text{\AA}}$, SSE-PBE-D 从 $635.6$ 降到 $162.4\,\mathrm{meV/\text{\AA}}$.

但也有例外. Cathode-D energy 从 ST 的 39.8 上升到 43.8, H2O-DPLR energy 从 9.1 上升到 9.3, H2O-PBE0TS-MD energy 从 0.5 上升到 0.6. 汇总改善不表示每个 task 无负迁移.

## Figure 3 与 Figure S1: Few-shot learning curves

Fine-tuned DPA-2 与 from-scratch DPA-2 使用相同 architecture, 区别只有 initialization. 因而小数据区间的 gap 可以较干净地归因于 pre-training.

在 15 个 downstream tasks 上, fine-tuned curves 通常更低, 数据增多后差距缩小. H2O-PBE0TS-MD 达到相同 energy accuracy 时, 论文报告可节省约两个数量级的 downstream data.

每个 sample-size setting 的 epochs 设为 $10^6$ 除以样本数, 使 optimization updates 总量近似统一. 这控制了不同数据量下的训练 step, 但小数据集会被重复访问更多 epochs, learning curve 同时反映 initialization 与 repeated optimization.

## Fine-tuning head 不是决定因素

Supplementary Figure S2 在 ANI-1x 上比较 Drug head, FerroEle-P head 与 random head. 两个 pre-trained heads 在约 $10^3$ samples 后趋同, random head 在约 $10^4$ 后追上. 相对 ANI-1x 的 480 万级 training size, head initialization 影响较小.

这支持 descriptor 承载多数可迁移信息. 但它不证明任何 source head 对所有 downstream tasks 都等价, 尤其在极低样本区间仍可见差异.

## 本章结论

DPA-2 最有力的证据不是 source-task accuracy, 而是相同 DPA-2 architecture 下 MT initialization 对 zero-shot WARMSE 和 low-data learning curve 的改善. 同时, source fitting 有代价, 部分 downstream tasks 存在负迁移, zero-shot 判据也只是一条弱基线. "节省 1-2 个数量级数据" 应理解为部分 learning curves 上达到指定 RMSE 的结果, 不是所有任务统一保证.
