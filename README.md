# Tulpa Helper

> 温暖沉浸型的 Tulpa 创建辅助桌面应用 —— 从准备到成熟，陪伴你与 Tulpa 共同成长的每一段旅程。

## 项目概述

Tulpa Helper 以四个阶段（准备期 → 创建期 → 发展期 → 成熟期）为框架，帮助实践者记录和追踪 Tulpa 创建的全过程。风格定位为温暖治愈、私密日记质感。

| 阶段 | 核心功能 |
|---|---|
| 🌱 准备期 | 特质蓝图、形态设计、Wonderland 构建、番茄钟 |
| ✨ 创建期 | 番茄钟（Narration/Forcing）、统一速记（`/T` 标记对话）、回应迹象记录 |
| 🗣️ 发展期 | 统一速记、自主性观察、Wonderland 互动、情感共振追踪 |
| 🤝 成熟期 | Imposition 等级追踪、Switching/Possession 练习、日常陪伴打卡、历程概览 |

**设计原则：** 本地优先（SQLite 离线存储）、阶段驱动、温暖沉浸型 UI、纯记录不替代实践（不含 AI/LLM）。

---

## 技术栈

| 层 | 选型 |
|---|---|
| 桌面框架 | Tauri v2（Rust 后端 + WebView 前端） |
| 前端 | React 18 + TypeScript + Tailwind CSS v4 |
| 状态管理 | Zustand |
| 本地存储 | SQLite（tauri-plugin-sql） |
| 移动端 | Tauri Mobile（Android APK） |

---

## 快速开始

### 环境要求

- Node.js ≥ 22
- Rust（[rustup](https://rustup.rs)）
- 系统依赖：
  - **Linux/WSL：** `libwebkit2gtk-4.1-dev libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
  - **Windows：** WebView2（通常已预装）
  - **macOS：** Xcode Command Line Tools
- **Android 构建额外需要：** JDK 21、Android SDK 34 + NDK 26.1

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/lingxi7562/tulpa-helper.git
cd tulpa-helper

# 2. 安装依赖
npm install

# 3. 启动开发模式（热重载）
npm run tauri dev

# 4. 构建发布版
npm run tauri build
```

### WSL 构建提示

```bash
# 将项目复制到 WSL 本地文件系统（避免跨文件系统性能问题）
rsync -a --exclude=node_modules --exclude=src-tauri/target /mnt/d/path/to/tulpa-helper/ /root/tulpa-helper/
cd /root/tulpa-helper && npm install
npm run tauri build
```

### Android APK 构建

```bash
# 需要 JDK 21 + Android SDK + NDK
# 初始化 Android 项目（仅首次）
npm run tauri android init

# 构建 ARM64 APK
npm run tauri android build -- --target aarch64
```

---

## 项目结构

```
tulpa-helper/
├─ src/
│  ├─ App.tsx                          # 根组件：视图切换、全局布局
│  ├─ App.css                          # 全局样式（Tailwind v4 @theme + 自定义组件）
│  ├─ main.tsx                         # React 挂载入口
│  ├─ constants/
│  │  └─ stages.ts                     # 阶段元数据（icon/color/name 单一来源）
│  ├─ db/
│  │  ├─ schema.ts                     # SQLite 表结构 + TypeScript 类型定义
│  │  └─ database.ts                   # 数据库初始化 + 完整 CRUD + 统计查询
│  ├─ stores/
│  │  ├─ useStageStore.ts              # 阶段状态（当前/解锁）
│  │  ├─ useEntryStore.ts              # 记录 CRUD + 分页加载
│  │  ├─ useTraitStore.ts              # 特质管理
│  │  └─ useTimerStore.ts              # 番茄钟状态
│  ├─ hooks/
│  │  ├─ useStats.ts                   # 统计数据聚合（总时长/阶段分解/趋势）
│  │  └─ useToast.ts                   # 全局 Toast 通知（Zustand store）
│  ├─ layouts/
│  │  ├─ PanelLayout.tsx               # 面板视图（侧边栏 + 内容区）
│  │  └─ TimelineLayout.tsx            # 时间线视图（纵向时间流 + 分页加载）
│  ├─ features/
│  │  ├─ stages/
│  │  │  ├─ StageSidebar.tsx           # 侧边栏阶段导航（解锁/切换）
│  │  │  ├─ PrepPanel.tsx              # 准备期面板（Traits + FocusTimer + Form/Wonderland 占位）
│  │  │  ├─ CreationPanel.tsx          # 创建期面板（统计卡片 + 番茄钟 + 速记）
│  │  │  ├─ DevelopmentPanel.tsx       # 发展期面板（番茄钟 + 速记 + 观察占位）
│  │  │  └─ MaturePanel.tsx            # 成熟期面板（番茄钟 + Imposition 网格 + 占位）
│  │  ├─ forcing/
│  │  │  └─ FocusTimer.tsx             # 番茄钟组件（紧凑模式/完整模式，全阶段通用）
│  │  ├─ dialogue/
│  │  │  └─ ScribbleInput.tsx          # 统一速记输入框（/T 前缀标记 Tulpa 回应）
│  │  ├─ traits/
│  │  │  └─ TraitManager.tsx           # 特质标签 CRUD 组件
│  │  └─ stats/
│  │     └─ StatsPanel.tsx             # 时间统计全屏视图（总时长/阶段/趋势/热力图）
│  └─ components/ui/
│     ├─ Button.tsx                    # 通用按钮（primary/secondary/ghost + 多尺寸）
│     ├─ Card.tsx                      # 卡片容器
│     ├─ Input.tsx                     # 输入框
│     ├─ Badge.tsx                     # 标签
│     ├─ IconButton.tsx                # 图标按钮
│     ├─ Toast.tsx                     # Toast 通知组件
│     └─ Heatmap.tsx                   # GitHub 风格热力图
├─ src-tauri/
│  ├─ src/lib.rs                       # Tauri 后端入口（SQL 插件注册）
│  ├─ Cargo.toml                       # Rust 依赖（tauri, tauri-plugin-sql）
│  ├─ tauri.conf.json                  # Tauri 配置（窗口/打包/签名）
│  └─ gen/android/                     # Android 项目文件（Kotlin + Gradle）
├─ .github/workflows/
│  └─ build.yml                        # CI/CD：Windows/Linux/Android 三平台自动构建
├─ docs/superpowers/
│  ├─ specs/                           # 设计规格文档
│  └─ plans/                           # 实现计划
└─ tailwind.config.js                  # Tailwind 主题色（brand/stage）
```

---

## CI/CD

推送 `master` 分支自动触发 GitHub Actions：

| 平台 | 产物 | 大约耗时 |
|---|---|---|
| 🪟 Windows | `tulpa-helper-windows.zip`（解压即用） | 5 min |
| 🐧 Linux | `tulpa-helper-linux.tar.gz`（解压即用） | 4 min |
| 📱 Android | `tulpa-helper-android.apk`（ARM64） | 8 min |

产物下载：[Actions 页面](https://github.com/lingxi7562/tulpa-helper/actions) → 最新 run → Artifacts

---

## 核心交互模式

### 双视图切换
- **面板视图：** 侧边栏阶段导航 + 功能卡片，日常操作主界面
- **时间线视图：** 纵向时间流，历史全览

### 番茄钟（全阶段通用）
- 默认 25 分钟倒计时
- 各阶段不同默认会话类型（设计/Narration/对话/练习）
- 完成自动记录到 SQLite
- 顶栏右侧紧凑模式快捷入口

### 统一速记（`/T` 标记）
- 单文本框中自由输入，`/T` 前缀标记 Tulpa 的回应
- 支持 `/T` 行首、`/T` 无空格、小写 `/t`
- Ctrl/Cmd+Enter 保存并自动拆分为对话记录

### 统计面板
- 侧边栏底部入口 → 全屏统计视图
- 累计时长、各阶段分解、近 7 天趋势、近 30 天热力图

---

## 已知问题 & 后续计划

- [ ] Form 构建器详细编辑（五个感官表单 + 参考图）
- [ ] Wonderland 富文本编辑器
- [ ] 自主性观察日志 CRUD
- [ ] 情感共振柱状图交互
- [ ] Switching/Possession 进度追踪完善
- [ ] 日常陪伴热力图完善
- [ ] iOS 打包支持
- [ ] 数据导入/导出
- [ ] 虚拟滚动优化（>500 条记录时）

---

## 贡献

```bash
# 分支规范
git checkout -b feat/your-feature
git commit -m "feat: your feature description"
git push origin feat/your-feature
# 然后创建 Pull Request
```
