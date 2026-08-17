---
title: OC20, OMat24 与 Matbench
description: 重建 EquiformerV3 的主要实验表并审计比较口径.
---

# OC20, OMat24 与 Matbench

## OC20 sequential ablation

| Index | Method | Energy (meV) | Force (meV/A) | Params | H100 GPU-hours |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | EquiformerV2 baseline | 296 | 21.23 | 54M | 270 |
| 2 | + total energy target | 242 | 19.73 | 54M | 270 |
| 3 | + better implementation | 242 | 19.73 | 54M | 154 |
| 4 | + merged LN | 236 | 19.28 | 54M | 150 |
| 5 | + wider FFN | 209 | 18.96 | 66M | 163 |
| 6 | + smooth cutoff | 213 | 18.82 | 66M | 163 |
| 7 | + SwiGLU-$S^2$ | 201 | 18.15 | 91M | 171 |

从 Index 2 到 7, energy 改善 41 meV, force 改善 1.58 meV/A, 时间缩短 $1.58\times$. 但 Index 1 到 2 的最大单步 energy gain 来自 target definition, 不是 V3 architecture.

## OMat24 validation

| Model | Prediction | Energy (meV/atom) | Force (meV/A) | Stress (meV/A3) | Params |
| --- | --- | ---: | ---: | ---: | ---: |
| EquiformerV2-L | Direct | 9.6 | 43.1 | 2.3 | 154M |
| UMA-L | Direct | 9.7 | 43.5 | 2.5 | 700M |
| EquiformerV3 $L_{\max}=4$ | Direct | 10.5 | 45.7 | 2.7 | 34M |
| EquiformerV3 $L_{\max}=4$ + grad FT | Gradient | 10.4 | 43.5 | 2.6 | 30M |
| EquiformerV3 $L_{\max}=6$ | Direct | 9.8 | 43.1 | 2.6 | 57M |
| EquiformerV3 $L_{\max}=6$ + grad FT | Gradient | 10.1 | 41.6 | 2.5 | 49M |

$L_{\max}=4$ gradient model 用约 $1/5$ parameters 达到 V2-L 相近 force MAE, 用约 $1/23$ parameters 达到 UMA-L 相近 force MAE. 这里比较了 Gradient 与 Direct rows, 且 normalization 不同, 所以 parameter-efficiency 结论对 force 最可信, 不宜扩展为所有 labels 完全等价.

## Matbench Discovery

MPtrj-only setting 中, V3 得到 F1 0.863, RMSD 0.070, $\kappa_{\mathrm{SRME}}$ 0.275, CPS 0.830. 对照 EquiformerV2 为 0.815, 0.076, 1.676, 0.522; eSEN-30M-MP 为 0.831, 0.075, 0.340, 0.797.

完整 OMat24 pre-training 加 MPtrj+sAlex fine-tuning setting:

| Model | F1 | RMSD | $\kappa_{\mathrm{SRME}}$ | CPS | GPU-hours |
| --- | ---: | ---: | ---: | ---: | ---: |
| eSEN-30M-OAM | 0.925 | 0.061 | 0.170 | 0.888 | - |
| UMA-M-1.1 | 0.929 | 0.061 | 0.176 | 0.889 | $>129$k, H200 |
| NequIP-OAM-XL | 0.906 | 0.063 | 0.125 | 0.886 | - |
| PET-OAM-XL | 0.924 | 0.060 | 0.119 | 0.898 | 20.5k |
| EquiformerV3 | 0.931 | 0.059 | 0.118 | 0.902 | 5.7k |

V3 是表中首个 CPS 高于 0.9 的 model. 但 UMA 时间来自 H200, V3 来自 H100; $22.6\times$ 是 GPU-hours ratio, 不是严格 hardware-normalized FLOPs 或 wall-clock speedup.

## 证据最强与最弱处

最强证据是 OC20 同配置 implementation ablation 和 Matbench 同一公开 benchmark 的多指标结果. 较弱之处是缺少 seeds 与 error bars, OMat24 comparisons 混合 prediction modes, smoothness 没有 isolation study, 以及一些 baselines 没有统一公开 training cost.
