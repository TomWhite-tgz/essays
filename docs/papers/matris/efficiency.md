---
title: 效率, 消融与额外任务
description: 推理吞吐, 累积消融, LAMBench, zeolite, DPA2 tasks 与 NVE 稳定性.
---

# 效率, 消融与额外任务

## 推理与 relaxation

![推理速度与 relaxation Pareto 图](/images/matris/efficiency.png)

在 100, 200, 500, 1000 atoms 的推理测试中, MatRIS 慢于 MACE, 快于 EquiformerV2 与 eSEN. 500 个 WBM structures 的 relaxation 图中, MatRIS-M 约为 0.52 samples/s 与 33 meV/atom, MatRIS-S 约为 0.68 samples/s 与 36 meV/atom. eSEN 约为 0.30 samples/s 与 33 meV/atom, MACE 约为 1.3 samples/s 与 57 meV/atom.

作者明确排除 graph construction, 且没有使用 `torch.compile` 或 optimized kernels. 排除构图尤其重要, 因为 line graph 正是 MatRIS 相对二体模型的额外成本. 该实验公平比较 neural forward, 但不是端到端 molecular simulation latency.

## 两组消融都是累积删除

Module ablation 从完整模型 28.0 meV/atom 开始, 依次替换 dimension-wise softmax 得 28.4, 再移除 separable attention 得 29.1, 再改为 fixed envelope 得 31.3. Training ablation 从另一完整模型 27.2 开始, 依次移除 denoising 得 28.0, magnetic moment 得 29.7, graph-level loss 得 30.2.

每行都继承上一行已经删除的模块, 所以差值不是独立 marginal effect. 两个 full baselines 还相差 0.8 meV/atom, 表明设置或随机性不同, 但正文没有解释. 结论应限于整套设计有效, 不能据此给每个模块作严格因果排序.

## Additional evaluations

OAM noncompliant Matbench 结果中, MatRIS 在 full, unique, 10k stable subsets 的 F1 分别为 0.903, 0.921, 0.986. 它不是每项第一, eSEN 在 unique subset 为 0.925, EquiformerV2 在 10k subset 为 0.988.

LAMBench 中 MatRIS 在 molecules 与 inorganics forces 上较强, 但 OC20-NEB 的 activation-energy MAE 为 4.0, distance error 为 3.6, 明显差于部分 baselines 的 1.6 到 2.3 与 0.7 到 1.5. 因而跨领域平均表述会掩盖 catalysis barrier 的弱点.

Zeolite 表显示 MatRIS force errors 通常最好, energy 并非始终最好. DPA2 的 18 个 test sets 是分别训练, 不是一个预训练模型的 zero-shot test. MatRIS energy 多数领先, 但 direct-force EquiformerV2 或 GemNet 在多项 force metric 上更好. 这与 conservative energy model 在拟合自由度上的取舍一致.

## NVE 动力学

![3 个 OOD 体系的 NVE 轨迹](/images/matris/MD_test.png)

作者对 C3N2H5, H7C4NO 与 NdPd3 运行 80 ps, time step 1 fs, 初温 300 K 的 NVE simulations. 能量波动约在 1 meV/atom 尺度, 没有明显爆炸. 但论文没有报告 drift slope, 不同初始条件, baseline 或置信区间. NVE 没有 thermostat, 所以正文的 thermostatted stability 措辞也不准确.

