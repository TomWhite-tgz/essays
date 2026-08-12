---
title: 评测指标与 thermodynamic pipeline
description: Validity, novelty, StructureMatcher, MLIP relaxation, hull correction 与 metric scaling.
---

# 评测指标与 thermodynamic pipeline

## Validity

Composition validity 用 SMACT 检查 oxidation states, charge neutrality 与 Pauling criterion. Structure validity 先拒绝 invalid atomic numbers, malformed lattice, non-finite values 与 construction failures, 最后要求

$$
V\geqslant0.1\,\text{Å}^3,qquad
d_{\min}\geqslant0.5\,\text{Å}.
$$

这些是 computational sanity checks, 不是 synthesizability proof.

## Uniqueness 与 novelty

论文用 `pymatgen.StructureMatcher`, tolerances 为 `stol=0.5`, `ltol=0.3`, `angle_tol=10`. Uniqueness 采用 greedy first-occurrence deduplication. Novelty 相对 filtered reference set. UN 不是独立 uniqueness flags 与 novelty flags 的简单交集, 而是先取 novel subset, 再在其中 greedy deduplicate.

结果会依赖 matcher tolerances, ordering 与 reference coverage. Novel 只表示没有匹配 reference set, 不表示化学空间中从未报道.

## Thermodynamic pipeline

Offline evaluation 对 10,000 generated structures 全部调用 compiled NequIP model, TorchSim CUDA, FIRE 与 Fréchet cell filter, 固定运行 200 steps, 不使用 force-threshold early stopping. Relaxed MLIP energy 经 `MaterialsProject2020Compatibility(check_potcar=False)` correction 后放入 patched Materials Project phase diagram, 再计算 energy above hull.

失败的 relaxation 或 compatibility processing 计为 thermodynamic failure. 这比只对小 subset 估计更完整, 但结果仍是 MLIP plus compatibility pipeline 的 proxy, 不是 DFT verification.

## LeMat 与 MatterGen 外部 pipelines

作者意识到自己设计的 NequIP-SUN pipeline 可能偏向自己的 checkpoint selection, 因而另报 LeMat-GenBench 与 MatterGen pipeline. LeMat pre-relaxed group 中 Crystalite 的 valid, unique, stable, SUN 与 MSUN 最好或并列最好, 但 novelty 53.2% 低于 MatterGen 70.5%, relaxation RMSD 0.1320 也差于 OMatG 0.0759.

MatterGen pipeline 下, Crystalite SUN 为 24.26%, 略高于 MatterGen 23.75%, ADiT 为 17.17%. Crystalite stable rate 64.52% 低于 ADiT 69.96%, novelty 56.63% 低于 MatterGen 75.02%. 跨 pipeline 仍保持 balanced advantage, 但 main table 47.49% SUN 不是 portable absolute score.

## Intensive 与 extensive

Validity, per-sample stability 与 distribution means 可视为 sample-intensive estimates. Uniqueness, discovered count, UN 与 SUN 随总 sample budget $n$ 变化:

$$
\operatorname{Unique}_n
=\dfrac{N_{\mathrm{unique}}(n)}{n},qquad
\operatorname{UN}_n
=\dfrac{N_{\mathrm{UN}}(n)}{n}.
$$

因此在 1,000 samples 上算出的 95% uniqueness 不能与 1,000,000 samples 上的 70% 直接比较. 这是论文很有价值的评测提醒. 严格说, novelty 若逐 sample 对固定 reference 判断是 intensive, 只有与 set deduplication 结合的 discovery yield 才表现为 extensive. 附录也承认这一 caveat.

