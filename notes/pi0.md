---
title: "pi0: A Vision-Language-Action Flow Model for General Robot Control"
authors: "Kevin Black, Noah Brown, Danny Driess, Adnan Esmail, Michael Equi, Chelsea Finn, et al."
year: "2024"
venue: "arXiv"
category: "机器人基础模型"
tags: "embodied-ai, vision-language-action, robot-foundation-model, flow-matching, action-chunking, cross-embodiment, imitation-learning"
status: "待读"
pdf: "source/processing/pi0.pdf"
summary: "在预训练 PaliGemma VLM 上增加处理机器人状态与连续动作的 action expert，使用条件 flow matching 生成高频 action chunk，并通过大规模跨机器人预训练和任务后训练获得通用语义能力与灵巧控制能力。"
---

pi0 要解决的是：传统 VLA 把连续动作离散成 token 后自回归输出，量化会损失控制精度，逐 token 生成也难以支持高频灵巧操作；单任务 ACT 或 Diffusion Policy 又缺少语言知识、跨任务和跨机器人数据规模。pi0 将预训练 VLM 的语义能力与连续动作生成结合起来。

输入由 2-3 路 RGB 图像、语言指令和机器人本体状态组成，输出是未来一段连续动作。论文采用约 30 亿参数的 PaliGemma 作为 VLM backbone，并增加约 3 亿参数、从头训练的 action expert，总规模约 33 亿参数。图像和语言 token 走 VLM 权重；机器人状态、带噪动作和 flow timestep 走 action expert 权重，两组 token 通过同一个 Transformer 的 attention 交换信息。

模型流程：
1. PaliGemma 的视觉编码器与语言模型将多视角图像和语言指令编码为语义 token。
2. 当前机器人关节状态经过线性映射成为 state token。
3. 每个未来动作对应一个 action token；训练时输入的是处于某个 flow 时刻 `tau` 的带噪动作序列。
4. Action tokens 可以双向关注整段动作，并读取图像、语言和机器人状态；action expert 对每个动作 token 输出一个速度向量，即动作在 flow 空间中应该向哪里移动。

Flow matching 训练：从示范中取真实动作块 `A`，采样高斯噪声 `epsilon` 和 `tau in [0,1]`，在线性路径上构造
`A^tau = tau A + (1-tau) epsilon`。
从噪声到真实动作的目标速度恒为 `u = A - epsilon`，网络学习
`L = ||v_theta(A^tau, observation, language, state, tau) - (A-epsilon)||^2`。
因此它不是预测“加了多少噪声”，而是预测当前位置沿哪一个速度方向运动，才能从噪声流向专家动作分布。

推理时从 `A^0 ~ N(0,I)` 开始，在固定图像、语言和状态条件下反复调用 action expert，用 Euler 法积分 `A^(tau+delta) = A^tau + delta v_theta(...)`，论文使用 10 个积分步得到连续 action chunk。VLM 前缀的 key/value 可以缓存，每次只重新计算动作后缀，因此比每一步都完整运行 33 亿参数模型便宜。

Action expert 的含义：它不是独立的低层控制器，也不是另一个完整 Transformer；它是与 VLM backbone 层数对应的一套较小 Transformer 权重，专门处理 VLM 预训练时没见过的 state/action token。两套 expert 通过共享 attention 交互：VLM负责“看懂场景和指令”，action expert负责“把理解变成高精度连续动作”。

跨 embodiment 训练：预训练混合了自有的 7 种机器人配置、68 类任务以及 OXE 等开放数据，总量超过 10000 小时。不同机器人的状态和动作维度统一填充到最大 18 维，缺失相机也使用 mask；语言标签既有整段任务名，也有约 2 秒子轨迹的细粒度指令。模型由数据中的机器人配置和观测学习不同维度的含义，而不是让所有机器人共享相同关节。

训练分两阶段：pre-training 使用大规模、多任务且质量不完全一致的数据，学习广泛技能、场景覆盖和纠错行为；post-training 使用较小但高质量、策略一致的任务数据，把基础模型适配到洗衣折叠、收拾桌面等复杂任务。基础模型可以执行预训练覆盖范围内的语言指令，但高难任务通常仍需要后训练；超长任务有时还由高层 VLM 把总指令拆成短期子指令。

与前两篇的关系：ACT提出 action chunk，但直接回归且推理固定 `z=0`；Diffusion Policy从噪声迭代生成动作块，但视觉编码器和策略通常按单任务训练；pi0保留生成式 action chunk，将 diffusion-style 生成改为 flow matching，并接入经过互联网图文预训练的 VLM和大规模跨机器人数据。它的主要贡献是架构和训练体系的整合，而不是首次提出 action chunk、flow matching或VLM。

需要注意：pi0本质上仍是大规模行为克隆，不是RL、World Model或显式规划器；“zero-shot”主要指预训练任务和数据分布内的组合泛化，不代表任意新机器人和任意新技能都能直接完成。动作维度padding只是输入输出格式统一，不能自动解决不同机器人动力学和控制频率的差异；复杂任务仍依赖大量私有数据、后训练以及有时额外的高层策略，训练成本和数据门槛很高。

核心创新是构造了一个适合机器人控制的 VLA 接口：用 PaliGemma 继承语义知识，用独立 action expert 避免机器人 token 破坏原有VLM表示，用 flow matching并行生成连续高频动作块，再通过跨 embodiment 预训练与高质量 post-training 获得广度和灵巧性。
