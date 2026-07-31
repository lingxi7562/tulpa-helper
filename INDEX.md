# Tulpa Helper — 代码索引

> 生成于 2026-07-31 · 基于 `master` @ d1c2165
> 注意：**README.md 的项目结构章节已过时**（缺失 journal/form/wonderland/narration/evolution 等模块），以本索引与 `AGENTS.md` 为准。

## 项目速览

温暖沉浸型的 Tulpa 创建辅助桌面应用（准备期 → 创建期 → 发展期 → 成熟期）。本地优先，无 AI/LLM。

| 层 | 选型 |
|---|---|
| 桌面 | Tauri v2（Rust + WebView）+ Tauri Mobile（Android） |
| 前端 | React 19 + TypeScript + Tailwind CSS v4 + Zustand v5 |
| 存储 | SQLite via tauri-plugin-sql（`tulpa.db`，无迁移工具，`MIGRATIONS` 数组启动时执行） |
| 构建 | `npm run tauri dev` / `npm run tauri build`（Vite port 1420 固定）· CI: GitHub Actions 三平台 |

源码规模：50 文件 / ~3950 行（`src/`）。

## 分层架构

```
UI (React 组件)
  → Zustand stores (src/stores/*)    — 状态 + 副作用
    → DB CRUD (src/db/database.ts)   — SQLite via tauri-plugin-sql
      → Schema (src/db/schema.ts)    — 建表 SQL + TS 类型 + MIGRATIONS
```

## 数据库（src/db/schema.ts）

| 表 | 用途 | 关键字段 |
|---|---|---|
| `stages` | 四阶段（prep/create/dev/mature）| id, name, order, unlocked_at |
| `entries` | 通用记录（所有条目落此表）| stage_id, type, title, content, tags, duration_seconds, mood |
| `dialogue_messages` | 对话消息 | entry_id(FK cascade), speaker('self'\|'tulpa'), content, seq |
| `traits` | 特质蓝图 | name, description, weight(1-10), category |
| `form_details` | 形态设计（五感）| sense_type(visual/audio/smell/touch/taste), description |
| `deviations` | 偏离记录（trait/form 目标）| target_type, target_id, note, created_at |
| `milestones` | 里程碑 | stage_id, title, achieved_at, notes |
| `imposition_levels` | Imposition 等级 | sense_type(PK), level(1-10) |

`EntryType`（13 种）：`trait form session narration devotion dialogue wonderland signal imposition switch design dialogue_session practice autonomy resonance`（15 种，schema.ts 为准）。

## DB API（src/db/database.ts，~40 个导出）

- **Stages**: getStages / unlockStage / lockStage
- **Entries**: getEntries(分页) / getEntryCount / getAllEntries / getWonderlandEntries / getAutonomyEntries / getResonanceEntries / getEntriesByTag / getEntriesByType / createEntry / updateEntry / deleteEntry
- **Dialogue**: createDialogueEntry / getDialogueMessages / createDialogueMessage / hasCommitmentConfirmation
- **Traits**: getTraits / createTrait / updateTrait / deleteTrait
- **Form**: getFormDetails / createFormDetail / updateFormDetail / deleteFormDetail / getDeviations / createDeviation / deleteDeviation
- **Imposition**: getImpositionLevels / setImpositionLevel
- **Milestones**: getMilestones / createMilestone
- **Stats**: getTotalDuration / getDurationByStage / getDailyDurations / getConsecutiveDays / getStageTypeCounts

## Stores（src/stores/，Zustand v5，直接调 database.ts）

| Store | 职责 |
|---|---|
| `useStageStore` | 当前/解锁阶段：loadStages / setActiveStage / unlock / lock |
| `useEntryStore` | 记录 CRUD + 分页（默认 50/页，append 模式）|
| `useTraitStore` | 特质 CRUD（name/description/weight/category）|
| `useTimerStore` | 番茄钟：start / pause / reset / tick / setSessionType / setDurationMinutes |
| `useFormStore` | 五感形态 CRUD |
| `useMilestoneStore` | 里程碑庆祝检查（10/50/100 小时 → confetti）/ dismiss |
| `useProfileStore` | tulpa 名称 |

## 视图层

- `src/App.tsx` — 根组件：顶栏（双视图切换 + QuickNarration + 紧凑番茄钟）、面板/时间线切换、全屏统计、Toast、里程碑庆祝弹层
- `layouts/PanelLayout.tsx` — 面板视图（StageSidebar + 内容区）· `TimelineLayout.tsx` — 时间线（分页 50/页）
- `constants/stages.ts` — 阶段元数据单一来源（icon/color/name，仅 8 行）

## Features 地图（src/features/）

| 模块 | 文件 | 说明 |
|---|---|---|
| stages | PrepPanel / CreationPanel / DevelopmentPanel / MaturePanel / StageSidebar | 四阶段面板 + 侧边栏导航 |
| forcing | FocusTimer (175 行) | 番茄钟，compact/完整双模式，全阶段通用 |
| dialogue | ScribbleInput / DialogueDisplay | 统一速记；`/T` 前缀解析（/T、/t、\n/T → speaker 'tulpa'，之前为 'self'）|
| traits | TraitManager / TraitSummary | 特质 CRUD + 摘要 |
| form | FormBuilder / FormSummary | 五感表单构建器（视觉/听觉/嗅觉/触觉/味觉）|
| wonderland | WonderlandEditor | Wonderland 构建（含草稿自动保存）|
| journal | AutonomyLog / CommitmentConfirm / MilestoneList / PossessionLog / ResonanceTracker / SignalInput / SwitchingLog | 自主性观察、承诺确认、里程碑、附身/切换练习、共振追踪、回应信号 |
| narration | QuickNarration | 顶栏快捷旁白入口 |
| evolution | EvolutionLog | 演化/偏离记录 |
| stats | StatsPanel / MilestoneCelebrate | 全屏统计（总时长/阶段/7 天趋势/30 天热力图）+ confetti 庆祝 |

## UI 基元（src/components/ui/）

Button / Card / Input / Badge / IconButton / Toast / Heatmap / EntryForm — 均配 `ui-` 前缀 CSS 类（App.css 设计令牌驱动，双层级样式约定）。

## 关键约定

- **CSS 双层**：Tailwind 管布局 + App.css 的 `ui-*` 类管设计令牌（colors/radii/shadows/durations/easing 定义在 `:root`）
- **/T 对话解析**：ScribbleInput 按 `/T`（含 `/t`、`\n/T`）拆分，存 `dialogue_messages`
- **番茄钟**：默认 25 分钟，`timeLeft` 秒级；完成 → 创建 `entries` 行（含 duration_seconds）
- **文件放置规则**：阶段特性 → `features/stages/<Stage>Panel.tsx`；跨模块 → `features/<domain>/`；UI 基元 → `components/ui/`；新表 → schema.ts MIGRATIONS + database.ts CRUD；全局状态 → `stores/use<Thing>Store.ts`
- **构建**：不用裸 `npm run dev/build`，必须走 `tauri dev/build`；无 lint/测试框架，`tsc` 是唯一检查

## 文档与变更历史

- `AGENTS.md` — 权威约定文档（含 11 条 Android CI 血泪教训）
- `AUDIT-2026-07-26.md` — 全功能审计：28/28 🔴 修复，~40/66 🟡 修复（2026-07-28 完成）
- `docs/superpowers/` — specs/plans（如 2026-07-28 desketching 设计）
- 近期提交：`fix(audit-batch6)`（时区 localtime、里程碑入库、loadAllEntries 2000 上限）→ `fix(audit-batch1~5)` → `feat: milestone celebration confetti`

## 已知待办（README 更新过）

- ✅ 2026-07-31 audit-batch7：A 类遗留 🟡 21 项全部修复（详见 AUDIT-2026-07-26.md「修复记录」）
- ⏳ B 类产品方向 6 项待决策：创建期计数卡片 P6 张力、StatsPanel 文案矛盾、历程概览重复、tags JSON 技术债、imposition 历史轨迹、长页面折叠
- Form 构建器详细编辑（五感表单 + 参考图）— 部分完成（FormBuilder 已有）
- Wonderland 富文本编辑器 — 部分完成（WonderlandEditor 已有）
- 情感共振柱状图交互、Switching/Possession 进度完善、日常陪伴热力图（周视图 + 断档标记）
- iOS 打包、数据导入/导出、虚拟滚动（>500 条记录时）
- 未提交改动（2026-07-31）：audit-batch7 全部修复 + 此前 worktree 修改（build.yml、package*.json 等）均未提交
