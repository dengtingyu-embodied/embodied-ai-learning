---
title: "GAPartNet: Cross-Category Domain-Generalizable Object Perception and Manipulation via Generalizable and Actionable Parts"
authors: "Haoran Geng, Helin Xu, Chengyang Zhao, Chao Xu, Li Yi, Siyuan Huang, He Wang"
year: "2023"
venue: "CVPR"
category: "操作"
tags: "embodied-ai, object-perception, manipulation, parts, dataset, domain-generalization"
status: "待读"
pdf: "source/processing/GAPartNet.pdf"
summary: "提出 Generalizable and Actionable Parts 定义与 GAPartNet 数据集，用于跨类别部件分割、部件位姿估计和基于部件的物体操作。"
---
# 主要思想
机器人的操作主要是针对部件的类别而非整体
定义9种GAPart，G指视觉特征通用，A指操作性通用
# 模型
## 1.跨类别分割
主要创新在于提高泛化性
采用了一种对抗域的方式。
就是对于部件的类别和所属物品的类别，我们不希望它通过后者来判断。
所以我们的特征提取网络后面接一个物品类别判别的网络，然后梯度正传给后面的网络，但是反传给前面的网络，这样我们的特征就都是部件的而非背景物品的。
## 2.部件位姿估计
每个点估计之后RANSAC然后回归
## 3.基于部件的物体操作
不同部件不同操作，启发式
