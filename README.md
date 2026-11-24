# royrenyu.github.io

公司内部团建用的 **狼人杀上帝（DM）控制台**，单文件 HTML。

## 线上地址

https://royrenyu.github.io/

## 玩法

- **上帝端**：直接打开上面链接（不带 `#room=` 参数）即为控制台，负责流程、计时、结算。
- **玩家端**：上帝在控制台点「在线选号」建房间，复制生成的 `#room=xxx` 链接发到群里；每人点进来选自己的座位号，等上帝开局发牌后在手机上翻牌看身份。

## 说明

- 页面本身是纯静态单文件，选号房间数据走公共临时云存储，需要联网。
- `index.html` 由 GitHub Actions 从源地址同步生成，改内容请改源文件后重跑 workflow（Actions → Seed index.html → Run workflow）。
{"mime":"application/x-doubao-infinite-canvas+json","version":1,"token":"clipboard-token:1c53e9ba-d30a-4489-b7bd-05f6762880a9"}
