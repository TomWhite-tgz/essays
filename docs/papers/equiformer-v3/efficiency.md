---
title: 软件优化与成本
description: 审计 EquiformerV3 的 operation fusion, compilation 与 speedup 口径.
---

# 软件优化与成本

## 重复操作从哪里来

EquiformerV2 对同一 edge feature 的多个 branches 分别执行 coefficient permutation, Wigner-$D$ rotation 与 SO(2) projection. V3 将能够共享的输入先 concatenate, 只做一次 permutation 和 rotation, 再用具有 extra $m=0$ outputs 的 SO(2) linear 同时产生 logits 所需 scalars 与 value features.

代码中的 `SO2Linear` 对 $m=0$ 使用一个 dense linear, 对 $m>0$ 逐 order 处理 real 与 imaginary pairs. 实现还把每个 $m$ 内部的多次 `torch.cat` 延后为统一 concatenate, 减少 kernel launches 与 temporary tensors.

## Compilation

原实现中按 degree 或 order 的 Python loops, dynamic lists 与多层对象包装会形成 graph breaks. V3 将 shape-dependent index 预计算为 buffers, 合并 branches, 并在训练器提供 `use_compile` 开关. 但公开的大型 OMat24 gradient config 实际写 `use_compile: false`; 因而 compile capability 与所有报告训练 run 都启用 compile 不是同一个命题.

## 两个 speedup 口径

OC20 Table 1 给出最干净的实现级对比:

| 设置 | Energy MAE (meV) | Force MAE (meV/A) | Params | H100 GPU-hours |
| --- | ---: | ---: | ---: | ---: |
| V2 + total energy | 242 | 19.73 | 54M | 270 |
| + better implementation | 242 | 19.73 | 54M | 154 |

因此 $270/154=1.75$. Accuracy 与 parameter count 不变, 可以合理归因于 implementation.

论文的 $5.9\times$ 则比较 V3 的 171 GPU-hours 与一个更深且训练更久的 V2 setting:

$$
\dfrac{270}{171}\times 1.5\times 2.5\approx 5.9.
$$

这里的后两个因子分别来自 block count 与 epochs. 它衡量达到相近 force MAE 的 training efficiency, 不是同 workload 的 kernel speed.

## 算力账单

- OC20 base ablation: 8 H100, 最终配置 171 GPU-hours.
- OMat24 $L_{\max}=4$: direct pre-training 2188, gradient fine-tuning 2594 H100 GPU-hours.
- OMat24 $L_{\max}=6$: 对应 3320 与 5877 H100 GPU-hours.
- Matbench MPtrj-only: direct 599, gradient 471 H100 GPU-hours.
- OMat24 到 MPtrj+sAlex fine-tuning: 892 H100 GPU-hours, 总 pipeline 在结果表中约 5.7k GPU-hours.

所以 faster 不等于 cheap. V3 改善了单位结果的效率, 但完整主结果仍是多节点 H100 规模实验.
