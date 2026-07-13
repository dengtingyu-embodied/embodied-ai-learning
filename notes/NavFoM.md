---
title: "Embodied Navigation Foundation Model"
authors: "Jiazhao Zhang, Anqi Li, Yunpeng Qi, Minghan Li, Jiahang Liu, Shaoan Wang, Haoran Liu, Gengze Zhou, Yuze Wu, Xingxing Li, Yuxin Fan, Wenjun Li, Zhibo Chen, Fei Gao, Qi Wu, Zhizheng Zhang, He Wang"
year: "2026"
venue: "ICLR"
category: "导航"
tags: "embodied-ai, navigation, foundation-model, VLM, cross-task, cross-embodiment, multi-camera, trajectory-prediction"
status: "待读"
pdf: "source/processing/NavFom.pdf"
summary: "提出跨任务、跨机器人形态的导航基础模型 NavFoM，统一处理不同相机配置和视频历史，并直接预测可供底层控制器执行的轨迹。"
---
相对于uninavid主要改进是增加了一个跨机器人形态和相机配置
如何把多个机器人统一到一个模型上
首先是输出
我们把输出统一成轨迹点
然后是输入
加一个提示token表示这个视觉信息的参数（如时间和拍摄角度）
采用采样视觉帧数保持token数一致

AI的总结：
可以看作Uni-NaVid的进一步扩展：从统一多种导航任务，发展为同时统一任务、机器人形态、多相机配置和动作表示。

输入是单相机或多相机RGB视频+语言指令，模型覆盖轮式机器人、四足机器人、无人机和汽车，以及VLN、ObjectNav、目标跟踪和自动驾驶等任务。

模型主要有两个设计：
1. TVI Token：给视觉token加入时间和相机视角信息，让模型区分某个画面来自哪个时刻、哪个方向的相机。
2. BATS：在固定token预算下对历史帧动态采样，最近观察保留更多，较早观察采样更少，但不会完全丢弃。

视觉特征由DINOv2和SigLIP提取，当前观察保留64个细粒度token，历史观察保留4个粗粒度token。

与Uni-NaVid输出前进、转向等离散动作不同，NavFoM通过planning head一次预测8个waypoint，每个点表示位置和朝向`(x, y, z, yaw)`，再由不同机器人的本地规划器和控制器执行。

训练数据包括约802万条导航样本和476万条图像、视频问答样本。主要创新是统一多相机和跨embodiment输入、固定预算的历史采样以及统一轨迹输出，模型主体仍然是视觉编码器+LLM+轨迹预测头。
