---
title: 合金偏析与液态水
description: CoCrFeMnNi surface excess 和 PIMD 水的结构与热容量.
---

# 合金偏析与液态水

## High-entropy alloy surface segregation

CoCrFeMnNi (111) slab 含 539 atoms. 作者用 16 replicas 的 REMD/MC, 结合 atom swaps 跨越缓慢扩散和 segregation barriers. 温度为 500-1200 K, NPT 运行 200 ps, timestep 2 fs.

Gibbs surface excess 定义为

$$
\Gamma_a=\dfrac{N_a-N_a^B N/N^B}{S}. \tag{6}
$$

$\Gamma_a>0$ 表示 element $a$ 相对 bulk 在 surface 富集, $\Gamma_a<0$ 表示 depletion.

![HEA surface segregation](/images/pet-mad/fig6.png)

PET-MAD 与 LoRA 都预测 Ni enrichment, 并与完整 HEA25S 研究相似. Bespoke model 在数值上偏离更大. 三者 validation E/F MAE 分别为 25.8/175.1, 9.4/124.8 和 14.6/138.3 meV units, 其中 LoRA 最低.

作者将 bespoke discrepancy 归因于只用约 2000/30000 HEA25S structures 导致 undersampling/overfitting. 这是合理解释, 但没有直接用独立长轨迹 DFT 验证哪条 $\Gamma_a$ 曲线最接近 reference. "PET-MAD 与 LoRA 一致" 也不是彼此独立证据, 因为 LoRA 从 PET-MAD 初始化.

## Liquid water 与 PIMD

PIMD 将每个 quantum nucleus 表示为 $P$ beads. Extended potential 为

$$
\begin{aligned}
V'\left(\{\mathbf r_j\}_{j=1}^{P}\right)
={}&\sum_{j=1}^{P}V(\mathbf r_j)\\
&+\dfrac{1}{2}\omega_P^2
\left|\widetilde{\mathbf r}_j-\widetilde{\mathbf r}_{j-1}\right|^2,
\end{aligned} \tag{7}
$$

其中 $\widetilde r_i=r_i\sqrt{m_i}$, $\omega_P=k_{\mathrm B}PT/\hbar$. 当 $P\to\infty$ 时 equilibrium quantum statistics 收敛, $P=1$ 退化为 classical MD.

![Liquid water RDF and heat capacity](/images/pet-mad/fig7.png)

模拟为 128 water molecules, 298 K, density 997.1 kg/m$^3$. PET-MAD, bespoke 和 LoRA 在 O-O/O-H RDF 及 bead convergence 上高度一致.

但三者都继承 PBEsol/GGA 对水 melting point 的高估, 使 298 K water 实际成为 highly undercooled liquid, 出现 excessive structure, proton delocalization 和接近 ice 的 heat capacity. 模型忠实复现错误 reference, 不能凭借 universal pretraining 修复 electronic-structure bias.

## 两个案例共同说明什么

HEA 检查 chemical-space sampling 与 surfaces, water 检查 large intramolecular zero-point distortions 和 expensive path-integral estimators. PET-MAD 都能稳定进入 workflow.

但 "observable 与 bespoke 一致" 的证据目标是 emulator fidelity, 不是 experimental accuracy. 这一区分是全文最重要的解释边界.

