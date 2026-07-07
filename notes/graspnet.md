---
title: "GraspNet-1Billion: A Large-Scale Benchmark for General Object Grasping"
authors: "Fang et al."
year: "2020"
venue: "CVPR"
category: "抓取"
tags: "grasping, benchmark, two-finger, dataset"
status: "已读"
pdf: "source/processing/GraspNet.pdf"
summary: "提出面向通用物体抓取的大规模数据集、评价标准与基准任务以及端到端的网络结构。"
---

## 主要贡献
1.一个大的抓取位姿和真实场景的数据集，以及在线评测抓取位姿分数的网站。
2.一种端到端的6d抓取位姿网络结构

## 数据集构建
采用的是场景真实采集+位姿采集和打分用物理仿真
构建统一的在线打分体系，让以后的研究能有一个同度量的标准。

## 网络结构
pointnet--在点云中寻找grasppoint，并提取特征
approachnet--预测机械臂横向平面的接近方向，针对每个grasppoint算（利用前面得到的特征），其实是给v个方向打分。
operationnet--预测机械臂深入的距离和旋转的角度，以及夹爪宽度，并给这次抓取一个confidence。
tolerancenet--预估鲁棒性
最后选打分较好的里面鲁棒性最好的

## 评价
几乎解决了二指夹爪的抓取问题。
网络部分，很像是dex-net的改进，在采样进行了2d到6d的升级。
