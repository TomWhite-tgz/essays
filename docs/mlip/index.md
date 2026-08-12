# 通用机器学习原子间势

本专题将比较 DPA-2, UMA, PET-MAD, MatterSim, MatRIS, EquiformerV3 和 FlashTP 等工作. 比较维度包括训练数据, 对称性, 能量守恒, 推理成本, 高温高压覆盖和下游物理量验证.

目前可阅读:

- [PET-MAD 精读](/papers/pet-mad/), 理解高多样性小数据, 内部一致 DFT, LoRA, LLPR 与复杂物性 workflow.
- [原子模拟基础模型 Perspective 精读](/papers/fm-atomistic/), 理解 foundation model 的严格判据, 数据与参数 scaling, post-training 和评测缺口.
- [eSEN 精读](/papers/esen/), 理解保守力, PES 光滑性和有限步长能量守恒为何决定高阶物性预测.
- [MatterSim 精读](/mattergen/mattersim/), 理解势能面, 主动学习和有限温压评测.
- [MatterSim-MT 精读](/papers/mattersim-mt/), 理解多任务表征如何从共享原子模型产生材料性质.
- [DPA-2 精读](/papers/dpa2/), 理解异构 DFT 标签如何通过 shared descriptor 与 task-specific heads 共同预训练.
- [FlashTP 精读](/papers/flashtp/), 理解等变 MLIP 中 CG 张量积的数学结构与 GPU 执行瓶颈.
