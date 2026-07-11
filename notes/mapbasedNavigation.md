---
title: "Object Goal Navigation using Goal-Oriented Semantic Exploration"
authors: "Devendra Singh Chaplot, Dhiraj Gandhi, Abhinav Gupta, Ruslan Salakhutdinov"
year: "2020"
venue: "NeurIPS"
category: "导航"
tags: "embodied-ai, navigation, object-goal-navigation, semantic-map, exploration, map-based"
status: "略读"
pdf: "source/processing/mapbasedNavigation.pdf"
summary: "提出 Goal-Oriented Semantic Exploration，通过构建 episodic semantic map 并基于目标物体类别选择长程目标，解决 Object Goal Navigation 中的探索与长期规划问题。"
---
传统的导航方法
1.Frontier-Based
frontier指地图边界
地图是离散的，并且是把3d的压成2d的
不断地扩展frontier，直到找到目标
2.端到端的强化学习模式
直接端到端预测动作
缺点：样本需求大，新房间泛化性差
本文的创新和方法：
首先是建图部分的改进
把普通的地图变成带语义的地图
然后是选择长期目标也就是frontier的方法
用一个网络的来选择
采用强化学习的策略来训练这个网络（奖励是靠近目标的距离）
然后移动的规划还是普通的规划