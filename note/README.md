# 具身智能论文笔记站

这是一个只读展示页。网站内容来自仓库根目录的 `notes/*.md` 文件。

## 更新方式

1. 在 `notes/` 里新增或修改 Markdown 笔记。
2. 如果有 PDF，把 PDF 放进仓库根目录的 `source/`。
3. 提交并 push 到 GitHub。
4. GitHub Pages 会自动部署。

```powershell
git add notes source
git commit -m "Update paper notes"
git push
```

## Markdown 笔记格式

`category` 是网页左侧树形目录的大类。没写时会自动归到“待定”。
`tags` 是论文的小标签，可以写一个或多个，用英文逗号隔开。

```markdown
---
title: "论文标题"
authors: "作者"
year: "2026"
venue: "会议/期刊"
category: "待定"
tags: "grasping, embodied-ai"
pdf: "source/example.pdf"
summary: "一句话总结"
---

# 论文标题

## 核心问题
- 

## 方法
- 

## 实验与结论
- 

## 我的理解
- 
```
