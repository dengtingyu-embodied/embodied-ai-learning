---
title: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"
authors: "Tony Z. Zhao, Vikash Kumar, Sergey Levine, Chelsea Finn"
year: "2023"
venue: "RSS"
category: "模仿学习"
tags: "embodied-ai, imitation-learning, bimanual-manipulation, behavior-cloning, action-chunking, transformer, CVAE"
status: "待读"
pdf: "source/processing/ACT.pdf"
summary: "提出 ALOHA 双臂遥操作系统与 Action Chunking with Transformers，通过一次预测动作序列、CVAE 建模示范差异和 temporal ensemble 平滑执行，以少量真实示范学习精细双臂操作。"
---
几个比较聪明的点：
一种解决平均式分布的方法：CVAE
先用当前关节状态 + 真实未来动作序列->风格变量z
图像 + 当前关节状态 + z->预测未来动作序列
L1 loss要求动作预测准确
KL loss让z包含的信息也不能很多，不能直接传答案

ai的总结:
ACT 要解决的是：普通行为克隆每一步只预测一个动作，在长时序精细操作中容易产生累积误差；同时，同一状态下人类示范可能包含暂停、快慢和不同操作风格，使单步回归难以稳定拟合。

数据由 ALOHA 主从臂遥操作收集。观测包括四个相机的 RGB 图像和双臂当前关节位置，动作是双臂下一时刻的绝对目标关节位置，并由底层 PID 控制器跟踪。每个任务约使用 50 条、约 10 分钟的真实示范，模型按任务单独训练。

ACT 的核心流程：
1. ResNet18 将多视角图像编码为空间特征，加上二维位置编码；当前关节位置也被编码为 token。
2. Transformer 融合多视角图像、关节状态和 CVAE 的风格变量 `z`。
3. Transformer decoder 不只预测下一步，而是一次输出未来 `k` 步目标关节位置，即 action chunk。
4. 推理时每个时刻都重新预测一个 action chunk；同一未来时刻会收到多个历史 chunk 的预测，再通过指数加权的 temporal ensemble 得到最终动作。

三个关键设计：
1. Action Chunking：将 `o_t -> a_t` 改为 `o_t -> [a_t, ..., a_{t+k-1}]`，把长任务压缩成较少的动作段，并在一段内部保持动作连贯，从而缓解单步行为克隆的累积误差和示范中的短暂停顿。
2. CVAE：训练时，encoder 根据当前关节状态和真实未来动作序列得到风格变量 `z`；policy 根据图像、关节状态和 `z` 重建整段动作。损失由动作序列的 L1 重建损失和约束 `z` 接近标准高斯的 KL loss 组成。推理时丢弃 CVAE encoder，并固定 `z=0`，因此最终策略是确定性的。
3. Temporal Ensemble：策略每一步都重新观察并预测未来动作；对于同一个执行时刻，将不同时间生成的重叠预测进行加权平均。它不是平均相邻时刻的动作，而是平均“对同一时刻的多个预测”，兼顾平滑性和视觉闭环纠错。

需要注意：ACT 仍然是按任务训练的离线行为克隆，不具备语言条件、多任务泛化或主动收集失败恢复数据的能力；action chunk 也不是完全开环执行，论文效果较好的版本会每一步重新预测并做 temporal ensemble。CVAE 虽然用于建模示范的多样性，但推理固定 `z=0`，重点更偏向稳定地拟合人类数据，而不是运行时采样多种策略。

核心创新不是单独使用 Transformer，而是把 action chunk、CVAE 和 temporal ensemble 组合成适合高频精细操作的视觉模仿策略；ALOHA 则提供了低成本、高质量的双臂遥操作数据采集系统。
