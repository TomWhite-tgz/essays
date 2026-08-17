---
title: 补充材料与公开数据审计
description: 核对 Figure S1 至 Figure S3, Table S1, 生成结构和筛选代码.
---

# 补充材料与公开数据审计

作者随 ChemRxiv v2 上传的 Supporting Information 包含 3 张补充图和 1 张补充表. 它不只是主文的附属图片, 还暴露了若干会改变结论强度的数据口径问题.

## Figure S1: MatterSim 与 DFT 总能

![MatterSim 与 DFT 松弛结构能量的比较](/images/battery-generative/supplementary-parity.png)

<p class="figure-note">原补充材料 Figure S1. 横轴是 DFT 每原子总能, 纵轴是机器学习势给出的每原子总能, 红线代表两者完全相等.</p>

绝大多数点紧贴对角线, 说明 MatterSim 在这个筛选子集上的绝对能量整体相关性很强. 但图中至少有数个明显离群点, 个别纵向偏差达到数 eV/atom. 这张图不能只概括为 "small differences in energies".

更重要的是, 凸包能不是单个结构总能的误差, 而是候选与同一化学体系竞争相能量组合的差:

$$
E_{\mathrm{hull}}(M)=E(M)-E_{\mathrm{hull}}^{\mathrm{reference}}(\mathbf{c}_M).
$$

即使总能散点图整体贴线, 候选和竞争相之间不一致的误差仍可能改变凸包排序. 反过来, 一个体系性的总能常数偏移也未必改变相对凸包能. 因而 Figure S1 只能说明总能相关性, 不能单独验证 MatterSim 的凸包分类精度.

主文提供了更直接的流程级证据: 804 个完成 DFT 松弛的候选中只有 425 个仍低于 $0.1\,\mathrm{eV/atom}$, 对应 $52.86\%$. 这才是该筛选子集上最有解释力的保留比例.

## Figure S2: 两个参考数据集的归一化方式不同

![MP 与 MatterGen 训练数据的元素分布](/images/battery-generative/supplementary-element-baseline.jpeg)

<p class="figure-note">原补充材料 Figure S2. 图 a 是 Materials Project, 图 b 是 MatterGen 训练数据.</p>

图中每个 panel 都把各自出现最多的元素归一化为 1. 在 MP 中 O 最高, 在 MatterGen 训练数据中 Li 最高. 这支持作者关于训练数据更富 Li 的描述.

但两个纵轴不是共享的绝对材料比例. 例如图 b 中 O 接近 0.95 的含义是 O 出现次数约为该数据集 Li 出现次数的 95%, 不是 95% 的结构都含 O. 因而这张图适合比较同一 panel 内的元素排名, 不适合直接比较两个 panel 的绝对丰度.

## Figure S3: 去除元素后的分布仍然变窄

![过滤元素后的训练与生成分布](/images/battery-generative/supplementary-element-filtered.jpeg)

<p class="figure-note">原补充材料 Figure S3. 图 a 是过滤后的训练数据, 图 b 是过滤后的生成数据.</p>

两个 panel 都以 Li 为 1. 生成数据仍覆盖更少的元素, 且低频尾部更快下降. 这强化了主文结论: 单次条件采样没有按训练集频率等比例重现所有元素, 而是向高密度化学区域集中.

不过 "where heavy elements are excluded" 这个图题掩盖了实际代码的复杂性. notebook 的排除表含 Cd, As, Sb, Rb, Cs, Ce, Pr 等 $Z\leqslant70$ 元素, 也含 Ta, W, Re, Os, Ir 等 $Z>70$ 元素, 却没有排除 Au 和 Hf. 因此它不是主文所说的简单 $Z>70$ 规则.

## Table S1: 36 个负凸包能条目

补充表标题声称列出位于 MP 凸包下方的 MatterGen 化合物. 完整数据如下:

| 化合物 | $E_{\mathrm{hull}}$ (eV/atom) | 化合物 | $E_{\mathrm{hull}}$ (eV/atom) |
| --- | ---: | --- | ---: |
| $\mathrm{Li_3Ni_5O_7}$ | -0.5962359 | $\mathrm{Li_3V_4O_9}$ | -0.5545630 |
| $\mathrm{Cu_2Li_2V_4O_{12}}$ | -0.5827617 | $\mathrm{Fe_3Li_3Ni_3O_9}$ | -0.4718813 |
| $\mathrm{LiMoSr_2O_6}$ | -0.4703176 | $\mathrm{Li_3V_3F_4O_6}$ | -0.4676826 |
| $\mathrm{LiVO_2}$ | -0.4509732 | $\mathrm{CrLi_2TiV_2O_9}$ | -0.4073934 |
| $\mathrm{AlCr_3Li_2O_8}$ | -0.3932574 | $\mathrm{LiNiF_4}$ | -0.2932137 |
| $\mathrm{Li_2Ni_2F_8}$ | -0.2708539 | $\mathrm{LiNi_3F_8}$ | -0.2437308 |
| $\mathrm{Cr_2Li_2SnVO_8}$ | -0.2428012 | $\mathrm{CuLi_4NiO_6}$ | -0.2391411 |
| $\mathrm{Li_4V_2F_{13}}$ | -0.1978544 | $\mathrm{Li_4V_2F_{14}}$ | -0.1872719 |
| $\mathrm{Li_5VO_{10}P_2}$ | -0.1481226 | $\mathrm{Bi_2Li_3NiO_6}$ | -0.1231381 |
| $\mathrm{Li_2VF_8}$ | -0.1219534 | $\mathrm{Li_2VF_8}$ | -0.1205020 |
| $\mathrm{Li_2Pt_2H_6}$ | -0.1185084 | $\mathrm{Li_2F_{13}}$ | -0.0556950 |
| $\mathrm{ErLiO_8Se_2}$ | -0.0491843 | $\mathrm{BiLi}$ | -0.0414340 |
| $\mathrm{La_2Li_2Nb_2Nd_2O_{12}}$ | -0.0406913 | $\mathrm{Li_2PbTe_2}$ | -0.0342161 |
| $\mathrm{FeLi_5MnFO_5}$ | -0.0215415 | $\mathrm{K_2Li_2V_2F_{10}}$ | -0.0106468 |
| $\mathrm{Li_5Pd_{12}P_2}$ | -0.0078319 | $\mathrm{Li_3Rh_2O_6}$ | -0.0077951 |
| $\mathrm{Bi_2Li_2Br_4O_2}$ | -0.0075538 | $\mathrm{Hf_2LiSc_3N_6}$ | -0.0053640 |
| $\mathrm{LiPt_2Sr_2}$ | -0.0038980 | $\mathrm{Bi_2Li_2NaY}$ | -0.0022721 |
| $\mathrm{Li_2Na_2Te_2}$ | -0.0017456 | $\mathrm{FeLi_2Ti_3O_8}$ | -0.0003117 |

表中 $\mathrm{Li_2VF_8}$ 出现两次且能量略有不同, 合理解释是两个不同结构多形体, 但补充表没有提供结构标识符或空间群来确认. 因而它是 36 个结构条目, 只有 35 个不同化学式.

负值最深达到约 $-0.60\,\mathrm{eV/atom}$. 对一个据称与 MP 计算口径一致的新相, 如此大的负凸包能非常醒目. 它可能代表遗漏的稳定相, 也可能暴露 DFT 设置和 MP 修正不一致. 补充表没有给出竞争相分解, Materials Project 条目版本或重新构建的凸包, 所以不能仅凭负值宣称 "exceptional stability".

## Table S1 与最终候选的交叉核对

10 个表 1 候选中, 下列 7 个化学式可在 Table S1 直接找到:

- $\mathrm{Li_5MnFeO_5F}$, 补充表按元素顺序写为 $\mathrm{FeLi_5MnFO_5}$.
- $\mathrm{Li_3V_4O_9}$.
- $\mathrm{Li_2Ni_2F_8}$.
- $\mathrm{Li_3Ni_5O_7}$.
- $\mathrm{Li_3V_3F_4O_6}$.
- $\mathrm{K_2Li_2V_2F_{10}}$.
- $\mathrm{LiNi_3F_8}$.

另外 3 个表 1 化学式没有直接匹配:

- $\mathrm{Li_2Mn(CO_3)_3}$ 不在 Table S1, 尽管主文说三个重点候选的位置都在 MP 凸包下方.
- $\mathrm{Li_2Ti_3S_6}$ 不在 Table S1.
- $\mathrm{Li_2TiV_2CrO_8}$ 不在 Table S1, 但存在 $\mathrm{CrLi_2TiV_2O_9}$.

最后一项不是无关的相似式. 公开 ASE 数据库只含 $\mathrm{Li_2TiV_2CrO_9}$, 不含 O8 化合物, 且该 O9 条目的 MatterSim 凸包能为 $0.07041\,\mathrm{eV/atom}$. Table S1 又把同一 O9 化学式列为 DFT 下 $-0.40739\,\mathrm{eV/atom}$. 这些证据共同指向实际生成和 DFT 复核对象是 O9.

但是表 1 的 $155.94\,\mathrm{mAh/g}$ 与 O8 式量一致. 按 2 个 Li 计算:

$$
\begin{aligned}
C_{\mathrm{sp}}(\mathrm{Li_2TiV_2CrO_8})&\approx155.995\,\mathrm{mAh/g},\\
C_{\mathrm{sp}}(\mathrm{Li_2TiV_2CrO_9})&\approx149.055\,\mathrm{mAh/g}.
\end{aligned}
$$

因此表 1 不只是标签少写一个 O. 它的容量也按 O8 计算, 与公开结构和 Table S1 的 O9 对象不一致. 在作者提供具体计算输入前, 该候选的电压, 容量和声子结论不能被唯一对应到一个化学式.

## 公开数据文件的可复现核对

`gen_structures.extxyz` 中精确包含 32,600 个 `Lattice=` 结构块, 与主文一致. `li_gen_Structure_eval_final.db` 包含 940 个结构, 全部含 Li, 且每个条目的 S.U.N. 标志为 1.

公开 notebook 使用的排除表使 940 个结构缩减为 817 个. 在这 940 个结构中, 真正触发排除的只有:

```text
Cd, As, Sb, Rb, Cs, Fr, Ra, Ac, Rf, Ce, Th, Pa, U, Np, Pu, Am, Cm, Bk, Cf,
Es, Fm, Md, No, Lr, Pr, Pm, Ta, Db, W, Sg, Tc, Re, Os, Ir, Hg, Tl, Po, At
```

这是代码中的完整 38 元素黑名单. 其中 `Rf`, `Db`, `Sg` 不在 notebook 另行定义的元素列表中, 但仍出现在排除条件里.

| 元素 | 含该元素的结构数 |
| --- | ---: |
| Cd | 83 |
| As | 20 |
| Sb | 20 |

三组在该数据库中不重叠, 因而 $940-83-20-20=817$. 这准确复现了论文的 817, 也证明该数字来自手写元素黑名单, 不是主文描述的 $Z>70$ 规则.

`30kmetrics.json` 还有两个元数据问题:

1. `precision=0.4740184` 的说明是生成结构中可匹配 MP 的比例. 它在数值上正好等于 $1-\mathrm{novelty}$, 不是一个独立的稳定材料发现精度.
2. `recall=0.0267412` 的文字说明错误地再次写成生成结构中匹配 MP 的比例. 按评价语义, recall 应以 MP 参考结构为分母. 因此应使用指标名解释其方向, 不能照抄 JSON 的重复描述.

这些问题不否定数据开放的价值, 但说明公开文件需要与代码和主文交叉阅读, 不能只读取字段名后直接下结论.
