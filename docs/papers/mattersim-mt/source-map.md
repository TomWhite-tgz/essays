---
title: MatterSim-MT 原文定位索引
description: 将本站讲解映射回 2605.07927v2 的章节, 图, 表和补充材料.
---

# MatterSim-MT 原文定位索引

本页用于把中文讲解快速映射回 `2605.07927v2` 原文. 页码按 PDF 页码理解时可能包含封面偏移, 因而优先使用章节名, 图号和表号定位.

## 主文结构

| 本站主题 | 原文章节 | 关键图表 |
| --- | --- | --- |
| 研究问题与 PES-only 边界 | Introduction | 主文第 2 至 3 页 |
| 数据, 主动学习与 scaling | Learning the materials space | Fig. 1a-c |
| 势能面总体 benchmark | Learning the materials space | Fig. 1d |
| 声子, 自由能与相图 | MatterSim-MT as a machine learning interatomic potential | Fig. 2a-b |
| 主动学习与水微调 | 同上 | Fig. 2c-f |
| 新增任务与三个案例 | MatterSim-MT as a multi-task materials foundation model | Fig. 3a-d |
| 作者声明的局限 | Discussion | limitations 段落 |
| 数据与代码公开状态 | Data availability, Code availability | 主文末尾 |

## 补充材料结构

| 主题 | 补充材料位置 | 关键公式或表 |
| --- | --- | --- |
| 材料图定义 | Model architecture and training details, Materials Graphs | $\mathcal{G}=(\boldsymbol{Z},\boldsymbol{V},\boldsymbol{R},[\boldsymbol{L},\boldsymbol{S}])$ |
| invariant-equivariant 双流 | Model Architecture | Fig. S1-S4 附近的架构图 |
| 平滑截断与 embedding | Embedding Block | centrality encoding 与 $m_{ij}$ |
| self-attention 与 cross-attention | Transformer Block | masked softmax 公式 |
| 标量与张量任务头 | Task Head | dielectric 与 Born effective charge 公式 |
| 联合损失 | Training details | $L$ 与各任务权重 |
| 模型规模 | Training details | Hyperparameters table |
| scaling | Training details | validation loss figure |
| 主动探索器 | Materials explorer | Data exploration, Uncertainty evaluation |
| DFT 设置 | First-principles computation details | VASP, PBE, PBE+U, 520 eV |
| 多任务数据规模 | Training Data | 各任务结构数量 |
| effective temperature | Off-equilibrium materials data | $T_\mathrm{eff}$ 定义 |
| 基础 benchmark | Benchmarks | performance comparison table |
| 声子与群速度 | Phonons and group velocities | phonon and free-energy results table |
| 准谐自由能 | Free energy prediction with QHA | $F(T,V)$ 与 $G(T,P)$ |
| 多任务 MAE | Results of Multiple Tasks | Multi-task Result table |
| SiC 细节 | Multi-task Case studies | Pressure dependent LO-TO splitting of 3c-SiC |
| MgO 细节 | Multi-task Case studies | Phase boundary of B1-B2 MgO |
| BaTiO3 细节 | Multi-task Case studies | Hysteresis curve of BaTiO3 |
| 富锂正极细节 | Multi-task Case studies | Delithiation of Li1.2-xMn0.8O2 |
| 主动学习 | MatterSim as a continual active learner | uncertainty equation |
| 液态水微调 | Finetuning and molecular dynamics on liquid water | training settings, MSD, diffusion table |

## 图像来源

| 本站图片 | 原论文来源 | 本站页面 |
| --- | --- | --- |
| `overview.png` | 主文 Fig. 1, `Fig-overview-horizontal.pdf` | [总览](./) |
| `scaling.png` | 补充材料 `val_loss_vs_dataset_size_incl_1b.png` | [数据与 scaling](./data) |
| `architecture.png` | 补充材料 `geomformer.png` | [模型结构](./model) |
| `pes-capabilities.png` | 主文 Fig. 2, `Fig-materials-FM.pdf` | [势能面能力与迁移](./pes-evidence) |
| `multitask-capabilities.png` | 主文 Fig. 3, `Fig-multi-task.pdf` | [多任务物理案例](./multitask) |

## 引文核对说明

本站英文引用均从作者随 arXiv v2 发布的 TeX 源码或其 PDF 渲染文本中逐句摘取. 为适应网页显示, 引文会移除 `\cite{}` 与 `\autoref{}` 等 LaTeX 定位命令, 并把 `\SI{}` 渲染为普通单位, 但不把中文解释反向改写成英文再冒充原文.

若论文后续出现 v3 或正式出版版本, 数字, 图号和措辞可能变化. 本站当前所有结论以 `2605.07927v2`, 2026-05-28 为准.

## 原始入口

- [arXiv abstract](https://arxiv.org/abs/2605.07927).
- [arXiv v2 PDF](https://arxiv.org/pdf/2605.07927v2).
- [MatterSim v1 code repository](https://github.com/microsoft/mattersim).

::: warning 代码仓库范围
上面的 GitHub 链接是 MatterSim v1 的公开仓库. `2605.07927v2` 自身写明 MatterSim-MT 的代码和权重将在编辑要求后公开, 因而不能默认 v1 仓库已经包含本文的 multi-task checkpoint 与全部模拟脚本.
:::

