---
title: 现有 MLIP 的三类失效模式
description: 势能面 softening, 长程相互作用缺失和分子动力学不稳定.
---

# 现有 MLIP 的三类失效模式

## Figure 1 的证据拼图

![现有 MLIP 的三类失效模式](/images/fm-atomistic/failure-modes.png)

Figure 1 并非本文新实验, 而是从三项已有研究拼接出的诊断图. 它用三类失败说明 "universal" 不能只由结构弛豫 benchmark 定义.

## 失效 1: 高能构型上的 PES softening

Figure 1a 在 WBM structures 产生的 1000 个 high-energy configurations 上比较

$$
s=\dfrac{f_{\mathrm{MLIP}}}{f_{\mathrm{DFT}}}.
$$

若 $s<1$, 模型预测力相对 DFT 偏软. 作者引用的 benchmark 观察到 universal MLIP 在高能区系统性低估 PES 和力. 结构弛豫主要从相对温和区域向局部极小值移动, 因而可取得好成绩; MD, collision 与 rare-event sampling 会访问更高能区, softening 就成为关键风险.

这里的因果解释是 distribution shift: 许多材料数据以 relaxation trajectories 为主, 强烈偏向 minima 附近. 扩大同类 equilibrium-like 数据量未必修复高能区, 需要主动加入 rattling, Boltzmann sampling, MD, defects 和 reaction paths.

## 失效 2: 有限 cutoff 看不见分离电荷

Figure 1b-d 考察两个带电分子相距超过 cutoff 的情形. 对纯短程 GNN, 两个分子属于互不连通的 graphs. 增加 message-passing layers 也无法在不存在 edge 的组件之间传播信息.

真实静电相互作用在远距离仍随 $1/r$ 衰减. 局域模型却给出严格的零交互或错误饱和. 这会影响:

- Dilute ionic solutions 与 Debye-Hückel screening.
- Solid-liquid 与 solid-solid interfaces.
- Dielectric response 与 charged defects.
- Applied potential 和不同 charge states.

修复方式需要显式 long-range channel, learned charges, reciprocal-space method, global interaction 或其他超越硬 cutoff 的机制. 单纯扩大局域训练集不能让 disconnected graph 交换信息.

## 失效 3: 小时间步也可能爆炸

Figure 1e 示意 MLIP MD instability. 通常减小 $\Delta t$ 可降低积分误差. 如果轨迹进入训练数据完全未覆盖的区域, 模型可能产生非物理深井或巨大力, 再小的常规步长也只会推迟而非消除失败.

这与上一篇 eSEN 讨论的 rough PES 有重叠, 但 Perspective 强调更广的成因:

- Data insufficiency 导致未知短距离区外推.
- Direct-force field 非保守, 持续注入或移除能量.
- Graph cutoff, neighbor changes 或 representation discretization 造成不光滑.
- 数值精度与高阶自动微分不稳定.

## 三类失败如何对应 FM 判据

| 失败 | 常规静态 benchmark 是否容易看见 | 应增加的测试 |
| --- | --- | --- |
| High-energy softening | 不容易 | Force-scale curves, OOD high-energy sets, rare-event paths |
| Missing long range | 只在专门构造集上可见 | Separation scans, charge/spin-conditioned tasks, interfaces |
| MD instability | 单点 MAE 不足 | NVE drift, NVT dynamics, long-horizon failure rate |

这些图不能证明所有现有模型都会失败. 它们证明的是, 单一材料弛豫榜无法排除这些 failure modes, 因而不足以证明 foundation capacity.

