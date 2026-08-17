---
title: Scaling law 与架构消融
description: OMat24 IsoFLOP 前沿, 拟合指数, SiLUT 与 residual update 的证据边界.
---

# Scaling law 与架构消融

## v3 实际使用的 scaling protocol

v3 在 OMat24 上采用类似 Chinchilla 与 UMA 的 IsoFLOP 方法. 计算量近似为:

$$
C=P\,N\,D,
$$

其中 $N$ 是参数量, $D$ 是单 epoch 内见过的 configurations 数, $P$ 是未求出的常数 prefactor. 作者设置 6 档固定 compute budget, 每档训练不同模型大小, 再用抛物线拟合 validation MAE 对 $N$ 的曲线. 每条曲线的最小值给出 $N_{\mathrm{opt}}(C)$ 与对应 $D_{\mathrm{opt}}$.

![DPA3 scaling law](/images/dpa3/fig4.png)

图中最优前沿的幂律拟合为:

$$
\begin{aligned}
\operatorname{MAE}(N_{\mathrm{opt}})
&=\left(\dfrac{N_{\mathrm{opt}}}{1.4\times10^9}\right)^{-0.4465},\\
\operatorname{MAE}(D_{\mathrm{opt}})
&=\left(\dfrac{D_{\mathrm{opt}}}{2.9\times10^{12}}\right)^{-0.2296},\\
\operatorname{MAE}(C)
&=\left(\dfrac{C}{2.9\times10^{21}P}\right)^{-0.1545}.
\end{aligned}
$$

这里的巨大 normalization constant 只是幂律截距的重参数化, 不是实验真的训练到十亿参数或万亿构型. 实际图示 $N_{\mathrm{opt}}$ 约为 1M-3M, $D_{\mathrm{opt}}$ 约为 3M-20M.

## 这组证据证明什么

在已测试区间内, 计算最优配置随预算增大而选择更大模型和更多数据, validation energy MAE 平滑下降. 这比单独固定 steps 后增加模型更接近 compute-aware scaling.

## 它尚不能证明什么

- 图中只有约 5-6 个 optimal points, 原文未给误差条, 独立重复或拟合置信区间.
- 论文没有在 active v3 text 报告 $R^2$ 或外推检验.
- 目标是 OMat24 validation energy MAE, 不是 force, virial, MD stability 或 12-task zero-shot aggregate.
- 单 epoch regime 将 $D$ 与 steps 绑定, 没有回答重复遍历数据后的 scaling.
- 参数范围仍处于百万级, 标题中的 large 指任务范围与预训练范式, 不是模型已扩至 LLM 式规模.

因此最稳妥的说法是 observed power-law scaling, 而不是已建立普遍且可长期外推的 scaling law.

## 为什么深层模型没有立刻失败

Supplementary Figure S-3 比较 4 种结构, 全部在 MPtrj 上用 8 GPUs 训练 1M steps, 在 WBM 测 energy MAE.

![DPA3 架构消融](/images/dpa3/fig-s3.png)

结论可拆成两部分:

1. Res 加 SiLUT 始终最好. 把 trainable residual step 换成普通 Add 后, 曲线仍下降但整体误差更高.
2. Add 加 SiLU 在超过约 2M 参数, 即 9 层后发生 numerical failure. LayerNorm 加 SiLU 可训练, 但约 1.3M 参数后误差不再改善, 甚至上升.

这支持 SiLUT 主要解决稳定性, trainable residual step 主要改善精度. 但消融只使用一个训练数据与固定预算, 无法独立断言同一机制在所有 domain 都必要.

## SiLUT 的定义

Supplementary Equation S1 为:

$$
\operatorname{SiLUT}(x)=
\begin{cases}
\operatorname{SiLU}(x),&x\leqslant t,\\
\tanh\left(a(x-t)\right)+b,&x>t.
\end{cases}
$$

$a,b$ 按 threshold $t$ 选择, 使拼接处具有一阶与二阶连续性. 它保留 SiLU 在常见输入范围内的形状, 又让大正值端有界. DPA-3.1-3M 使用 $t=3$, task-specific 首轮多用 $t=10$, 第二轮多用 $t=5$.

## Scaling 与最终 LAM 之间的缺口

OMat24 scaling experiment 与 OpenLAM-v1 预训练不是同一个实验. Figure 4 说明 DPA3 architecture 在单一大材料数据集上的 scaling 行为, Figure 5 才说明一个固定 3.26M checkpoint 在异构多任务预训练后的 zero-shot 结果. 论文没有展示 OpenLAM-v1 中模型, 数据与 compute 同时扩张的完整曲线.
