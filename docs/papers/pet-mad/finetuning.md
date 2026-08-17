---
title: Fine-tuning 学习曲线
description: 六个下游系统的 LoRA 样本效率, rank 限制和 catastrophic forgetting.
---

# Fine-tuning 学习曲线

## Base PET-MAD scaling

![PET-MAD data learning curve](/images/pet-mad/fig-s8.png)

训练数据从 20% 增至 100% 时 test energy/force MAE 持续下降. 20% 数据已达到 134.7 meV/Å force MAE. 60% 后 train error 反而上升, 作者解释为新增数据多样性使 3.3M model 无法过拟合. Test error 尚未饱和, 因而更多数据或更大 architecture 仍可能改善.

这是一条 dataset-size learning curve, 不是完整 scaling law: model size, epochs 与 compute 没有联合优化, 各 fraction 重复次数和 uncertainty 也未报告.

## 六个任务的模式

| Task | Low-data 时 LoRA | 数据增多后的情况 |
| --- | --- | --- |
| LPS | 有优势 | Bespoke force error 略低, observable 接近 |
| GaAs | 有优势 | Bespoke/LoRA 均显著改善 base |
| HEA | 明显有优势 | Fine-tuned 仍优于 undersampled bespoke |
| Water | 约前 20% 有优势 | Rank 8 后期落后, rank 32 部分修复 |
| Succinic acid | LoRA/full FT 有优势 | Specialized models 接近 |
| BTO | 全范围有优势 | Rank 8 LoRA 略优于 full FT |

![六个应用的 learning curves](/images/pet-mad/fig-s9.png)

上图为 LPS. 其余分别见 Figures S10-S13 与 S15. 结论不是 LoRA 永远优于 from scratch, 而是 pretraining 在 low-data regime 稳定降低 sample requirement, 其上限受 rank 与 domain shift 控制.

## Catastrophic forgetting 的实测

Supplementary Table II 报告 fine-tuned model 回到 MAD test set 的误差:

| LoRA target | Energy MAE | Force MAE |
| --- | ---: | ---: |
| LPS | 129.4 | 215.1 |
| GaAs | 78.8 | 134.5 |
| HEA25S | 91.1 | 228.9 |
| Water | 284.8 | 288.3 |
| BTO | 44.4 | 140.8 |
| Succinic acid | 144.4 | 191.1 |

Base PET-MAD 为 15.1/72.3. LoRA 虽比 full fine-tuning 更能保留 base capabilities, 仍发生明显退化, 尤其 water. "不损害 general task" 只能理解为保留某种定性能力, 不能理解为原精度不变.

## Rank 是 adaptation capacity

LoRA rank 8 对多数任务足够, water 在较大数据量时需要 rank 32. 这符合低秩更新的基本限制: domain shift 需要的 weight displacement 若不在小 rank subspace 内, 增加数据也无法突破 representation bottleneck.

## 公平比较注意事项

作者指出 fully fine-tuned models 可能因 epochs 较少而更快达到低误差. Bespoke 与 fine-tuned 的 optimization budgets 并非所有情形都严格 matched. 因而学习曲线主要证明实用初始化优势, 不是对所有 training recipes 的无偏算法排名.
