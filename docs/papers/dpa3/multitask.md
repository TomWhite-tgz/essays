---
title: Dataset encoding 与 fine-tuning
description: 统一 fitting network 如何替代 per-task heads, 以及参数规模主张的边界.
---

# Dataset encoding 与 fine-tuning

## 条件化原子能

DPA3 对第 $m$ 个数据集预测:

$$
E_i=\mathcal F\left(v_i^{(1,L)},c(\mathcal D_m)\right)+e_m(Z_i).
$$

$c(\mathcal D_m)$ 通常是 dataset one-hot, $e_m(Z_i)$ 是按 chemical composition 做 least-squares 拟合的 element bias. 前者告诉统一 fitting network 当前要逼近哪套 DFT protocol, 后者吸收不同计算的任意能量零点.

与 DPA-2 的 per-dataset heads 相比, 主体差别是:

$$
\begin{aligned}
\text{DPA-2: }&v_i\longrightarrow\mathcal F_m(v_i),\\
\text{DPA3: }&(v_i,c_m)\longrightarrow\mathcal F(v_i,c_m).
\end{aligned}
$$

## Supplementary Table S-11

作者用相同 16-layer architecture, 1M steps 和 8 GPUs 比较两种 multi-task mode:

| Mode | E | F | V | Params |
| --- | ---: | ---: | ---: | ---: |
| Dataset encoding | 11.4 | 205.8 | 131.9 | 3.26M |
| Separate fitting networks | 11.6 | 211.0 | **127.9** | 7.69M |

Energy/virial 单位为 meV/atom, force 为 meV/Å. Encoding 的 energy 与 force 略低, virial 略高, 参数减少约 58%. 没有独立重复或不确定性, 所以更稳妥的结论是 comparable accuracy with much lower parameter count, 而不是 encoding 在精度上显著更优.

表中还列出 full-budget DPA-3.1-3M 的 6.6/130.6/98.1, 但它使用 4M steps 与 128 GPUs, 不能与两个 1M-step rows 直接归因比较.

## 参数是否真的与任务数无关

论文多处称 model complexity independent of the number of datasets. 按 Equation 3 的通常 one-hot 实现, 这在严格意义上不成立:

- One-hot 维度随数据集数 $M$ 增长.
- 若直接送入第一层 MLP, 相应权重至少增加 $O(Md)$.
- Element bias $e_m(Z)$ 也按 dataset 与 element 存储.

真正被证据支持的是, 参数开销远小于复制完整 fitting head. 若实现先把 dataset ID 映射到固定维 embedding, 主干输入宽度可以固定, 但 embedding table 仍随 $M$ 增长. 因此应称 sublinear in head size 或 parameter-efficient, 不应称严格 constant.

## Encoding 也是 fidelity selector

同一结构在不同 encoding 下可得到不同能量, 力和 virial. 这使 DPA-3.1-3M 更接近共享 backbone 的 multi-fidelity family, 而不是单一无条件 universal PES.

部署时必须回答两个问题:

1. 下游目标最接近哪个 dataset encoding.
2. 若目标 DFT protocol 未见过, 应选择相近 encoding, 混合 encoding, 还是先 fine-tune.

论文在 zero-shot 测试中选择 OMat24 encoding, 说明 encoding selection 本身就是推理 protocol 的一部分.

## Fine-tuning 到材料任务

DPA-3.1-3M-FT 将 OMat24 encoding 在 MPtrj 与 sAlex 上继续训练. Supplementary Table S-7 中:

- RMSE 为 0.067, 与最佳值并列.
- $R^2=0.869$, 为表中最高.
- F1 为 0.884, 低于 eSEN, Orb-v3 与 SevenNet.
- CPS 为 0.802, 低于 eSEN 的 0.888 与 Orb-v3 的 0.861.

它支持小模型经过 domain alignment 后能取得强 energy regression, 不支持它在 Matbench 全部 discovery metrics 上最佳.

## Fine-tuning 到 SPICE

Supplementary Table S-8 使用 SPICE2 encoding 做 fine-tuning:

| Model | Params | Energy LWAMAE | Force LWAMAE |
| --- | ---: | ---: | ---: |
| DPA3-L12 task-specific | 2.5M | 0.36 | 8.74 |
| DPA3-L24 task-specific | 4.9M | **0.22** | **5.78** |
| Fine-tuned DPA-3.1-3M | 3.3M | 0.35 | 9.60 |

Fine-tuned LAM 接近 L12, 但没有超过 fully trained L24. 作者指出 DPA-3.1-3M 在 SPICE2 上有效预训练约 60 epochs, 而 task-specific variants 约 400 epochs. 这是一项计算量与领域暴露不相等的比较, 适合说明可适配性, 不适合隔离 pretraining benefit.
