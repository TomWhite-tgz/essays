---
title: 蒸馏与物理验证
description: 解读 DPA-2 teacher 到 DPA-1 student 的 concurrent-learning distillation 与 3 类应用验证.
---

# 8. 蒸馏与物理验证

Fine-tuned DPA-2 证明 transfer, 但其约 515 万参数和 attention layers 使长时间大体系 MD 成本较高. Figure 4 与 Table S4 检验能否把目标域能力蒸馏到约 53 万参数的 DPA-1 student.

## 蒸馏不是普通固定数据拟合

Teacher-student loop 与 DP-GEN 类似:

1. 用少量下游 DFT labels 微调 DPA-2 teacher.
2. Teacher 在目标温度, 压力和 composition 条件下探索 MD.
3. Teacher 为采样构型生成 energy 与 force labels.
4. Student 在这些 labels 上训练.
5. 用 teacher-student deviation 找出 student 尚未掌握的构型并追加.

因此, 论文所说 teacher 只看过 $0.25\%$ 到 $7.86\%$ 下游 DFT data, 不表示 student 总共只训练在这点构型上. Teacher 会额外生成大量 pseudo-labeled configurations. 节省的是昂贵 DFT labels, 不是所有训练样本.

## Table S4: Teacher, student 与 full-data DPA-1

Energy 和 force RMSE 单位分别为 $\mathrm{meV/atom}$ 与 $\mathrm{meV/\text{\AA}}$:

| 下游任务 | DFT data used | Teacher $\Delta E/\Delta F$ | Student $\Delta E/\Delta F$ | Full-data DPA-1 $\Delta E/\Delta F$ |
| --- | ---: | ---: | ---: | ---: |
| H2O-PBE0TS-MD | $0.25\%$ | 0.3 / 30.0 | 0.4 / 41.7 | 0.4 / 37.7 |
| SSE-PBE-D | $1.01\%$ | 1.3 / 72.0 | 3.3 / 101.0 | 1.9 / 96.7 |
| FerroEle-D | $7.86\%$ | 1.6 / 44.7 | 2.5 / 99.6 | 1.9 / 105.7 |

Student force error 高于 teacher, 但接近 full-data DPA-1 的 architecture ceiling. SSE-PBE-D student energy 3.3 明显高于 full-data model 的 1.9, 所以 "on par" 更适合描述数量级和 force performance, 不代表每项数值相同.

FerroEle case 还把完整 FerroEle-P 加入 teacher fine-tuning, 不能只用 $7.86\%$ FerroEle-D 描述 teacher 看过的全部 labeled information.

## Figure 4(a-b): Water structure

H2O-PBE0TS-MD student 的 radial distribution function (RDF) 与 angular distribution function (ADF) 接近 reference AIMD. 这比 test-set force RMSE 更接近液态结构统计, 能检查势在轨迹分布上的累积行为.

但 RDF/ADF 是低阶平衡结构统计. 它们不能单独验证 diffusion, vibrational spectrum, dielectric response 或 rare-event kinetics.

## Figure 4(c): 固态电解质扩散

作者用 distilled SSE model 计算 $\mathrm{Li}_{10}\mathrm{SnP}_2\mathrm{S}_{12}$ 在多个温度下的 Li diffusion constants, 并与此前 DPMD, AIMD 和 solid-state NMR experiment 对照.

Student 与此前 PBE-based simulations 较一致, 与 experiment 仍有差距. 论文把差异归因于 density-functional approximation 与 finite-size effects 的可能影响. 这项证据说明 distillation 没有破坏 source computational protocol 的扩散趋势, 不是对实验扩散率的精确复现.

## Figure 4(d-e): 铁电相变

对两种 PIN-PMN-PT composition, NPT MD 中 tetragonal-cubic transition 分别约在 250 K 与 300 K. PIN fraction 从 $29\%$ 增到 $36\%$ 时 transition temperature 提高约 50 K, 与实验趋势一致.

相变位置来自 lattice constants 随温度的变化. 这是比独立 test frames 更强的 collective observable, 但只覆盖两个 composition, 且论文主要强调趋势而非完整 phase diagram 和不确定度.

## Figure 4(f): 效率与规模

蒸馏后 time-to-solution 和单 GPU 可模拟最大 system size 改善接近两个数量级. 这来自 student 去除 attention 并使用可进一步压缩的 DPA-1 architecture.

图证明 pipeline 的部署逻辑: 大 model 用于 representation transfer 和 teacher labeling, 小 model 用于 production MD. 它不说明所有下游任务都必须蒸馏, 如果体系较小或需要 teacher 的更高 accuracy, 直接使用 DPA-2 仍可能合理.

## Teacher error 会被继承

Student labels 来自 teacher:

$$
(E^{\mathrm{student}},\boldsymbol{F}^{\mathrm{student}})
\approx
(E^{\mathrm{teacher}},\boldsymbol{F}^{\mathrm{teacher}}).
$$

Teacher 对 DFT 或真实实验的 systematic bias 不会因蒸馏自动消失. Teacher-student deviation 也只衡量 student 是否模仿 teacher, 不能发现二者共同错误. 少量 original DFT test set 与 application observables 因此仍然必要.

## 本章结论

DPA-2 把预训练能力与 MD 部署效率解耦. Table S4 表明少量 DFT 微调得到的 teacher 可以生成足够的 target-domain labels, 让轻量 student 接近 full-data DPA-1. Figure 4 又用水结构, Li diffusion 和铁电相变检验轨迹级行为. 证据有代表性但范围有限, 并且蒸馏保存的是 teacher 定义的势能面, 不是对其物理误差的修正.
