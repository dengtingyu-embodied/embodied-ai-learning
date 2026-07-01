# 具身智能论文笔记站

打开 `index.html` 就能使用。数据会自动保存在当前浏览器里。

## 免费上线方式

推荐用 GitHub Pages。把整个 `note` 文件夹上传到一个公开 GitHub 仓库，然后在仓库的 Settings -> Pages 里选择发布分支即可。

上线后地址一般是：

```text
https://你的GitHub用户名.github.io/仓库名/
```

根目录的 `index.html` 会自动跳到 `note/`。不需要买域名。域名只是让网址更好看，以后想换再绑定也可以。

## 最简单的更新方式

正式发布笔记时，把 `.md` 文件放到仓库根目录的 `notes/` 文件夹，然后提交并 push。

```powershell
git add notes
git commit -m "Update paper notes"
git push
```

页面右上角的“导入笔记”和“新建”适合临时整理草稿；要让别人也能看到，最终还是放进 `notes/` 并 push。

## Markdown 笔记格式

```markdown
---
title: "论文标题"
authors: "作者"
year: "2026"
venue: "会议/期刊"
tags: "grasping, embodied-ai"
status: "待读"
pdf: "../test/pdf2zh-output/example.pdf"
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
