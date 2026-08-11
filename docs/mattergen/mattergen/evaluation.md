---
title: 数据, S.U.N. 与无条件生成
description: 解读 MatterGen 补充材料 C 和 D.1-D.5, 包括公式 D48-D49.
---

# 6. 数据, S.U.N. 与无条件生成

本章覆盖 Supplementary C 和 D.1-D.5. 公式推导决定模型怎样生成, 数据与评价协议则决定论文中的成功率究竟在测什么. 读这一部分必须始终区分训练集, 稳定性参考集, novelty 参考集和最终 DFT 计算.

## 3 个原始数据源

作者整合 3 类数据.

- Materials Project, 版本为 2022.10.28, 主要是 DFT 松弛结构, 很大部分源于已知实验晶体.
- Alexandria, 含大量由机器学习或其他算法提出的假想结构.
- ICSD, 版本为 2023.1, 是实验精修结构库. 数据生成阶段只查询未标记为已包含在 MP 中且可直接做 DFT 的有序结构.

对 MP 结构复用已有计算. 对其他来源按 MP 设置重新计算. 随后使用 emmet 流程做质量验证, 等价结构去重, PBE 系统误差经验校正和各化学体系凸包构建.

## 训练集和参考集不是同一个集合

处理后得到 850384 个唯一有序结构及其 DFT energy above hull, 称为 Alex-MP-ICSD. 它是稳定性凸包的参考集.

训练集 Alex-MP-20 从中继续筛选:

- 原胞最多 20 个原子.
- energy above hull 低于 $0.1\,\mathrm{eV/atom}$.
- 手工排除 D.6 定义的 well-explored 化学体系.
- 排除只在 ICSD 出现的结构, 将它们留作测试.

novelty 参考集还额外加入 117652 个 ICSD 无序结构. 因此, 一个结构可以不在训练集中, 但仍不算 novel. 这正是合理的, 否则"模型没见过"会被错误等同于"人类数据库没见过".

MatterGen-MP 则只用 MP-20 中相对统一参考凸包低于 $0.1\,\mathrm{eV/atom}$ 的结构训练, 用于与依赖 MP 数据的基线做更公平比较.

## DFT 协议

所有新 DFT 计算使用 VASP 与 PAW, 通过 atomate2, pymatgen 和 custodian 管理, 并保持与 MP 的 PBE 与 Hubbard $U$ 设置一致.

- 总能量使用 MPRelaxSet, DoubleRelaxMaker 和 StaticMaker.
- 带隙使用相同基础设置与 BandStructureMaker.
- 弹性张量使用 ElasticMaker 的 minimal preset, 应变 stencil 为 $-0.01\%$ 与 $0.01\%$.

一致协议很重要, 因为凸包比较要求候选与参考相的能量误差尽量同源. 即使如此, PBE, $U$ 值和经验校正仍限定了"稳定"的理论层级.

## 训练和采样配置

无条件模型在 8 张 A100 GPU 上训练 174 万步, 每张 GPU batch size 为 64, 使用 Adam. 初始学习率为 $10^{-4}$, ReduceLROnPlateau 的衰减因子为 0.6, patience 为 100, 最小学习率为 $10^{-6}$.

A41 的权重取

$$
\lambda_{\mathrm{coord}}=0.1,
\qquad
\lambda_{\mathrm{cell}}=\lambda_{\mathrm{types}}=1,
\qquad
\lambda_{\mathrm{CE}}=0.01.
$$

条件微调使用 global batch size 128, 初始学习率 $6\times10^{-5}$, 梯度按值裁剪到 0.5. 验证损失连续 100 epochs 不改善即停止, 不同标签集对应 3.2 万到 110 万步.

采样把 $[0,1]$ 离散为 1000 步. 每步先按 A6, A8, A16 做 predictor, 再做一次 Langevin corrector. 坐标和晶格 corrector 的 signal-to-noise ratio 分别为 0.4 和 0.2.

中间筛选使用 MatterSim. 该版本训练于 108 万个晶体结构, 基于 3 层 M3GNet, 共 89 万参数. MLFF energy above hull 使用与 MP 兼容的 MaterialsProject2020Compatibility 校正.

### MLFF 在证据链中的位置

MatterSim 用于大量候选的松弛和预筛, 不是最终稳定性裁判. D.3 明确规定论文报告的稳定性总是基于 DFT 松弛后能量和 DFT 凸包. 这避免把生成模型与筛选势的共同误差直接包装成稳定性证据.

## 为什么计算指标仍不够

D.2 主动列出人工审查维度: 对称性, 缺陷, 局部键长与配位, 离子材料的电荷平衡, 以及文献中类似化学环境. 作者也强调几个根本边界.

第一, $0\,\mathrm{K}$ 和 $0\,\mathrm{GPa}$ 的静态凸包不能证明可合成. 动力学, 熵, 声子稳定性, 前驱体与反应路径都未被一个标量覆盖. 第二, 可接受的亚稳能随化学体系变化, 碳化物和氮化物可能容忍很高 off-hull 能量, 金属间化合物通常更严格. 第三, 未充分探索的化学体系会因缺少竞争相而低估 energy above hull.

MatterGen 只生成有序结构, 真实合金或固溶体却常有分数占位. 同一个无序相可能对应许多小原胞有序近似. 如果不处理, 这些近似会同时抬高 uniqueness 和 novelty. D.4 的 matcher 就是为此设计.

## S.U.N. 的 3 个集合条件

### Stable

DFT 松弛后, 候选每原子能量在 Alex-MP-ICSD 凸包上方不超过 $0.1\,\mathrm{eV/atom}$ 即视为 stable. 一般批次中, 同一化学体系生成的多个候选分别相对固定参考凸包判断, 不把它们彼此加入组合凸包. D.6 的目标化学体系搜索是例外, 因为任务正是寻找该体系最稳定的相, 所以使用组合凸包.

$0.1\,\mathrm{eV/atom}$ 是允许亚稳材料的经验阈值. 实验合成的候选在参考凸包上方 $0.024\,\mathrm{eV/atom}$, 若强制 $0$ 阈值会被漏掉. 但固定阈值不能在所有化学体系中等价表示可合成性.

### Unique

在同一生成批次内, 具有相同 reduced formula 的结构通过 ordered-disordered matcher 比较. 若不与其他生成结构匹配, 则 unique. 不要求空间群标签相同.

uniqueness 随批次大小下降, 所以只能在样本数相同的设置间公平比较. 一个模型生成 100 个样本与生成 10000 个样本时的 unique fraction 不是同一难度指标.

### Novel

候选不能匹配 850384 个有序参考结构, 也不能匹配扩展参考集中的 117652 个 ICSD 无序结构. 与无序结构比较时, reduced formula 中各元素相对比例允许 $10\%$ 的小差异, 例如有序 $\mathrm{Fe}_2\mathrm{Ni}_3\mathrm{O}_5$ 会尝试匹配 $\mathrm{Fe}_{2.2}\mathrm{Ni}_{2.8}\mathrm{O}_5$.

novel 与 unique 正交. 重复生成同一个未知结构会有高 novelty, 但低 uniqueness. 反过来, 生成许多不同的已知结构会有高 uniqueness, 但低 novelty.

## D48: 可替代元素的经验条件

ordered-disordered matcher 先运行标准 pymatgen StructureMatcher. 若失败, 再检查元素 $a$ 与 $b$ 是否可能在固溶体中互相替代:

![ordered-disordered structure matcher 的完整决策流程.](/images/mattergen/ordered-disordered-flow.png)

$$
|\chi_a-\chi_b|\leqslant1
\qquad\text{and}\qquad
\dfrac{2|r_a-r_b|}{r_a+r_b}<0.3. \tag{D48}
$$

$\chi$ 是电负性, $r$ 是原子半径. 第二项是半径差相对平均半径的归一化度量. 两个条件分别限制化学性质差异与尺寸失配. 阈值来自 ICSD 分数占位中实际共占元素对的统计, Fig. D6 显示其中 $95\%$ 落在界限内.

![ICSD 无序结构中共占元素对的电负性差与原子半径相对差. 黑框给出 D48 的阈值.](/images/mattergen/substitution-criterion.png)

通过条件的元素对构成可替代关系. 若存在多个相互连接的替代对, 算法把相应位点改写为按比例分数占位的无序结构, 再用 `attempt_supercell=True`, `allow_subset=True` 和 `OrderDisorderElementComparator` 比较.

### D48 的边界

这是修改后的 Hume-Rothery 启发式, 不是替代反应的充分必要条件. 元素半径依赖价态与配位, 电负性也不能完整描述电子结构. 算法还要求两个有序结构的 reduced formula 相同, 因而不会把不同化学计量的固溶体近似自动合并.

新 matcher 比标准 matcher 更宽松, 所以计算出的 novelty 和 uniqueness 只会相同或更低. Table D3 显示主要主张的数值确实下降, 但相对趋势大多保留. 例如 Alex-MP 无条件 S.U.N. 从 $44\%$ 降至 $39\%$.

## D49: 生成结构到 DFT 极小值的 RMSD

$$
\operatorname{RMSD}
=\min_{P}
\sqrt{
\dfrac{1}{N}
\sum_{n=1}^{N}
\left\lVert
\widetilde{\boldsymbol{x}}^{\mathrm{gen}}_{P(n)}
-\widetilde{\boldsymbol{x}}^{\mathrm{DFT}}_{n}
\right\rVert_2^2
}. \tag{D49}
$$

$P$ 是 element-aware permutation, 只在相同元素的原子间寻找最佳对应. 如果一个晶胞里有多个同种元素, 原子编号本身没有物理意义, 所以必须先最小化匹配再计算位置误差.

RMSD 小表示生成结构已靠近 DFT 松弛后的局部极小值. 它有两个含义: 初始几何较合理, DFT 松弛通常更省计算. 但它不是热力学稳定性. 一个候选可以几乎不移动却位于凸包很高处, 也可以大幅移动后落入稳定极小值.

在相同 Alex-MP 数据上, Table D4 报告 MatterGen 平均 RMSD 为 $0.021\,\text{\AA}$, DiffCSP 为 $0.104\,\text{\AA}$. 对应 S.U.N. 为 $38.57\%$ 与 $33.27\%$. "约 5 倍更接近局部极小值"来自 RMSD 比值, 不是能量误差比值.

## 无条件生成还证明了什么

Fig. 2 相关结果基于 1024 个生成并经 DFT 松弛的结构. 其中 17 个是 unique, novel 且严格 on-hull, 包括 7 个二元, 7 个三元和 3 个四元结构. 人工审查也发现 P1, 分子晶体, 层状结构和可能的缺陷近似, 说明单一 S.U.N. 指标仍会容纳物理风格很不同的候选.

作者还从 1000 万个无条件样本中检查 ICSD hold-out rediscovery. 标准有序 matcher 找回 1206 个 i.i.d. hold-out 和 1013 个 temporal hold-out. 更宽松的 ordered-disordered matcher 还匹配约 8000 个未参与训练的无序 ICSD 结构.

rediscovery 是"模型能覆盖部分真实材料分布"的正证据, 但不是 novelty 证据. 大规模采样数量也必须一起报告, 因为找回数量会随抽样预算增长.

## 本章结论

MatterGen 的评价链条不是"生成 -> 看起来合理". 它是"生成 -> MatterSim 松弛与预筛 -> DFT 松弛和性质计算 -> 固定凸包判稳 -> 有序与无序联合匹配". D48 决定 diversity 与 novelty 的保守程度, D49 只度量离局部几何极小值的距离. S.U.N. 是有用的联合门槛, 但仍不能替代声子, 有限温度, 合成路径和实验.
