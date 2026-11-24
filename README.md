# royrenyu.github.io

**狼人杀上帝（DM）控制台**

## 线上地址

https://royrenyu.github.io/

## 玩法

<img src="./assets/usage.png" alt="控制台使用说明" width="460">

## 说明

- 页面本身是纯静态单文件，选号房间数据走公共临时云存储，需要联网。
- `index.html` 由 GitHub Actions 从源地址同步生成，改内容请改源文件后重跑 workflow（Actions → Seed index.html → Run workflow）。
- 上方使用说明图由 Actions 下载到 `assets/usage.png`，同样在重跑时同步。
