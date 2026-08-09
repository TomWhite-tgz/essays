---
title: 4. 证据与实验
description: 审查 MatterSim 的有限温压 benchmark, 材料发现, 声子, 自由能, 相图和 MD.
---

# 4. 证据与实验

## 先看最直接的势函数误差

::: details 英文原文: 作者怎样定义 zero-shot 能力
> "MatterSim serves as a universal MLFF to efficiently predict energies, forces, and stresses of structures consisting of any combinations of elements from the periodic table (currently supports the first 89 elements) under simulation conditions of 0-5000 K and 0-1000 GPa, without additional training data. Its universality and accuracy is benchmarked on multiple open datasets as well as three newly created ones with better representation of the model's capability under finite temperatures and pressures."

第一句同时限定了输出, 元素范围, 温压范围和 zero-shot 的含义. 这里的 `without additional training data` 是针对特定下游预测时不再加入数据, 不是说模型没有在相似元素和构型上预训练. 第二句说明论文并未只依赖公开近平衡数据集, 而是专门构造了有限温压测试集验证这一声明.

原文定位: 主文 Results, MatterSim as a zero-shot atomistic emulator, 第 1 段.
:::

论文使用 6 个测试集比较 M3GNet, CHGNet, MACE-MP-0 和两个 MatterSim backbone. 下面摘录最能说明分布变化的结果.

| 测试集 | 指标 | M3GNet | CHGNet | MACE-MP-0 | MatterSim M3GNet | MatterSim Graphormer |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| MPTrj-random-1k | 能量, eV/atom | 0.032 | 0.027 | 0.015 | 0.030 | **0.012** |
| MPF-TP | 能量, eV/atom | 0.207 | 0.254 | 256.340 | **0.036** | 0.040 |
| MPF-TP | 力, eV/Å | 1.224 | 3.313 | 1506.854 | 0.431 | **0.421** |
| MPF-TP | 应力, GPa | 5.575 | 25.208 | 202.093 | **1.318** | 1.917 |
| Random-TP | 能量, eV/atom | 0.537 | 0.506 | 9.184 | 0.219 | **0.141** |
| Random-TP | 力, eV/Å | 1.789 | 3.950 | 88.327 | 0.937 | **0.813** |
| Random-TP | 应力, GPa | 3.216 | 7.230 | 19.224 | **2.518** | 2.696 |

这些数字揭示了比 "最多提高 10 倍" 更重要的模式:

1. 在接近平衡态的 MPTrj 随机样本上, MatterSim 的优势存在但没有夸张到数量级.
2. 一旦进入 MPF-TP, 旧模型的误差显著放大, MatterSim 的退化小得多.
3. MACE-MP-0 在极端构型上出现巨大误差, 表明一个近平衡 benchmark 上优秀的通用势可能在分布外完全失效.
4. Graphormer 不在所有指标上占优. 大模型容量不能替代任务相关的数据和输出约束.

::: warning 比较的时代性
这是 2024 年版本论文对当时 checkpoint 的比较, 不是对今天所有通用 MLIP 的永久排名. 尤其 MACE-MP-0 和其他项目后续可能更新. 本页只解释论文当时提供的证据.
:::

## 材料发现

### Matbench Discovery

MatterSim 使用 Graphormer 势松弛 WBM 初始结构, 最多 500 步, 直到最大力低于 $0.01$ eV/Å, 再预测形成能和稳定性. 作者报告:

- F1 为 $0.83$.
- Precision 为 $0.83$.
- Recall 为 $0.82$.
- Accuracy 为 $0.96$.
- 形成能 MAE 约为 $0.026$ eV/atom.

这些指标说明模型不仅能对给定结构做单点能量回归, 还能把原本未松弛的候选结构带到合理的局部极小值.

### 随机结构搜索

::: details 英文原文: 8000 万候选怎样筛选
> "Using MatterSim, we carried out materials screening on all 4,005 unary and binary chemical systems of 89 elements with 45 chemical compositions for binary chemical systems, up to 12 atoms in the unit cell. For each chemical system, we generate 20,000 candidate materials, resulting in about 80 million structures in total."
>
> "By taking the most stable three structures from each chemical composition according to MatterSim's energy prediction, and using first-principles computations for verification, we identified 16,399 structures to be on or below the energy convex hull defined by the Alexandria-MP-ICSD structures"

这三句给出了完整漏斗. MatterSim 先评估约 8000 万候选, 每种化学组成只保留预测最稳定的 3 个, 最后才进行第一性原理验证. 因此, 16399 不是模型单独宣告稳定的数量, 而是经过后续 DFT 验证后相对既有参考凸包得到的结果.

原文定位: 主文 Results, Materials Discovery, 第 2 段.
:::

作者对前 89 种元素构成的 4005 个一元和二元化学体系进行随机结构搜索. 每个体系生成 20000 个候选, 总计约 8000 万个结构. 每个化学组成保留 MatterSim 预测最稳定的 3 个结构, 再使用 DFT 验证.

论文报告 16399 个结构位于或低于 Alexandria-MP-ICSD 定义的已有凸包. 将 RSS 结果加入重新构造联合凸包后, 共有 7268 个稳定结构, 其中 RSS 贡献 5213 个, 1974 个不在原 Alexandria-MP-ICSD 集合中.

![随机结构搜索结果](/images/mattersim/materials-discovery.png)

<p class="figure-note">原论文图 3. 图中区分相对旧凸包稳定的候选, 联合凸包上的贡献, 以及排除阴离子修正风险后的元素分布.</p>

这里必须谨慎解释 "发现": 论文发现的是经过 DFT 计算后在特定计算设置与参考集合下具有热力学稳定性的候选结构, 不是 1974 种已经实验合成的新材料. 动力学稳定性, 有限温自由能, 合成路径和数据库去重仍需后续验证.

## 声子为什么是更严格的检验

声子频率来自势能面对位移的二阶导数. 能量 MAE 较低并不保证曲率正确. 作者用 Phonopy 的有限位移法, 将原子移动 $0.03$ Å, 用 MatterSim 预测力, 再构造力常数和动力学矩阵.

平均声子频率定义为:

$$
\overline{\omega}
=\dfrac{
\displaystyle\int \omega g(\omega)\,\mathrm{d}\omega
}{
\displaystyle\int g(\omega)\,\mathrm{d}\omega
}.
$$

作者在整个 PhononDB 上报告:

| 指标 | MatterSim | MACE-MP-0 |
| --- | ---: | ---: |
| 最大声子频率 MAE | 0.87 THz | 1.73 THz |
| 平均声子频率 MAE | 0.76 THz | 1.32 THz |
| 平均声子频率 $R^2$ | 0.86 | 0.75 |
| 声子 DOS 平均误差 | 0.64 | 0.81 |

![GaN 声子谱比较](/images/mattersim/phonon-gan.png)

<p class="figure-note">补充材料图 S20b. MatterSim, MACE-MP-0 与 PhononDB 中 PBEsol 参考的 GaN 声子色散和态密度.</p>

需要注意一个理论层级差异. MatterSim 主要用 PBE 数据训练, PhononDB 参考采用 PBEsol. 因而这里的误差同时包含模型误差和泛函差异. 它仍然是有效的外部 benchmark, 但不是纯粹的 "拟合 PBE 势能面误差".

## 体模量, 焓和高压响应

在准谐近似 (QHA) 下, 不同体积的声子谱用于构造温度依赖的 Helmholtz 自由能:

$$
F(T,V)=U_\mathrm{el}(V)+F_\mathrm{ph}(T,V).
$$

振动部分为:

$$
\begin{aligned}
F_\mathrm{ph}(T,V)
&=\dfrac{1}{2}\sum_{\boldsymbol{q},s}
\hbar\omega_{\boldsymbol{q}s}(V) \\
&\quad+k_\mathrm{B}T\sum_{\boldsymbol{q},s}
\ln\left[
1-\mathrm{e}^{-\hbar\omega_{\boldsymbol{q}s}(V)/(k_\mathrm{B}T)}
\right].
\end{aligned}
$$

体模量由自由能对体积的二阶导数给出:

$$
K(T)=V(T)
\left.\dfrac{\partial^2F(T,V)}{\partial V^2}\right|_T.
$$

论文对 59 种成功完成 PBE, MatterSim 和 MACE-MP-0 QHA 计算的材料进行比较. MatterSim 的温度依赖体模量曲线平均 MAE 为 4.11 GPa, MACE-MP-0 为 11.35 GPa. 主文还报告 0 K 体模量 MAE 为 2.47 GPa.

高压下使用焓:

$$
H(p)=U+pV.
$$

在 1000 GPa 的 59 种材料上, 论文报告焓 MAE 为 2.23 eV 和 $R^2=1.00$. $R^2$ 很高并不意味着相稳定性误差为零. 在超高压下焓的数值跨度很大, 即使绝对误差仍足以改变两个近简并相的排序, $R^2$ 也可能接近 1.

## 自由能与相图

::: details 英文原文: 自由能误差和实验比较
> "As shown in Fig. 4(e)-(f), and Fig. S21, MatterSim achieves a sub-10 meV/atom error for temperatures up to 1000 K when compared with QHA computations at PBE level of theory, signifying a near-first-principles predictive power. More importantly, when compared with experimental measurements on over 200 materials as shown in Fig. S22, it achieves an MAE of 15 meV/atom(see Section S11.1), lower than dedicated models directly trained on experimental data.[55]"

两句使用了不同参照. 第一项比较 PBE-QHA, 主要检查机器学习势能面是否复现其训练理论. 第二项比较实验, 同时包含 PBE 理论偏差, QHA 近似误差和模型误差. 因而 15 meV/atom 更接近端到端应用误差, 不能与第一项的 sub-10 meV/atom 直接混为同一 benchmark.

原文定位: 主文 Results, Free Energy and Phase Diagrams, 第 1 段.
:::

Gibbs 自由能通过对体积最小化得到:

$$
G(T,p)=\min_V\left[F(T,V)+pV\right].
$$

论文报告 MatterSim 相对 PBE-QHA 在 1000 K 以内的自由能误差低于 10 meV/atom. 对 200 多种材料的实验热化学数据, 温度相关自由能差的 MAE 约为 15 meV/atom.

这是很强的结果, 因为自由能把能量, 力的曲率, 体积响应和温度依赖串在一起. 但这里仍是 QHA 框架. QHA 通过不同体积下的谐振动近似热膨胀, 对强非谐, 扩散, 熔化和软模体系可能失效.

论文进一步计算 MgO 的 B1-B2 相边界. 300 K 转变压力预测为 584 GPa, 对比实验范围 429 至 562 GPa 和一项第一性原理结果 520 GPa. 584 GPa 接近这些参考, 但略高于给出的实验上界. "与实验一致" 更准确地说是量级和趋势合理, 而不是落在所有实验误差带内.

![Si 相边界预测](/images/mattersim/si-phase-boundary.png)

<p class="figure-note">补充材料图 S24b. MatterSim 给出的 Si 相界与已有理论和实验结果比较.</p>

## 分子动力学稳定性

::: details 英文原文: success rate 实际测量什么
> "A success rate is defined as the ratio of the actual runtime to the preset total time in MD simulations. As shown in Fig. 5(b), MatterSim achieved more than 90% success rate for all the material families tested, exhibiting robustness over wide temperature ranges."

原文把 success rate 定义为实际运行时间与计划时间之比. 它测量轨迹是否提前失败, 因而直接支持的是数值鲁棒性. 这个定义本身没有比较 RDF, 动力学性质或整条轨迹的 DFT 误差, 所以不能单独支持物理准确性.

原文定位: 主文 Results, Molecular Dynamics Simulations, 第 2 段.
:::

作者选择 118 个体系, 包括 bulk, MOF, 二维材料, 界面, 分子晶体, 聚合物, 表面和分子. 所有体系快速加热到 5000 K, bulk 体系还被压缩至 1000 GPa.

论文把 success rate 定义为实际运行时间除以预设总时间, 并报告各材料类别加热实验的完成率超过 90%, 高压实验平均完成率也超过 90%.

![高温高压 MD 稳定性实验](/images/mattersim/md-robustness.png)

<p class="figure-note">原论文图 5. 完成轨迹说明数值过程没有提前崩溃, 但不能单独证明轨迹在物理上正确.</p>

这里最重要的审读区别是:

- **Numerical robustness**. 模拟能运行, 没有出现明显发散或程序失败.
- **Physical accuracy**. 轨迹的结构, 动力学和相变行为与 DFT 或实验相符.

完成率主要支持第一项. 作者对 6 个轨迹快照重新计算 DFT, 报告平均能量误差低于 50 meV/atom, 这为第二项提供了少量证据. 但 6 个快照不足以验证全部 118 条长轨迹的物理真实性.

## 哪些证据最有说服力

<div class="verdict">
最强证据是同一模型在有限温压能量, 力, 应力, 声子和自由能上的一致改善. 这些指标约束势能面的不同导数和不同区域, 比单一排行榜更难通过偶然偏差同时做好. 随机结构搜索展示了规模潜力, 但 "新材料" 仍需合成与更严格稳定性验证. MD 完成率展示了工程鲁棒性, 不应被等同于完整的物理验证.
</div>
