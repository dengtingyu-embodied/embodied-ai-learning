---
title: "NaVid: Video-based VLM Plans the Next Step for Vision-and-Language Navigation"
authors: "Jiazhao Zhang, Kunyu Wang, Rongtao Xu, Gengze Zhou, Yicong Hong, Xiaomeng Fang, Qi Wu, Zhizheng Zhang, He Wang"
year: "2024"
venue: "RSS"
category: "导航"
tags: "embodied-ai, navigation, vision-and-language-navigation, VLM, video, end-to-end, sim-to-real"
status: "待读"
pdf: "source/processing/Navid.pdf"
summary: "提出基于视频视觉语言模型的导航智能体 NaVid，仅使用语言指令和单目 RGB 视频记录导航历史，并直接预测下一步导航动作。"
---
实际上就是一个历史视频数据+语言指令的端到端模型，不需要显式地图、深度和里程计，直接预测下一步动作。

模型基于LLaMA-VID，编码上主要有两个处理：
1. 每帧同时生成与指令相关的token和保存整体场景信息的token。
2. 当前帧保留64个场景token，用于精细决策；每个历史帧只保留4个，用于记录导航进度并减少计算量。

输出为前进、左转、右转或停止；前进会同时预测距离，转向会同时预测角度。

训练数据包括专家轨迹、模型自己运行产生的非专家轨迹，以及根据轨迹反推语言指令的辅助任务，提升走错后的恢复能力和指令理解能力。

主要创新不是新模型或新导航算法，而是将视频VLM适配到连续导航，并设计当前帧与历史帧的差异化编码，验证了只使用RGB视频进行闭环导航和Sim2Real的可行性。
