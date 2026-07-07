---
title: "GraspVLA: A Grasping Foundation Model Pre-trained on Billion-scale Synthetic Action Data"
authors: "Shengliang Deng, Mi Yan, Songlin Wei, Haixin Ma, Yuxin Yang, Jiayi Chen, Zhiqi Zhang, Taoyu Yang, Xuheng Zhang, Wenhao Zhang, Heming Cui, Zhizheng Zhang, He Wang"
year: "2025"
venue: "CoRL"
category: "抓取"
tags: "grasping, VLA, two-finger, language-based, dataset"
status: "已读"
pdf: "source/processing/GraspVLA.pdf"
summary: "提出 SynGrasp-1B 合成抓取数据集，并用 Progressive Action Generation 将互联网语义数据与合成动作数据联合训练成面向抓取的 VLA foundation model。最后得到一个可以根据语义和视觉图像执行特定抓取任务的模型"
---

## 与之前的二指抓取的区别
可以基于语义
闭环的抓取

## 数据集的建立
我们用一些曾经的方法在仿真中得到抓取方式
然后讲每帧截出来弄成一个巨大的视频数据集
## 模型
分为三个步骤
首先是根据语义预测我们要抓的东西的矩形边框，这里不仅用我们那个数据集，还要用互联网上的数据，增加泛化性
然后是预测抓取位姿
最后是预测运动链条，这里是以4步为单位，采用flowmatching。
4步走完重新进行上面三个步骤，所以说是闭环。

## 补充
flow matching 
一种针对模仿学习的优化
即对于要学习的A_0,我们采样一个噪声z，把A_0和z按1-t和t加权平均得到A_t,我们的网络学习怎么把A_t变成A_0
这样我们可以学出多峰的结构,而不是简单l2loss的平均,类似于diffusion的策略.
完全类似于diffusion，我们推理的时候t也是慢慢变
