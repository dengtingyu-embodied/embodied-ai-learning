---
title: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion"
authors: "Cheng Chi, Siyuan Feng, Yilun Du, Zhenjia Xu, Eric Cousineau, Benjamin Burchfiel, Shuran Song"
year: "2023"
venue: "RSS"
category: "模仿学习"
tags: "embodied-ai, imitation-learning, behavior-cloning, diffusion-model, visuomotor-policy, action-sequence, receding-horizon-control"
status: "待读"
pdf: "source/processing/diffusionpolicy.pdf"
summary: "将视觉运动策略表示为以观测为条件的动作序列扩散模型，通过迭代去噪生成多模态、时间连贯的未来动作，并结合 receding horizon control 实现闭环执行。"
---
感觉实际上就是把diffusion搬到了机器人上
1D Temporal CNN 就是：沿时间维做一维卷积的神经网络。

ai的总结：
Diffusion Policy 要解决的是：同一个观测下可能存在多条正确动作轨迹，普通 MSE 行为克隆容易把不同模式平均成一个错误动作；单步预测还会缺少时间一致性，而直接对高维动作序列建模又比较困难。

它仍然是离线模仿学习。训练数据是专家轨迹中的观测和动作序列，策略学习条件分布 `p(A_t | O_t)`：给定最近一段观测 `O_t`，生成未来一段动作 `A_t`。扩散发生在动作序列上，不预测未来图像，也不是 World Model。

训练流程：
1. 从示范中取真实动作序列 `A^0`，随机采样扩散步 `k` 和高斯噪声 `epsilon`。
2. 按噪声日程得到带噪动作 `A^k = sqrt(alpha_bar_k) A^0 + sqrt(1-alpha_bar_k) epsilon`。
3. 图像经过 ResNet18、机器人状态经过编码后作为 condition；噪声预测网络接收 `A^k`、condition 和扩散步 `k`，预测加入的噪声。
4. 使用 `L = ||epsilon - epsilon_theta(A^k, O, k)||^2` 训练。模型在不同噪声等级上学习怎样把动作序列拉回专家数据分布。

推理流程：
1. 初始化一段与动作序列同形状的高斯噪声 `A^K`。
2. 条件固定为最近的视觉和本体观测，网络迭代预测并去除噪声，得到完整动作序列 `A^0`。
3. 只执行其中前 `T_a` 步，然后重新获取观测、再次生成动作序列，形成 receding horizon control。

三个 horizon：
- Observation horizon `T_o`：策略输入最近多少步观测，用于估计速度和接触变化等仅凭单帧难以判断的信息。
- Prediction horizon `T_p`：每次扩散生成多长的未来动作序列；长一些有利于动作整体连贯。
- Action horizon `T_a`：每次真正执行多少步；太长会接近开环，太短则需要频繁运行扩散模型，计算更贵。

为什么能处理多模态：训练不是用单个回归值概括所有专家动作，而是学习整个动作序列分布。从不同高斯噪声开始，去噪轨迹可以收敛到“从左绕”或“从右绕”等不同高概率区域；一旦生成整段动作，又能在该段内保持同一种选择，避免逐步采样时左右模式反复切换。

网络有两个版本：CNN 版使用 1D temporal CNN，并通过 FiLM 注入观测条件，通常更稳定、适合作为默认选择；Transformer 版让带噪动作 token 通过 cross-attention 读取观测特征，更适合动作快速变化的任务，但对超参数更敏感。视觉版使用从头训练的 ResNet18，并用 spatial softmax 保留空间信息、GroupNorm提高扩散训练稳定性。

和 ACT 的区别：两者都生成 action chunk，但 ACT 用 Transformer 直接回归动作序列，CVAE 只在训练时提供 `z` 且推理固定 `z=0`；Diffusion Policy 在推理时从随机噪声迭代采样，因此真正保留了多模态动作生成能力。ACT用 temporal ensemble 融合同一时刻的重叠预测，Diffusion Policy通常执行前 `T_a` 步后再规划。

需要注意：它仍然没有从根本上解决 behavior cloning 的分布偏移，没见过失败状态就不一定会恢复；多步去噪带来推理延迟；它生成的是局部动作轨迹而不是高层任务计划，也不天然具备语言理解、跨任务泛化或物理预测能力。论文用 DDIM 将训练时 100 个扩散步缩短为推理时约 10 步，以满足真实机器人控制速度。

核心创新是把条件扩散模型真正做成可闭环运行的机器人策略：利用扩散分布建模解决多模态动作，利用动作序列保持时间一致性，再用 receding horizon 在连贯性和实时纠错之间折中。
