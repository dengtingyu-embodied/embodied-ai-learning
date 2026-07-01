# embodied-ai-learning

具身智能论文学习笔记站。

网站入口：`index.html`

笔记站目录：`note/`

## 更新笔记

把新的 Markdown 笔记放进 `notes/`，然后：

```powershell
git add notes
git commit -m "Update paper notes"
git push
```

也可以用一键脚本：

```powershell
.\scripts\publish-notes.ps1 "Update paper notes"
```

push 后 GitHub Pages 会自动部署到：

```text
https://dengtingyu-embodied.github.io/embodied-ai-learning/
```
