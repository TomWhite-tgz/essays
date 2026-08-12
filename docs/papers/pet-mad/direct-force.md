---
title: Direct force 失效与 MTS 修复
description: BMIM-Cl 中非保守力的温度漂移, equipartition 破坏与多时间步校正.
---

# Direct force 失效与 MTS 修复

## 三种模拟

作者在 500 K molten BMIM-Cl 比较:

1. Conservative forces, 每步由 PET-MAD energy gradient 计算.
2. Direct-force head, 约快 2 倍.
3. Multiple-time-step (MTS), direct force 每步运行, conservative force 每 8 步校正, 约快 1.8 倍.

## NVE 中的灾难性漂移

![Direct force 的温度失效](/images/pet-mad/fig-s16.png)

0.5 fs Velocity-Verlet NVE 中, conservative trajectory 围绕初始温度波动. Direct-force trajectory 的 kinetic energy 快速指数漂移, 最终 molecular dissociation. MTS 与 conservative result 一致.

Direct head 即使单点 force error 较低, 仍一般不满足闭合路径做功为 0. 每步的小 non-conservative work 会同号累积, 不能仅靠缩小 timestep 消除.

## Thermostat 可以掩盖总温度, 不能修复动力学

使用 relaxation time 10 fs 的 stochastic velocity rescaling 后, direct-force simulation 的 global temperature 看似维持 500 K. 分 species 检查却发现 Cl steady-state temperature 超过 2000 K, H 与其他 atoms 低于平均值.

这说明 thermostat 只控制总体 kinetic energy, 非保守力持续驱动不同 degrees of freedom, 破坏 equipartition. 只画 global temperature 会产生假安全感.

## Structure 与 diffusion 也错

![Direct force 对结构与扩散的影响](/images/pet-mad/fig-s17.png)

Direct-force trajectory 产生过快 Cl diffusion 和不物理 Cl dimer association. Cl-Cl pair correlation 与 MSD 均偏离 conservative simulation. MTS 两项都落在 conservative statistical uncertainty 内.

## MTS 为什么有效

可把 direct force 写作 cheap approximation $\bm F_d$, conservative force 为 $\bm F_c$. MTS 高频使用 $\bm F_d$, 低频施加 correction $\bm F_c-\bm F_d$. 只要 correction 随时间变化较慢且 outer timestep 不触发 resonance, 可恢复正确 slow dynamics.

但每 8 步是本文 BMIM-Cl 的实证配置, 不是通用安全常数. 不同体系的 fastest modes, direct-head error spectrum 与 thermostat 会改变稳定 outer step. 部署前仍需 NVE drift, species temperatures 和 observables 验证.

## 与 eSEN 结论的关系

eSEN 使用 direct-force pretraining 再 conservative fine-tuning. PET-MAD 保留 direct head 并用 conservative correction 做 MTS. 两者共同结论是: direct force 可用于训练或多尺度加速, 但不能未经物理校验就等价替代 energy-gradient force.
