---
title: "VisualMimic: Visual Humanoid Loco-Manipulation via Motion Tracking and Generation"
authors: "Shaofeng Yin, Yanjie Ze, Hong-Xing Yu, C. Karen Liu, Jiajun Wu"
year: "2025"
venue: "arXiv"
category: "运动控制"
tags: "embodied-ai, humanoid, loco-manipulation, vision, motion-tracking, sim-to-real, reinforcement-learning"
status: "待读"
pdf: "source/processing/VisualMimic.pdf"
summary: "提出视觉 Sim2Real 的人形 loco-manipulation 框架：以通用低层关键点 tracker 提供全身动作先验，再由任务相关的视觉策略生成关键点指令。"
---
前面的知识:
在ASAP中我们其实漏说了由SMPL人体动作->G1关节角度的过程
有两种算法
PHC retargeting--先调整SMPL的shape参数，让人体骨架接近机器人骨架；然后优化机器人的根节点位姿和关节角，使正向运动学得到的关键点接近目标关键点。实现上直接对整段动作的L2误差做梯度下降，并通过clamp满足关节限位。缺点是速度较慢，而且没有显式考虑接触，可能出现脚滑、悬空或穿地。

GMR--同样是优化式retargeting，不是学习模型。它先匹配人体和机器人的关键body并对齐静止姿态，再对不同身体部位进行非均匀缩放；随后使用两阶段differential IK，先对齐身体朝向和手脚位置，再同时细化所有关键body的位置与朝向。上一帧结果会作为下一帧初值，因此速度更快、动作也更连贯。
简单来说就是一个梯度下降，一个加权最小二乘关节增量

VisualMimic任务--如何根据视觉完成推、踢、抬等任务
VisualMimic使用GMR把AMASS和OMOMO中的人体动作转换为机器人参考动作，再用这些数据训练低层motion tracker。
VisualMimic 要解决的是：机器人只用自身相机和本体状态，如何一边看物体、一边稳定地做全身移动和交互，例如推箱子、踢球、抬箱子。

它将控制拆成两层：
1. 低层是跨任务复用的 keypoint tracker。输入骨盆、头、双手和双脚等目标关键点的误差，输出关节目标；它负责平衡、步态和全身协调。
2. 高层是具体任务的 keypoint generator。输入深度图和本体状态，输出下一个关键点指令；它只需学习如何完成任务，不直接探索高维关节动作。

两层都使用 teacher-student：低层先用能看到未来完整人体动作的 motion tracker 当 teacher，再蒸馏为只看当前关键点指令的 tracker；高层先用真值物体状态训练 teacher，再蒸馏为只看深度图的视觉策略。
这两层的teacher训练都是PPO

为防止高层 RL 输出不自然、低层无法跟踪的关键点指令，作者对低层训练注入指令噪声，并将高层输出裁剪在从人类动作数据统计得到的 Human Motion Space 内。

核心创新不是新的 retargeting 或低层控制器，而是把“人类动作先验的 keypoint tracker”作为通用接口，连接到任务相关的视觉 RL；训练全在仿真中完成，部署到 Unitree G1 时只使用机载 RealSense 深度图和本体状态。
