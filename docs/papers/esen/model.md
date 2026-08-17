---
title: eSEN 架构与训练策略
description: eSEN 的等变消息传递, edgewise convolution 和直接力预训练.
---

# eSEN 架构与训练策略

## 名称与总体结构

eSEN 是 equivariant Smooth Energy Network. 它是多层等变消息传递网络, 节点特征由多通道球谐表示组成. 每个 block 依次执行 edgewise convolution, 残差加归一化, nodewise feed-forward, 再次残差加归一化.

![eSEN 架构](/images/esen/architecture.png)

最终只取 $L=0$ 的旋转不变量通道预测逐原子能量, 再求和得到总能量:

$$
E=\sum_i E_i.
$$

力与应力由总能量反向传播获得. 因而最终模型没有独立 force head.

## Edgewise convolution

边更新先索引 source 与 target 节点的球谐特征并拼接, 对边方向进行对齐, 再执行两次 SO(2) convolution, 中间加入非线性. 边不变量 embedding 同时编码原子对与距离信息. 末端乘 envelope 后 scatter sum 回目标节点.

该模块继承 eSCN 的 SO(2) convolution, 但与 eSCN 相比有三项关键变化:

- 同时拼接 source 与 target embedding.
- 使用两层 SO(2) convolution 和中间非线性.
- 在边消息末端加入截断 envelope.

nodewise feed-forward 使用两层等变线性层和 SiLU gated nonlinearity. 与 eSCN 和 EquiformerV2 的 grid projection 不同, eSEN 始终在球谐系数空间进行节点非线性.

## 默认模型容量

| 模型 | Blocks | $L_{\max}$ | $M_{\max}$ | Channels | Cutoff |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3.2M ablation | 2 | 2 | 2 | 128 | 无机 6 Å, 有机 5 Å |
| 6.5M | 4 | 2 | 2 | 128 | 无机 6 Å, 有机 5 Å |
| 30M MP/OAM | 10 | 3 | 2 | 128 | 6 Å |

MPTrj 小模型默认使用 10 个 Gaussian radial basis. SPICE 模型使用 10 个 Bessel basis. 30M OMat/OAM 模型使用 64 个 Gaussian basis. 因而 "eSEN 使用 10 个 Gaussian basis" 只适用于论文的核心 MPTrj 消融配置, 不是全部 checkpoint 的统一设置.

## 直接力预训练, 保守微调

直接从能量对位置求导训练力, 需要穿过网络的额外反向传播, 成本较高. 作者没有完全放弃直接力训练, 而是把它限制在预训练阶段:

1. 用独立 direct-force head 训练 60 epochs.
2. 删除 direct-force head.
3. 改用 $-\nabla_{\bm r}E$ 的保守力继续微调 40 epochs.

![预训练与微调曲线](/images/esen/finetuning.png)

同样总计 100 epochs 时, 该策略的验证损失低于从头进行 100 epochs 保守训练, 墙钟训练时间降低 40%. 这里的逻辑很干净: 直接力作为便宜的表征学习信号, 而不是最终部署时的物理定义.

30M MPTrj 模型在直接力阶段还使用 DeNS: 噪声概率 0.5, Gaussian 位移标准差 0.1 Å, DeNS loss coefficient 为 10. OMat24 训练和保守微调阶段不使用 DeNS.

## 训练策略的边界

这不是证明任意 direct-force checkpoint 都能无损转换为保守势. 微调成功依赖 energy head, 表征容量, 数据覆盖与剩余训练预算. 论文展示的是 eSEN 配置下的经验结果. 另外, 40% 是该训练曲线的墙钟节省, 不能直接外推到不同硬件, batch size 或自动微分实现.

