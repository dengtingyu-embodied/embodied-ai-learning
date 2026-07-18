---
title: "ASAP: Aligning Simulation and Real-World Physics for Learning Agile Humanoid Whole-Body Skills"
authors: "Tairan He, Jiawei Gao, Wenli Xiao, Yuanhang Zhang, et al."
year: "2025"
venue: "arXiv"
category: "运动控制"
tags: "embodied-ai, humanoid, whole-body-control, motion-tracking, sim-to-real, reinforcement-learning"
status: "待读"
pdf: "source/processing/ASAP.pdf"
summary: "提出两阶段的 Sim2Real 全身运动跟踪框架：先在仿真中预训练 tracker，再利用真机轨迹学习 delta action 补偿动力学误差，并据此微调策略。"
---
前面的知识：
想要通过视频跟踪动作，大体上分为两步首先从视频中把关节旋转角度得到，再控制机器人达到该角度
从视频中把关节旋转角度得到--TRAM
首先SMPL人体模型
类似于树形结构，从根节点骨盆出发，最后得出的结构是根节点的位姿以及每个23个关节的角度
TRAM的网络
先提取特征->帧与帧之间transformer->预测->再transformer
得出大概需要的角度之后，在模拟器中验证这个角度是否合理
然后用强化学习的方式来模仿这个角度，奖励是接近这个角度，但是保证不能摔倒
补充：SMPL 输出的是人体根节点的全局位姿、人体关节姿态和形状参数；它和 G1 的 23 个可控关节并不一一相同。需要经过物理可行性筛选和 motion retargeting，才得到机器人要跟踪的参考轨迹。

TRAM 只是本文使用的上游视频人体动作恢复方法，ASAP 本身并没有提出新的 pose estimation 或 retargeting 算法。

本文的创新：
Delta Action Model微调模拟器，减少sim2real
不是直接学deltasim而是deltaaction这样可以保证符合物理规律几乎
ai:
1. Delta Action Model：收集预训练 tracker 在真机上的状态-动作-下一状态轨迹。将真机状态 `s_r` 作为仿真初始状态，并在真机动作 `a_r` 上加残差 `delta a`；训练这个残差使仿真的下一状态接近真机的下一状态。它直接在动作层补偿未建模动力学，而不必显式辨识质量、摩擦、电机等物理参数。
2. 先对齐模拟器、再微调 tracker：固定学到的 delta action，将其放入仿真器中，得到更像真机的状态转移；随后在该环境中微调原来的 tracker。最终真机只部署微调后的 tracker，不部署 delta action model。

所以它的核心不是新的 whole-body tracking 架构，而是一种利用少量真机 rollout 改造训练动力学、提升敏捷动作 Sim2Real 的后训练方法。
