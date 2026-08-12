---
title: 催化与 AdsorbML
description: OC20 total-energy formulation, adsorption-energy 误差与 global-minimum success rate.
---

# 催化与 AdsorbML

## 为什么 total energy 改变 benchmark

OC20 的许多旧模型直接预测 adsorption energy. UMA 预测 total energy, 再计算:

$$
E_{\mathrm{ads}}
=E_{\mathrm{surface+adsorbate}}
-E_{\text{clean surface}}
-E_{\text{isolated adsorbate}}.
$$

训练数据因此额外包含 14M clean surfaces. Total-energy difference 能表示 surface reconstruction 前后的能量变化, 但也让它与旧 direct adsorption-energy models 的 target parameterization 不完全相同.

## OC20 held-out test

| Model | ID adsorption E / F | OOD-Both adsorption E / F |
| --- | --- | --- |
| UMA-S-1.1 | 51.5 / 24.1 | 68.8 / 30.7 |
| UMA-S-1.2 | 47.9 / 21.6 | 64.5 / 27.6 |
| UMA-M-1.1 | **31.8** / 15.5 | **45.5** / 20.2 |
| EquiformerV2-OC20 | 149.1 / **11.6** | 306.5 / **15.7** |

Energy 与 force 单位均为 meV, force 实际为 meV/Å. UMA-M-1.1 将 adsorption-energy MAE 降约 79% 和 85%, 符合正文 around 80% 的表述. 但 EquiformerV2 force MAE 仍更低.

这说明 total-energy consistency 显著改善 energy difference, 不代表每原子 force 同时全面改善.

## AdsorbML

AdsorbML 不只测固定结构误差, 而是用 ML relaxation 搜索 global-minimum adsorption energy. 主文 Table 4 的 success rates 为:

| Model | Success rate |
| --- | ---: |
| UMA-S-1.1 | 66.80% |
| UMA-S-1.2 | 66.19% |
| UMA-M-1.1 | **72.25%** |
| EquiformerV2-OC20 | 60.80% |
| GemNet-OC20 | 54.88% |

相对 EquiformerV2, UMA-M-1.1 提升 11.45 percentage points, 即约 18.8% relative. 正文仍称 UMA-L 有 25% improvement, 但最终 v2 active table 已注释掉 UMA-L 74.41% row. 即使使用 74.41%, 相对提升也约 22.4%, 25% 是较粗的四舍五入.

## 修改后的 ML-only protocol

原 AdsorbML pipeline 会对 ML 找到的 minimum 做一次 DFT confirmation. Appendix 提出无需 DFT 的变体, 要求 ML-predicted minimum energy 位于 DFT minimum 的 $\pm0.1$ eV 内. 下界防止模型仅通过预测过低能量而被误判成功.

主文表格 caption 没有在列名中明确区分 original 与 modified protocol. 部署或与外部 leaderboard 比较前, 必须核对具体 reducer 与是否包含 DFT single point.

## OOD 的含义

UMA 在 OC20++ 上训练, 所以 OC20 OOD-Both 是 adsorbate 与 catalyst composition split 的分布外, 不是离开 catalysis task 或 RPBE reference 的跨领域 zero-shot. AdsorbML 更接近实际搜索流程, 但仍与 OC20 training domain 紧密相关.

## 最稳妥的结论

UMA 对 catalysis 的最强证据是 total-energy model 在 adsorption energy 和 relaxation-based global minimum search 上明显强于所列 specialized baselines. Force accuracy 与真正跨 catalytic chemistry/domain 的泛化仍未同步达到同样优势.
