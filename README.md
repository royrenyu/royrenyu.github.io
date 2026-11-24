# royrenyu.github.io
**狼人杀上帝（DM）控制台**
## 线上地址
https://royrenyu.github.io/
## 玩法
<img src="./assets/usage.png" alt="控制台使用说明" width="460">
## 说明
- 页面本身是纯静态单文件，选号房间数据走公共临时云存储，需要联网。
- `index.html` 由 GitHub Actions 从源地址同步生成，改内容请改源文件后重跑 workflow（Actions → Seed index.html → Run workflow）。
- 往 main 推送任何非 index.html 的改动（包括改这份 README）也会自动触发一次同步，等于顺手拉取最新源文件。
- 上方使用说明图由 Actions 下载到 `assets/usage.png`，同样在重跑时同步。
## 更新记录
- 2026-11-24：通灵师改为每晚可查任意一名玩家的真实身份；机械狼改为一场一次学习，按学习对象继承技能，被查验时会伪装成学习对象。
