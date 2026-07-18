---
title: "OmniH2O: Universal and Dexterous Human-to-Humanoid Whole-Body Teleoperation and Learning"
authors: "Tairan He, Zhengyi Luo, Xialin He, Wenli Xiao, Chong Zhang, Weinan Zhang, Kris M. Kitani, Changliu Liu, Guanya Shi"
year: "2024"
venue: "CoRL"
category: "运动控制"
tags: "embodied-ai, humanoid, whole-body-control, teleoperation, motion-tracking, sim-to-real, reinforcement-learning"
status: "待读"
pdf: "source/processing/OmniH2O.pdf"
summary: "提出以稀疏运动学姿态为统一接口的全身遥操作与学习系统：将具有完整状态的 RL teacher 蒸馏为可在真机部署的三关键点 motion tracker。"
---
OmniH2O要解决的是：只根据头和双手等稀疏人体输入，实时控制人形机器人完成稳定、灵活的全身动作，并进一步用遥操作收集的数据训练自主策略。

首先将大规模人体动作retarget到Unitree H1，并用仿真中的motion tracker筛掉机器人无法完成的动作，同时增加固定下半身的站立和下蹲动作，提高静止稳定性。

控制策略采用teacher-student：
1. Teacher使用PPO训练，能够看到所有刚体的完整参考动作、全局位置和速度等仿真特权信息，因此容易学会高质量motion tracking。
2. Student通过DAgger模仿Teacher，只输入头和双手三个关键点目标，以及关节角、关节速度、重力方向、根节点角速度和历史动作等25步本体历史。历史信息用于隐式估计速度，因此真机不需要MoCap提供全局线速度。

Student输出身体关节目标，再由PD执行；灵巧手根据VR估计的手部姿态，通过IK和单独的手部控制器执行。

三个关键点组成统一的kinematic pose接口：目标既可以来自VR或RGB人体姿态，也可以来自语言动作生成模型、GPT-4o或用遥操作数据训练的Diffusion Policy。低层tracker只负责稳定执行，不关心目标由谁生成。

核心创新是将稀疏人体输入、全身Sim2Real控制、灵巧手遥操作和自主策略学习接到同一个运动学接口上。相比H2O，它将输入减少为头和双手三点，去掉对全局线速度和外部MoCap的依赖，并用privileged teacher蒸馏提升跟踪性能。
