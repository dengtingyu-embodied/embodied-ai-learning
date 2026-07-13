---
title: "Uni-NaVid: A Video-based Vision-Language-Action Model for Unifying Embodied Navigation Tasks"
authors: "Jiazhao Zhang, Kunyu Wang, Shaoan Wang, Minghan Li, Haoran Liu, Songlin Wei, Zhongyuan Wang, Zhizheng Zhang, He Wang"
year: "2025"
venue: "RSS"
category: "导航"
tags: "embodied-ai, navigation, VLA, video, multi-task, unified-navigation, sim-to-real"
status: "待读"
pdf: "source/processing/UniNaVid.pdf"
summary: "在 NaVid 的视频 VLM 导航框架上统一 VLN、ObjectNav、EQA 和 Human Following 四类任务，并通过在线视觉 token 合并和多步动作预测提高长程导航效率。"
---
实际上是NaVid的多任务和高效率版本，仍然是历史RGB视频+语言指令直接预测动作。

Uni表示统一四种导航任务：
1. VLN：根据语言路线导航。
2. ObjectNav：寻找指定物体。
3. EQA：导航到相关位置后回答问题。
4. Human Following：根据语言描述跟随指定的人。

把不同任务都转换成统一的语言指令、视频输入和动作输出，用同一个模型联合训练。

编码上将视频分为当前、短期和长期记忆：当前帧保留64个token，短期帧保留4个，长期帧保留1个，并继续合并相似的长期token。

模型一次预测未来4个离散动作，而不是每一步都等待模型推理，使运行速度提升到约5Hz。

训练数据包括360万条多任务导航样本和230万条互联网视频问答、描述数据。主要创新是多任务统一、在线token合并和多步动作预测，不是提出全新的基础模型结构。
