# embodied-ai-learning

具身智能论文学习笔记站。

网站地址：

```text
https://dengtingyu-embodied.github.io/embodied-ai-learning/
```

## 更新笔记

把新的 Markdown 笔记放进 `notes/`，然后提交并 push：

```powershell
git add notes source
git commit -m "Update paper notes"
git push
```

也可以用一键脚本：

```powershell
.\scripts\publish-notes.ps1 "Update paper notes"
```

网站会自动读取 `notes/*.md` 并重新部署。

网页左侧会按每篇笔记开头的 `tags` 自动生成分类按钮，例如：

```yaml
tags: "grasping, benchmark, dataset"
```

PDF 放在 `source/`，在 Markdown 的开头写：

```yaml
pdf: "source/example.pdf"
```
