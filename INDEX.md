# Tulpa Helper — 项目索引(图谱版)

> 复核于 2026-08-09 · 基于 `master` @ 8445e39
> 知识图谱:597 nodes / 1405 edges(codebase-memory-mcp,项目名 `mnt-d-opencode-tulpa-helper`)
> 注意:**README.md 已删除**(f51539e),以本索引与 `AGENTS.md` 为准。

## 项目速览

温暖沉浸型的 Tulpa 关系与练习辅助桌面应用(四个可回访章节：准备期 / 创建期 / 发展期 / 成熟期)。本地优先,无 AI/LLM。

| 层 | 选型 |
|---|---|
| 桌面 | Tauri v2(Rust + WebView)+ Tauri Mobile(Android) |
| 前端 | React 19 + TypeScript + Tailwind CSS v4 + Zustand v5 |
| 存储 | SQLite via tauri-plugin-sql(`tulpa.db`)，Rust 版本化迁移位于 `src-tauri/migrations/`，启动预加载后再查询 |
| 构建 | `npm run tauri dev` / `npm run tauri build`(Vite port 1420 固定)· CI: GitHub Actions 三平台 |

源码规模:51 文件 / ~4300 行(`src/`,ts/tsx/css)。Features 地图、Stores、UI 基元已逐一核对,零缺失。

## 分层架构(图谱验证)

```
UI (React 组件)
  → Zustand stores (src/stores/*)    — 状态 + 副作用
    → DB CRUD (src/db/database.ts)   — SQLite via tauri-plugin-sql
      → Schema (src/db/schema.ts)    — TypeScript 类型；SQL 迁移位于 `src-tauri/migrations/`
```

图谱分层的实测出入度(方向为"被谁依赖/依赖谁"):

| 层 | 目录 | 特征 |
|---|---|---|
| 入口层 | `App.tsx` / `layouts/` | fan-out 高,fan-in 低 |
| 核心层(高 fan-in) | `components/ui/`、`db/`、`hooks/`、`lib/`、`stores/` | 被 features 大量复用 |
| 内部层(高 fan-out) | `features/<domain>/`(10 个) | 调用 core,不反向依赖 |

## 数据库(src/db/schema.ts)

| 表 | 用途 | 关键字段 |
|---|---|---|
| `stages` | 四阶段(prep/create/dev/mature) | id, name, order, unlocked_at |
| `entries` | 通用记录(所有条目落此表) | stage_id, type, title, content, tags, duration_seconds, mood |
| `dialogue_messages` | 对话消息 | entry_id(FK cascade), speaker('self'\|'tulpa'), content, seq |
| `traits` | 特质蓝图 | name, description, weight(1-10), category |
| `form_details` | 形态设计(五感) | sense_type(visual/audio/smell/touch/taste), description |
| `deviations` | 偏离记录(trait/form 目标) | target_type, target_id, note, created_at |
| `milestones` | 里程碑 | stage_id, title, achieved_at, notes |
| `imposition_levels` | 感官临场描述（兼容表） | sense_type(PK), level(1-4) |

`EntryType`(**15 种**,schema.ts:2-6 为准):`trait form session narration devotion dialogue wonderland signal imposition switch design dialogue_session practice autonomy resonance`。

## DB API(src/db/database.ts,~40 个导出)

- **Stages**: getStages / unlockStage / lockStage
- **Entries**: getEntries / searchEntries(分页) / getEntryCount / getSearchEntryCount / getAllEntries / getWonderlandEntries / getAutonomyEntries / getResonanceEntries / getEntriesByTag / getEntriesByType / createEntry / updateEntry / deleteEntry
- **Dialogue**: createDialogueEntry / getDialogueMessages / createDialogueMessage / hasCommitmentConfirmation
- **Traits**: getTraits / createTrait / updateTrait / deleteTrait
- **Form**: getFormDetails / createFormDetail / updateFormDetail / deleteFormDetail / getDeviations / createDeviation / deleteDeviation
- **Imposition**: getImpositionLevels / setImpositionLevel
- **Milestones**: getMilestones / createMilestone
- **Stats**: getTotalDuration / getDurationByStage / getDailyDurations / getConsecutiveDays / getStageTypeCounts

## Stores(src/stores/,Zustand v5,直接调 database.ts)

| Store | 职责 |
|---|---|
| `useStageStore` | 当前/解锁阶段:loadStages / setActiveStage / unlock / lock + 加载错误重试 |
| `useEntryStore` | 记录 CRUD + 搜索 + 分页(200/页,append 模式) + 加载错误重试 |
| `useTraitStore` | 特质 CRUD(name/description/weight/category) + 加载错误重试 |
| `useTimerStore` | 番茄钟:start / pause / reset / tick / setSessionType / setDurationMinutes |
| `useFormStore` | 五感形态 CRUD + 加载错误重试 |
| `useMilestoneStore` | 可选时间标记(10/50/100 小时 → confetti)/ dismiss + 本地开关 |
| `useProfileStore` | tulpa 名称 + 实践视角偏好(本地保存) |

## 视图层、hooks 与 lib

- `src/App.tsx` — 根组件:顶栏(双视图切换 + QuickNarration + 紧凑番茄钟)、面板/时间线切换、全屏统计、Toast、里程碑庆祝弹层
- `layouts/PanelLayout.tsx` — 面板视图(StageSidebar + 内容区)· `TimelineLayout.tsx` — 时间线(搜索 + 分页 200/页)
- `constants/stages.ts` — 阶段元数据单一来源(icon/color/name,仅 8 行)
- `hooks/useStats.ts` — 统计数据 hook(error 态,audit-batch7 增强)· `hooks/useToast.ts` — Toast 通知 hook
- `lib/dialogue.ts` — `parseDialogueText`(/T 对话解析核心,audit-batch7 抽出)· `lib/format.ts` — 格式化工具

## Features 地图(src/features/,10 模块全部核对 ✓)

| 模块 | 文件 | 说明 |
|---|---|---|
| stages | PrepPanel / CreationPanel / DevelopmentPanel / MaturePanel / StageSidebar | 四阶段面板 + 侧边栏导航 |
| forcing | FocusTimer | 陪伴计时器(内部保留 forcing 目录),compact/完整双模式,全阶段通用 |
| dialogue | ScribbleInput / DialogueDisplay | 统一速记;`/T` 前缀解析 → `lib/dialogue.ts` |
| traits | TraitManager / TraitSummary | 特质 CRUD + 摘要 |
| form | FormBuilder / FormSummary | 五感表单构建器(视觉/听觉/嗅觉/触觉/味觉) |
| wonderland | WonderlandEditor | Wonderland 构建(含草稿自动保存) |
| journal | AutonomyLog / CommitmentConfirm / MilestoneList / PossessionLog / PracticeGuardrail / ResonanceTracker / SignalInput / SwitchingLog | 自主性观察、承诺确认、手动里程碑、身体协作/视角切换、练习前同意护栏、共振追踪、回应信号 |
| narration | QuickNarration | 顶栏快捷旁白入口 |
| evolution | EvolutionLog | 演化/偏离记录 |
| stats | StatsPanel / MilestoneCelebrate / BackupPanel | 全屏统计(总时长/阶段/7 天趋势/30 天热力图)、本地 JSON 备份合并 + 可选时间标记 |

## UI 基元(src/components/ui/,8 个 ✓)

Button / Card / Input / Badge / IconButton / Toast / Heatmap / EntryForm — 均配 `ui-` 前缀 CSS 类(App.css 设计令牌驱动,双层级样式约定)。

## 知识图谱洞察(2026-07-31 生成)

**Hotspots(高 fan-in,改动需谨慎):** `getDb`(40 处调用)、`Card`(21)、`Button`(17)、`Badge`(15)、`addEntry`(11)。

**复杂度峰值(优先 review/简化候选):**

| 函数 | 复杂度 | 风险信号 |
|---|---|---|
| WonderlandEditor(整体) | 19 | alloc_in_loop ×4,transitive_loop_depth 2 |
| FocusTimer(整体) | 11 | — |
| ResonanceTracker(整体) | 10 | — |
| MilestoneStore.checkAndCelebrate | — | 循环内线性扫描(linear_scan_in_loop 1) |

**模块调用边界:** features→components 67 次、features→stores 38、stores→db 27、features→db 20、features→hooks/lib 若干。

**相似代码(重复实现,可提取复用):** `database.getAllEntries`↔`getMilestones`(伪相似,放弃)、`useFormStore.saveFormDetail`↔`updateFormDetail`(已消除,内部 mutate helper)、`useStageStore.loadStages`↔`useTraitStore.loadTraits`(伪相似,放弃)。
- ✅ 2026-07-31 已消除:`database.deleteTrait`↔`deleteFormDetail` → 私有 `deleteWithDeviations` helper;`Input`↔`Textarea` → `FieldShell`;`useFormStore` save/update/delete → 内部 `mutate`;`useStageStore` unlock/lock → 内部 `setStageLocked`。

**Leiden 集群:** 组件集群(34 节点)、DB/stats 集群(30)、entries 集群(22)、timer/celebrate 集群(14)——与目录结构基本吻合。

## 关键约定

- **CSS 双层**:Tailwind 管布局 + App.css 的 `ui-*` 类管设计令牌(colors/radii/shadows/durations/easing 定义在 `:root`)
- **/T 对话解析**:`lib/dialogue.ts` 的 parseDialogueText 按 `/T`(含 `/t`、`\n/T`)拆分；对话正文存于 `entries.content`，旧 `dialogue_messages` 仅作兼容读取
- **番茄钟**:默认 25 分钟,`timeLeft` 秒级;完成 → 创建 `entries` 行(含 duration_seconds)
- **文件放置规则**:阶段特性 → `features/stages/<Stage>Panel.tsx`;跨模块 → `features/<domain>/`;UI 基元 → `components/ui/`;新表 → `src-tauri/migrations/NNNN_description.sql` + `src-tauri/src/migrations.rs` + `database.ts` CRUD;全局状态 → `stores/use<Thing>Store.ts`
- **构建**:不用裸 `npm run dev/build`,必须走 `tauri dev/build`;GitHub Actions 门禁包含配置一致性、TypeScript 类型检查、Rustfmt、Clippy 与 Rust 测试，尚无前端 lint/测试框架

## 文档与变更历史

- `AGENTS.md` — 权威约定文档(含 11 条 Android CI 经验;EntryType 列表与 schema.ts 同步为 15 种)
- `AUDIT-2026-07-26.md` — 全功能审计:28/28 🔴 修复,~40/66 🟡 修复,末节「修复记录」含 audit-batch1~7
- `docs/superpowers/` — specs/plans(如 2026-07-28 desketching 设计)
- 近期提交:`f51539e fix(audit-batch7)`(A 类遗留 🟡 21 项 + 落盘 + 删除 README)→ `fix(audit-batch6)`(时区 localtime、里程碑入库、loadAllEntries 2000 上限)→ `fix(audit-batch1~5)` → `feat: milestone celebration confetti`
- Android 工程 `src-tauri/gen/android/` 已入库(065ee01)

## 后续可选增强

- ✅ 2026-07-31 audit-batch7:A 类遗留 🟡 21 项全部修复(详见 AUDIT-2026-07-26.md「修复记录」)
- ✅ 本轮已补齐本地 JSON 备份合并、时间线搜索、加载失败重试、关系安全检查、计时器持久化与数据迁移门禁
- ✅ 2026-08-09 社区概念复审：术语中性化、实践视角本地偏好、换位/身体协作同意护栏、可选时间标记；详见 [`docs/TULPA-COMMUNITY-AUDIT-2026-08.md`](docs/TULPA-COMMUNITY-AUDIT-2026-08.md)
- 产品体验候选:创建期计数卡片、StatsPanel 文案统一、历程概览去重、tags 结构化存储、imposition 历史轨迹、长页面折叠
- Form/Wonderland 编辑器仍可继续做细节增强；当前版本已提供可用的五感表单与 Wonderland 编辑器
- 情感共振图表交互、视角切换/身体协作历史轨迹、日常陪伴热力图(iOS/移动端适配)可按用户反馈迭代

## 图谱使用指引(codebase-memory-mcp)

项目名:`mnt-d-opencode-tulpa-helper`(索引 597 nodes / 1405 edges)。

```cypher
-- 查函数/模块
search_graph(project: "mnt-d-opencode-tulpa-helper", query: "对话解析")
-- 追踪调用链
trace_path(project: "mnt-d-opencode-tulpa-helper", function_name: "addEntry", direction: "both")
-- 复杂度热点
query_graph(project: "mnt-d-opencode-tulpa-helper",
  query: "MATCH (f:Function) WHERE f.transitive_loop_depth >= 2 OR f.linear_scan_in_loop >= 1 RETURN f.qualified_name, f.complexity")
-- 读源码
get_code_snippet(qualified_name: "...src.db.schema.EntryType", project: "mnt-d-opencode-tulpa-helper")
```

> 图谱为静态分析(类型感知调用解析);改代码后如需更新,重新 index_repository(full 模式)。
