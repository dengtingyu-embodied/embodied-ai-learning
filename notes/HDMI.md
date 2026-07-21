---
title: "HDMI: Learning Interactive Humanoid Whole-Body Control from Human Videos"
authors: "Haoyang Weng, Yitang Li, Nikhil Sobanbabu, Zihan Wang, Zhengyi Luo, Tairan He, Deva Ramanan, Guanya Shi"
year: "2025"
venue: "arXiv"
category: "运动控制"
tags: "embodied-ai, humanoid, loco-manipulation, human-object-interaction, imitation-learning, reinforcement-learning, sim-to-real"
status: "待读"
pdf: "source/processing/HDMI.pdf"
summary: "从单目人类交互视频中恢复机器人与物体参考轨迹，再用RL联合跟踪人体动作、物体运动和接触关系，学习接触丰富的全身loco-manipulation技能。"
---
HDMI要解决的是：普通motion tracking只模仿人体动作，但推门、搬箱子等任务还要求物体按照参考轨迹运动并维持正确接触；这类humanoid-object interaction数据又很难直接在机器人上收集。

首先从单目RGB视频中用GVHMR恢复SMPL人体动作，再通过LocoMujoco retarget到Unitree G1；同时后处理并标注物体轨迹、接触点和是否发生接触。最终每一帧都包含机器人参考姿态、物体位姿或关节状态，以及定义在物体局部坐标系中的目标接触点。

人有一段参考录像，然后人工标注接触点和是否接触
然后由参考录像先得到一个q_ref

然后我们最后是q_ref+delta q
deltaq由下方的方式得到

然后使用PPO训练robot-object co-tracking策略：它不仅跟踪机器人全身参考动作，还要跟踪物体轨迹和人-物接触关系。主要有三个设计：
1. Unified Object Representation：将物体状态和接触点统一表示在机器人根节点坐标系中，同时兼容刚体和门、折叠椅等关节物体。
2. Residual Action Space：策略输出参考关节角上的残差，即`q_target = q_ref + delta q`，让探索围绕人类参考动作进行，避免从默认站姿探索时突然起身或失衡。
3. Unified Interaction Reward：目标肢体需要靠近指定接触点并产生、维持合适接触力，同时结合机器人和物体轨迹跟踪奖励。

训练后的策略可以zero-shot部署到Unitree G1，完成开门穿越、搬箱子等任务。核心创新是把motion tracking扩展为robot-object-contact共同跟踪，使普通人类视频能够作为接触丰富技能的参考数据。

需要注意：视频只用于离线生成参考轨迹，真机策略不是视觉端到端模型；当前部署仍依赖MoCap提供物体位姿等真值，而且每个技能需要单独训练一套specialist policy。
