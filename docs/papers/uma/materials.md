---
title: 材料与声子证据
description: WBM, HEA, Matbench Discovery, phonon, elasticity 与 NVE 的证据分层.
---

# 材料与声子证据

## 两种评测需要分开

主文 Table 2 的 WBM 与 HEA 使用 OMat task 做 held-out test. 主文 Table 4 的 Matbench Discovery, MDR phonon 与 elasticity 则先在 MPtrj 和 sAlex 上 fine-tune, 以对齐 public benchmark 的 DFT settings.

因此 Table 4 支持 adaptability 与 domain-aligned performance, 不是无 fine-tuning universal zero-shot.

## WBM 与 HEA

| Model | WBM E/F/S | HEA E/F/S |
| --- | --- | --- |
| UMA-S-1.1 | 20.2 / 62.8 / 4.4 | 24.9 / 83.7 / 3.5 |
| UMA-S-1.2 | 17.4 / 54.2 / 4.1 | **17.2** / 62.8 / 2.9 |
| UMA-M-1.1 | 18.2 / 50.7 / 4.2 | 21.9 / 69.0 / 3.5 |
| eSEN-30M-OMat | 16.2 / 49.6 / 4.1 | 20.0 / 59.5 / 3.2 |
| EquiformerV2-OMat | **14.9 / 46.3 / 3.6** | 20.3 / **47.0 / 2.7** |

Energy 为 meV/atom, force 为 meV/Å, stress 为 meV/Å$^3$. UMA-S-1.2 在 HEA energy 上最好, 但 EquiformerV2 的 HEA force/stress 与 WBM 全部指标更好. 因而 UMA 的 strongest claim 是 single multi-domain checkpoint 接近 specialized materials models, 不是材料静态误差全面 SOTA.

## HEA test 的独立性

HEA 是本文新建 test set, 包含 5000 多个最多 6 元素合金 relaxation trajectories. Structures 以 SQS 装饰 fcc, bcc 与 hcp lattices, DFT 沿用 OMat24 settings.

它对 composition disorder 有价值, 但由作者同时设计 test 与评估, 且仍在 OMat chemical/task domain 内. 它不等于跨 functional 或跨结构生成机制的 blind test.

## Matbench Discovery

Fine-tuned results 为:

| Model | F1 | RMSD | Formation-energy MAE |
| --- | ---: | ---: | ---: |
| UMA-S-1.1 | 0.913 | 0.064 | 0.020 eV/atom |
| UMA-S-1.2 | 0.921 | 0.062 | 0.019 eV/atom |
| UMA-M-1.1 | **0.929** | **0.061** | **0.018 eV/atom** |
| eSEN-30M-OAM | 0.925 | **0.061** | **0.018 eV/atom** |

UMA-M-1.1 的 F1 略高 0.004, RMSD 与 MAE 与 eSEN 并列. 这是很强但边际较小的榜单提升. 论文观察不同 UMA sizes 都接近, 所以继续扩大模型未必改善这个已趋饱和的 benchmark.

## Phonon 与 thermal conductivity proxy

| Model | $\kappa_{\mathrm{SRME}}$ | $\omega_{\max}$ MAE | Free-energy MAE |
| --- | ---: | ---: | ---: |
| UMA-S-1.1 | 0.204 | 18.82 K | 5.48 kJ/mol |
| UMA-S-1.2 | **0.129** | **10.55 K** | **3.24 kJ/mol** |
| UMA-M-1.1 | 0.176 | 14.81 K | 3.87 kJ/mol |
| eSEN-30M-OAM | 0.170 | 15.00 K | 4.00 kJ/mol |

S-1.2 反而优于更大的 M-1.1. 这与 1.2 的 end-to-end conservative FP32 training, 300 neighbors 和新增数据同时相关, 不能只解释为模型 size effect.

## Elasticity

UMA-M-1.1 的 shear/bulk modulus MAE 为 8.57/4.78 GPa, UMA-S-1.2 为 8.59/4.91 GPa, eSEN 为 9.13/5.73 GPa. 改善存在, 但所有 UMA rows 都经过相同 domain fine-tuning, 因而是 architecture plus training recipe 的联合结果.

## NVE 守恒

Table 4 只用 pass/fail 标出 conservative UMA-S/M 通过 NVE MD, 旧 UMA-L 未通过. 它验证基本运行行为, 但主表没有给 trajectory length, timestep, drift magnitude 与重复统计. 详细 protocol 依赖 eSEN 引用, 站内可结合 [eSEN 精读](/papers/esen/) 阅读.
