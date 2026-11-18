# LocalDate · 约会方案生成器（移动版）

把「约会去哪」变成 15 个能直接落地的方案。纯前端、离线优先、不收集个人信息；同一套代码可打包为 PWA、Android AAB 与 iOS IPA。

## 功能

- 一键生成 15 个方案：10 个淮南本地 + 4 个近圈 + 1 个远途
- 每个方案 4 行白描腔：去哪、花多久、做什么、吃什么、怎么邀她
- ♥ / × 反馈写入本机 Elo 权重（K=24，衰减 λ=0.05，UCB c=40）
- 落选降权不封杀；同轮零重复，跨轮最多保留 2 条
- 内置 411 个地点、245 类活动、26 家餐饮、84 条氛围、1140 个时段
- 全部离线，无账号、无网络请求、无第三方 SDK

## 快速开始

```bash
# 浏览器预览（任意静态服务器）
python -m http.server 8080
# 打开 http://localhost:8080
```

PWA：用 Chrome/Edge 打开后点「安装应用」；iOS 用 Safari 打开后「添加到主屏幕」。

## 打包原生应用

```bash
npm install
npx cap add android     # 或 npx cap add ios（iOS 需 macOS）
npx cap sync
cd android && ./gradlew bundleRelease   # 产出 app/build/outputs/bundle/release/app-release.aab
```

iOS 在 macOS 上执行 `npx cap open ios`，用 Xcode 选择团队后 Archive → Distribute App。

也可使用 `.github/workflows/build.yml` 在 GitHub Actions 云端构建 Android AAB（无需本机 JDK / Android SDK）。

## 数据更新

数据源是 `localdate` skill 的 `city-packs/huainan/catalog/`，只使用合规公开来源，不含爬虫数据。

```bash
python scripts/build_data.py     # 重新编译 data/app-data.json
python scripts/make_assets.py    # 重新生成图标与商店截图
node scripts/test_engine.js      # 零依赖自测
```

## 目录

| 路径 | 用途 |
|---|---|
| `index.html` / `css/` / `js/` | 应用本体 |
| `data/app-data.json` | 内置要素池（270 KB） |
| `scripts/` | 数据编译、素材生成、自测 |
| `store/` | 图标、Feature Graphic、5 张截图、商店文案 |
| `privacy.html` | 隐私政策（中英双语） |
| `SUBMISSION.md` | 上架清单与责任边界 |
| `.github/workflows/build.yml` | 云端构建配置 |

## 许可

MIT，见 `localdate` 项目仓库。
