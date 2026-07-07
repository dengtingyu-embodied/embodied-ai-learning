---
title: "DexGraspNet: A Large-Scale Robotic Dexterous
Grasp Dataset for General Objects Based on Simulation"
authors: "Ruicheng Wang et al."
year: "2023"
venue: "ICRA"
category: "抓取"
tags: "grasping, Dexterous, robotics, benchmark, dataset"
status: "已读"
pdf: "source/processing/DexGraspnet.pdf"
summary: "大规模生成灵巧手抓取的方法"
---

# 前置知识
关于灵巧手的抓握
## 1.Graspit!
采用的是首先大概确定一个抓握位姿（早期人工标注，后期根据物体形状生成）
然后手指开始闭合直到接触
## 2.可微能量
设定一个可微总能量，然后直接跑梯度下降。

# 本文的抓握生成方式
## 1.生成一个相对正确的结果
对于物体我们构造一个凸包，并且向外扩展一点
然后我们把一个舒展的手型随机的放在凸包上，并朝向凸包内部（过程中有很多小扰动从而保证多样性）
## 2.可微能量方式进一步调整
能量的设计
Efc--鼓励抓握形成 force closure
Edis--鼓励接触点靠近物体表面
Epen--惩罚手插进物体
Espen--防止手自己和自己穿透
Ejoint--防止关节角超过上下限
其中接触点的选择是在人工标注的120个点中随机选择4个
Efc是直接算当前所有方向都施加单位的力，总的力接近0。（节约成本，类似于Q1）
# 扩展
Q1质量判断
可以理解成判断一个严谨的forceclosure判断
甚至可以框定一个在有扰动时能维持平衡的区域，然后算原点最小属于球
这个半径就是对扰动的抗性
本文末尾测试时使用的DDG网络（输入物体观测，预测手的抓取位姿）
DDG简单的来说实际上几乎不管抓取这个任务本身，直接就是模仿学习数据集的TRtheta
只是最后还加了一个q1的loss
根据流程我们就能发现DDG很吃数据集，所以这个dexgraspnet就对DDG提升相对大
# 评注和思考
根据现在的灵巧手抓取确实很难，比二指抓取难多了。
还是很像人类给它一种固定的模式在抓取。
数据集的人工设计味还是很重，而像DDG这种算法又几乎是模仿数据集。
我还是觉得应该要给灵巧手上加传感器，观测数据实际上还是不够。