---
title: "Dex-Net: A Cloud-Based Network of 3D Objects for Robust Grasp Planning"
authors: "Mahler et al."
year: "2017"
venue: "ICRA"
category: "抓取"
tags: "grasping, two-finger, , dex-net, robotics, fundamental"
status: "已读"
pdf: "source/processing/Dex-Net.pdf"
summary: "通过采样抓取位姿和构建评价网络来解决鲁棒的二指抓取问题"
---

## 主要解决的问题
二指夹爪抓取指定物品，要求泛化性和鲁棒性

## 方法
-采样抓取位姿——基于深度图，找深度的边缘
-构建评价网络
-数据通过物理方式计算

## 我想继续看
改进方向——主要是采样抓取位姿的部分

## 一些关键性的问题
为什么要构建评价网络而非直接预测位姿？
因为解法可能很多，并无法简单的学习。
