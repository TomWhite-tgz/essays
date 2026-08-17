---
title: 从静态误差到物性要求
description: eSEN 论文的问题定义, 四类工作流与测试指标之间的缺口.
---

# 从静态误差到物性要求

## MLIP 究竟近似什么

在 Born-Oppenheimer 近似下, 给定原子位置 $\bm r$, 原子序数 $\bm a$ 和周期晶格 $\bm l$, DFT 定义势能面

$$
E(\bm r,\bm a,\bm l).
$$

原子力为 $\bm F=-\nabla_{\bm r}E$, 应力可理解为能量对晶格形变的导数. 因而一个 energy-based MLIP 并不是分别拟合三个无关标签, 而是在近似同一个标量场及其导数.

常规测试集报告 energy, force, stress 的 MAE 或 RMSE. 这些数值很重要, 但只证明模型在抽样点附近的一部分局部行为. 下游工作流提出的要求更强.

## 四类任务分别探测 PES 的什么

| 任务 | 实际操作 | 对 PES 的要求 |
| --- | --- | --- |
| 结构弛豫 | 迭代沿力移动至局部极小值 | 一阶导数方向正确, 迭代路径稳定 |
| NVE 分子动力学 | 数千至数百万次积分 | 力保守, 导数连续有界, 数值误差不累积 |
| 谐性声子 | 有限差分获得 force constants | 极小值附近二阶导数准确 |
| 热导率 | 二阶和三阶 force constants 加输运方程 | 谐性与非谐性曲率均可靠 |

论文正文说 "four critical property prediction tasks", 实际列出的标题是 geometry optimization, MD simulations, phonon and thermal conductivity calculations. 最后一项包含两个层级, 因而可按四项能力理解.

## 为什么 test MAE 可能失灵

设真实能量为 $E$ 而模型为 $\widehat E$. 小的离散点误差

$$
\left|\widehat E(\bm r_k)-E(\bm r_k)\right|
$$

并不控制点与点之间的振荡. 即使同时约束一阶导数, 也未必控制 Hessian 或三阶导数. 典型反例可以写成

$$
\widehat E(x)=E(x)+\varepsilon\sin(\omega x).
$$

能量扰动幅度只有 $\varepsilon$, 但其一阶, 二阶和三阶导数误差分别按 $\varepsilon\omega$, $\varepsilon\omega^2$ 和 $\varepsilon\omega^3$ 放大. 当 $\omega$ 很大时, 很小的 energy MAE 可以与很差的高阶性质共存.

直接力模型还有另一种缺口. 它分别预测 $\widehat E$ 与 $\widehat{\bm F}$, 一般不满足

$$
\widehat{\bm F}=-\nabla_{\bm r}\widehat E.
$$

此时不存在一个同时解释能量和全部力的标量 PES. 静态 force MAE 仍可很低, 但闭合路径做功, 声学支和长时轨迹可能出现系统性问题.

## 作者提出的中间测试

直接为每次模型迭代运行全套热导率和万材料声子基准成本很高. 作者因此提出一个便宜一些的筛选门槛:

1. 选用训练分布之外的体系.
2. 先弛豫并按目标温度初始化速度.
3. 固定 Velocity-Verlet, 时间步长和总时长.
4. 在 NVE 系综运行 100 ps.
5. 测量总能量漂移.

无机任务用 MPTrj 训练模型, 在 TM23 的 27 种含单空位过渡金属体系和 3 个温区上测试, 共 81 条轨迹, 步长 5 fs. 有机任务用 SPICE-MACE-OFF 训练模型, 在 MD22 的 7 个大分子上测试, 步长 1 fs. 这些体系在尺度或缺陷类型上相对训练集是 OOD.

## 这个测试能说明什么

通过测试至少同时排除了两类明显风险: 非保守直接力, 以及在所测时空尺度上导致积分失稳的粗糙 PES. 论文的经验发现是, 通过后 test energy MAE 与物性指标的相关性更强.

但逻辑方向不能反过来. 一条 100 ps 轨迹没有漂移, 不代表任意温度, 相, 缺陷, 步长或百万步模拟都安全. 这是一项压力测试, 不是数学完备性证明.

