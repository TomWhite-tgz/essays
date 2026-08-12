---
title: Matbench 与材料发现
description: Matbench Discovery compliant 结果, relaxation 协议与训练成本主张.
---

# Matbench 与材料发现

## Compliant 评测协议

MatRIS-S, M, L 只使用 MPTrj 训练, 因而属于 Matbench Discovery compliant models. 评测对象是 WBM 的约 256k 个候选结构. Relaxation 使用 FIRE, 最多 500 steps, 或在最大力低于 $0.05\,\mathrm{eV/Å}$ 时停止.

主表中的关键结果如下:

| 模型 | 参数量 | F1 | Energy MAE | $R^2$ | $K_{\mathrm{SRME}}$ | RMSD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MatRIS-S | 4.3M | 0.811 | 0.036 | 0.803 | 0.730 | 0.0766 |
| MatRIS-M | 6.3M | 0.833 | 0.033 | 0.820 | 0.542 | 0.0742 |
| MatRIS-L | 10.4M | 0.847 | 0.031 | 0.829 | 0.489 | 0.0717 |
| eSEN | 6.5M | 0.831 | 0.033 | 0.821 | 0.340 | 0.0757 |
| EquiformerV2 | 31M | 0.815 | 0.036 | 0.813 | 0.535 | 0.0753 |

MatRIS-L 在 F1, energy MAE, $R^2$ 与 RMSD 上最好, 但 eSEN 的 $K_{\mathrm{SRME}}=0.340$ 明显优于 MatRIS-L 的 0.489. 所以准确说法是 MatRIS-L 在多数指标领先, 不是支配全部材料发现指标.

## F1 的实际含义

F1 综合 precision 与 recall. MatRIS-L 的 precision 为 0.829, recall 为 0.865. 它说明模型在给定 formation-energy stability threshold 下较好地区分稳定与不稳定候选. 它不直接度量 relaxation path, force smoothness 或有限温度相稳定性.

## 训练成本图

作者报告 MatRIS-S 相对 EquiformerV2 的训练成本低 13.0 倍, MatRIS-M 相对 eSEN 低 6.4 倍. 同图还显示 MatRIS-S 的 F1 比 Nequix 高约 8%.

这些比值来自报告或估计的 A100 GPU-days. Nequix 使用 JAX, 其余多为 PyTorch, baseline epochs 和实现优化也不统一. 图中没有重复训练的 error bars. 因而它支持 MatRIS 位于较好的 accuracy-cost 区域, 但不能精确归因为某一个 attention 算子.

## 一处单位错误

正文把 eSEN 与 EquiformerV2 的 energy errors 写成 0.033 和 0.036 `meV/atom`. 表格数值和 Matbench Discovery 的常用尺度表明这里应为 `eV/atom`. 若真是 meV, 数值会比同表其他模型小 1000 倍且与排序矛盾. 这是文本单位错误, 不是模型结果突变.

