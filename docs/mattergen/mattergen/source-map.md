---
title: MatterGen 原文定位索引
description: Nature 补充材料全部编号公式, 章节, 图表和解读页面的映射.
---

# MatterGen 原文定位索引

本索引以 60 页 Nature Supplementary Information 的页码和编号为准. arXiv:2312.03687v2 的 TeX 只用于恢复公式源码, 因为预印本补充材料比 Nature 终稿短, 个别符号与实验数字也不同.

## 公式覆盖审计

| 公式 | PDF 章节 | 数学主题 | 解读页面 |
| --- | --- | --- | --- |
| A1-A3 | A.1 | 晶体三元组与坐标变换 | [扩散基础](/mattergen/mattergen/diffusion-basics) |
| A4 | A.3 | denoising score matching | [扩散基础](/mattergen/mattergen/diffusion-basics) |
| A5-A6 | A.3 | VE 前向与反向扩散 | [扩散基础](/mattergen/mattergen/diffusion-basics) |
| A7-A8 | A.3 | VP 前向与反向扩散 | [扩散基础](/mattergen/mattergen/diffusion-basics) |
| A9 | A.4 | 3 类晶体变量的联合核 | [扩散基础](/mattergen/mattergen/diffusion-basics) |
| A10-A17 | A.5 | D3PM, 后验, MASK 吸收态 | [原子类型](/mattergen/mattergen/atom-types) |
| A18 | A.6 | 分数坐标的环面等价关系 | [原子类型](/mattergen/mattergen/atom-types) |
| A19-A24 | A.6 | wrapped normal, 密度缩放与 score | [几何扩散](/mattergen/mattergen/geometry-diffusion) |
| A25-A26 | A.6.3 | 笛卡尔扩散的晶格轨迹依赖 | [几何扩散](/mattergen/mattergen/geometry-diffusion) |
| A27-A31 | A.7 | 对称晶格与定制先验 | [几何扩散](/mattergen/mattergen/geometry-diffusion) |
| A32 | A.8 | 原子类型 logits | [网络与损失](/mattergen/mattergen/network-loss) |
| A33-A37 | A.8.1 | 对称晶格 score 构造 | [网络与损失](/mattergen/mattergen/network-loss) |
| A38-A39 | A.8.1 | 应力型缩放与旋转规律 | [网络与损失](/mattergen/mattergen/network-loss) |
| A40 | A.8.2 | 晶格角信息注入 | [网络与损失](/mattergen/mattergen/network-loss) |
| A41-A44 | A.9 | 坐标, 晶格与元素联合损失 | [网络与损失](/mattergen/mattergen/network-loss) |
| B45 | B.1 | property adapter | [条件引导](/mattergen/mattergen/guidance) |
| B46-B47 | B.2 | classifier-free guidance | [条件引导](/mattergen/mattergen/guidance) |
| D48 | D.4 | ordered-disordered 替代条件 | [数据与评价](/mattergen/mattergen/evaluation) |
| D49 | D.5.1 | DFT 松弛前后 RMSD | [数据与评价](/mattergen/mattergen/evaluation) |
| D50 | D.10.8 | Young 模量到体模量换算 | [条件与实验](/mattergen/mattergen/conditional-evidence) |

编号公式共 50 个, 已全部逐式解释. 此外, A4 后的 noise prediction, A9 后的逐原子因子分解, A13 的交叉熵, A21 后的广义方差, A30 后的密度与信噪比, B.2.2 的离散 guidance 等关键未编号公式也已纳入对应页面.

## 章节覆盖审计

| PDF 章节 | 页码 | 内容 | 解读位置 |
| --- | ---: | --- | --- |
| A.1-A.4 | 2-5 | 表示, 对称性, 扩散基础, 联合过程 | [第 1 章](/mattergen/mattergen/diffusion-basics) |
| A.5 | 5-8 | 原子类型离散扩散 | [第 2 章](/mattergen/mattergen/atom-types) |
| A.6-A.7 | 8-12 | 坐标与晶格扩散 | [第 3 章](/mattergen/mattergen/geometry-diffusion) |
| A.8-A.9 | 12-15 | 网络结构与训练损失 | [第 4 章](/mattergen/mattergen/network-loss) |
| A.10-A.11 | 15-17 | 消融与相关模型比较 | [第 4 章](/mattergen/mattergen/network-loss) |
| B | 18-19 | adapter 与 guidance | [第 5 章](/mattergen/mattergen/guidance) |
| C | 20-21 | 数据与 DFT | [第 6 章](/mattergen/mattergen/evaluation) |
| D.1-D.5 | 22-34 | 配置, 评价定义, matcher, 无条件结果 | [第 6 章](/mattergen/mattergen/evaluation) |
| D.6-D.9 | 35-47 | 化学, 对称性, 性质与多目标生成 | [第 7 章](/mattergen/mattergen/conditional-evidence) |
| D.10 | 48-53 | 合成, XRD, XPS 与纳米压痕 | [第 7 章](/mattergen/mattergen/conditional-evidence) |
| References | 53-60 | 补充参考文献 | 本索引与各页按主题引用 |

补充材料之外的 2026 年 Ta-Cr-O 重分析单独收录于 [局限与后续争议](/mattergen/mattergen/critique), 不与原论文证据混写.

## 关键图表

| 图表 | 作用 | 解读位置 |
| --- | --- | --- |
| Fig. A1 | 检查 wrapped score 截断误差 | [A23-A24](/mattergen/mattergen/geometry-diffusion) |
| Fig. A2 | 展示等价晶胞使 GNN 难以区分的情形 | [A40](/mattergen/mattergen/network-loss) |
| Table A2 | 各模型设计的消融证据 | [A.10](/mattergen/mattergen/network-loss) |
| Fig. C3-C4 | 数据来源重叠与元素分布 | [数据](/mattergen/mattergen/evaluation) |
| Fig. D5-D6 | ordered-disordered matcher 与 D48 阈值 | [D48](/mattergen/mattergen/evaluation) |
| Table D3 | 两种 matcher 对核心指标的影响 | [S.U.N.](/mattergen/mattergen/evaluation) |
| Table D4 | 同数据训练的 DiffCSP 对比 | [D49](/mattergen/mattergen/evaluation) |
| Table D6-D7 | 27 个化学体系与严格 on-hull 结果 | [目标化学体系](/mattergen/mattergen/conditional-evidence) |
| Fig. D8-D9 | 空间群命中率与分布复现 | [目标空间群](/mattergen/mattergen/conditional-evidence) |
| Table D8 | 多目标磁体的实验材料 rediscovery | [低风险磁体](/mattergen/mattergen/conditional-evidence) |
| Fig. D10 | 3 个未成功合成的候选 | [实验筛选](/mattergen/mattergen/conditional-evidence) |
| Fig. D11 | XPS 元素化学态 | [实验样品](/mattergen/mattergen/conditional-evidence) |
| Fig. D12 | 4 个位置的纳米压痕曲线 | [D50](/mattergen/mattergen/conditional-evidence) |

## 版本差异处理原则

Nature 终稿是数字与公式编号的权威来源. TeX 中若出现旧实验样本数, 旧结构例子或公式排版差异, 不直接写入本站. 例如, Nature 终稿 A23 的 score 带负号, B45 明确说明微调更新全部权重, D.8 的 S.U.N. 数量也与早期 arXiv 版本不同, 本站均采用 Nature PDF.
