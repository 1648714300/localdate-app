# LocalDate 上架清单

状态（2026-11-19）：应用工程、内置数据、图标、5 张商店截图、双语商店文案、隐私政策、云端构建配置**均已完成**。下列事项按「谁必须动手」划分。

---

## 一、已经做完（无需你操作）

| 项目 | 位置 |
|---|---|
| 应用本体（离线 PWA + Capacitor 双端壳） | `index.html`、`js/`、`css/`、`manifest.webmanifest`、`sw.js` |
| 内置数据 411 地点 / 245 活动 / 26 餐饮 / 1140 时段 | `data/app-data.json` |
| 引擎自测 9 项全绿 | `node scripts/test_engine.js` |
| 应用图标 192/512/1024 + Feature Graphic | `assets/icons/`、`store/feature-graphic.png` |
| 5 张 1170×2532 商店截图 | `store/screenshots/` |
| 中英双语商店文案、关键词、分类、分级建议 | `store/metadata.txt` |
| 隐私政策（中英，含数据删除方式） | `privacy.html` |
| GitHub Actions 构建脚本（Android AAB；iOS 被 `if: false` 保护） | `.github/workflows/build.yml` |

---

## 二、必须由你本人完成（账号 / 付款 / 身份验证，无法代劳）

### A. Google Play（安卓）

1. 注册 Google Play Console 开发者账号，一次性缴 **$25**。需 Google 账号 + 身份验证（个人需身份证件，可能需信用卡验证 $1.xx）。
2. 完成开发者资料页（名称、邮箱、电话、网站）。
3. 创建应用 → 默认语言中文（简体）→ 应用类型「应用」→ 免费。
4. 填写应用清单：商店文案直接复制 `store/metadata.txt`；上传 `store/screenshots/` 至少 2 张、`store/feature-graphic.png`。
5. 隐私政策 URL：`https://wbapp-vygowtv1s65bjdj6i9uf2s.app.workbuddy.host/?sharecode=CDEAEFAV2Q`（需先完成第三节的 GitHub Pages 启用）。
6. 数据安全表单：全部选「不收集数据 / 不共享」，与隐私政策一致。
7. 内容分级问卷：按问卷作答，建议结果为 Everyone。
8. 目标受众：选「家庭/所有年龄」；如勾选儿童，会触发额外合规要求，本应用建议不选。
9. 上传 AAB：用云端构建产物（`actions/artifacts/localdate-android-aab`），或本地源码按 README 构建。
10. 发布国家/地区自选 → 提交审核。首次审核通常 1–7 天。

### B. App Store（苹果）

1. 加入 **Apple Developer Program**，**$99/年**（个人名义即可）。需 Apple ID + 双重认证 + 付款方式 + 可能的视频/电话验证。
2. 在 App Store Connect 创建 App，Bundle ID 填 `cn.localdate.planner`，SKU 填 `localdate-1`。
3. 在「App 信息」填副标题、隐私政策 URL、类别 Lifestyle（次要 Travel）；上传 6.9 英寸截图（本目录截图为 1170×2532，如被拒按提示补 1290×2796）。
4. 隐私营养标签：全部选「不收集数据」，与隐私政策一致。
5. 在 Xcode（**必须 macOS**）打开 `ios/App/App.xcworkspace`，选团队 → Archive → Distribute App → App Store Connect 上传；或用 Transporter 上传 IPA。
6. TestFlight 内部测试 → 添加测试信息（演示账号：无需账号）→ 提交审核。首次审核通常 1–3 天。

### C. 国内安卓市场（可选，非本次主线）

华为/小米/OPPO/vivo/应用宝通常需要：软件著作权证书、ICP 备案主体、隐私政策与第三方 SDK 清单。本应用无第三方 SDK，但各商店仍会要求企业/个人资质。若只上 Google Play 与 App Store，可跳过。

---

## 三、隐私政策链接（已完成）

隐私政策已发布并验证可访问（HTTP 200）：
`https://wbapp-vygowtv1s65bjdj6i9uf2s.app.workbuddy.host/?sharecode=CDEAEFAV2Q`

上架表单的隐私政策 URL 直接填这个。GitHub Pages 未启用（token 无 pages 权限），但不影响上架。

## 四、一处 GitHub 设置（影响云端构建，不影响上架）

GitHub Actions 需要 `workflow` 权限才能上传 `.github/workflows/build.yml`。当前本机 token 没有该 scope，因此**工作流文件只存在于本地工程与 zip 中，未推到 GitHub**。你在 GitHub 网页端手动新建该文件并粘贴本地同名内容即可；或在本地执行 `gh auth refresh -s workflow` 后让我重推。没有它也能上架：按 README 在本机构建 AAB 即可。

---

## 五、我能继续代做、但需要你先给凭据的部分

- 有 Google Play Console 账号后：我可以帮你填应用清单文案、生成 AAB 上传命令、逐项核对表单。
- 有 Apple Developer 账号与证书后：我可以配置 `exportOptions.plist`、写 CI 签名脚本、检查 IPA 包内容。
- 有 macOS 环境（或 GitHub Actions workflow 权限）后：我可以直接产出 iOS IPA。

## 六、发布前提醒

- 商店截图里的示例店名与价格来自公开资料，上市前建议抽查 3–5 家是否仍在营业。
- 隐私政策 URL 必须公开可访问，审核会点开检查。
- 应用内「清除本机学习记录」已实现，满足数据删除权要求。
