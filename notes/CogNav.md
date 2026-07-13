---
title: "CogNav: Cognitive Process Modeling for Object Goal Navigation with LLMs"
authors: "Yihan Cao, Jiazhao Zhang, Zhinan Yu, Shuzhen Liu, Zheng Qin, Qin Zou, Bo Du, Kai Xu"
year: "2025"
venue: "ICCV"
category: "导航"
tags: "embodied-ai, navigation, object-goal-navigation, LLM, cognitive-map, semantic-map, zero-shot, open-vocabulary"
status: "精读"
pdf: "source/processing/CogNav.pdf"
summary: "通过在线构建异构认知地图，并让 LLM 在五种认知状态之间进行调度和选择长期目标，实现开放词汇、零样本的 Object Goal Navigation。"
---
在线建图，建的是认知图（物体之间的关系）和二维图。
并且记录重要的地点作为备选目标。

认知状态是人为设计的，包括：
1. Broad Search：没有目标线索时，广泛探索未知区域。
2. Contextual Search：根据目标和房间、物体的关系，优先探索可能存在目标的区域。
3. Observe Target：发现疑似目标后靠近观察。
4. Candidate Verification：从其他位置继续观察，验证疑似目标，避免误检。
5. Target Confirmation：确认目标后靠近并停止。

使用 LLM 选择当前的认知状态和长期目标点，具体路径仍然由传统规划器完成。
