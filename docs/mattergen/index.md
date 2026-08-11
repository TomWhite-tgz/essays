# MatterGen 与材料基础模型

这一组论文围绕两个互补问题展开:

- 如何使用生成模型提出满足目标属性的新晶体.
- 如何使用快速而可靠的原子模型筛选, 松弛并模拟候选晶体.

当前已经建立三条精读路线:

- [MatterGen 精读](/mattergen/mattergen/): 从补充材料的 50 个编号公式出发, 解释晶体联合扩散, 条件引导与实验评价.
- [MatterSim 精读](/mattergen/mattersim/): 解释通用原子模型如何承担松弛, 筛选与有限温压模拟.
- [生成模型挖掘锂电材料](/mattergen/battery-generative/): 审查 MatterGen, MatterSim 与 DFT 如何把 32,600 个生成结构筛到 2 个计算候选.

三篇论文合在一起形成一条完整材料发现路线: MatterGen 提出候选晶体, MatterSim 进行快速松弛和初筛, 本文则检验这条流水线在锂电材料任务中的实际表现.
