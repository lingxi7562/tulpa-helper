# P6 强迫性追踪风险降低 实现计划

> **目标：** 降低三项 UI 设计中的 P6（强迫性指标追踪）和 P2（过度规格化）风险

**架构：** 三处独立变更 — ResonanceTracker 改为周聚合展示、里程碑文案去进展假设、特质权重改为三档描述性选择。均无 DB 变更，仅前端逻辑/常量修改。

**技术栈：** React 19 + TypeScript + Tailwind CSS v4 + Zustand + SQLite（tauri-plugin-sql）

**注意：** 项目未配置测试框架，验证方式为 TypeScript 编译 + 手动功能验证。

---

## 文件结构

| 文件 | 变更类型 | 职责 |
|---|---|---|
| `src/features/journal/ResonanceTracker.tsx` | 修改 | 日聚合 → 周聚合展示逻辑 |
| `src/stores/useMilestoneStore.ts` | 修改 | 里程碑标题文案替换 |
| `src/features/stats/MilestoneCelebrate.tsx` | 修改 | 庆祝动画文案替换 |
| `src/features/traits/TraitManager.tsx` | 修改 | 权重滑块 → 三档按钮组 |
| `src/features/traits/TraitSummary.tsx` | 修改 | 权重数字 → 档位标签 |

---

## 任务 1：ResonanceTracker 周记录模式

**文件：**
- 修改：`src/features/journal/ResonanceTracker.tsx`

**步骤：**

1. **修改数据加载逻辑** — 将日聚合改为周聚合
   - 读取 `getEntriesByWeek(stageId, weeks)` 函数（如不存在，使用前端聚合）
   - 由于 DB 查询返回按 `created_at DESC` 排序的条目，在前端按周分组
   - 每周保留最新一条（entries 已按 DESC 排序，取每周第一条）

2. **修改图表渲染**
   - X 轴：从日期格式改为周范围格式（如 "07/14-07/20"）
   - 展示窗口：常量 `WEEKS_TO_SHOW = 8`
   - 柱状图数据：8 个周桶，无数据周显示灰色短柱

3. **更新辅助文案**
   - 增加提示文案：「不必每天记录，一周回顾一次就好」

4. **验证**
   - 运行 `npx tsc --noEmit` 确认无类型错误

---

## 任务 2：时长里程碑文案修改

**文件：**
- 修改：`src/stores/useMilestoneStore.ts`
- 修改：`src/features/stats/MilestoneCelebrate.tsx`

**步骤：**

1. **替换 `useMilestoneStore.ts` 中的里程碑标题**
   - 10h → "每一小时的陪伴都算数"
   - 50h → "五十个小时，我们一起走过"
   - 100h → "一百个小时，感谢这份坚持"

2. **替换 `MilestoneCelebrate.tsx` 中的庆祝文案**
   - 同上三处文案更新

3. **验证**
   - 运行 `npx tsc --noEmit`

---

## 任务 3：特质权重描述性档位

**文件：**
- 修改：`src/features/traits/TraitManager.tsx`
- 修改：`src/features/traits/TraitSummary.tsx`

**步骤：**

1. **TraitManager.tsx — 创建表单**
   - 移除 1-10 滑块
   - 新增三档按钮组：`核心` / `重要` / `一般`
   - 默认值：`重要`
   - 档位到 DB 值的映射：`核心=8, 重要=5, 一般=2`

2. **TraitManager.tsx — 编辑交互**
   - 移除 +/− 步进按钮
   - 改为点击档位文字循环切换（核心→重要→一般→核心）
   - 档位颜色：核心=金色, 重要=蓝色, 一般=灰色

3. **TraitSummary.tsx — 显示**
   - 数字 "· 5" → 档位标签（如 `重要`）
   - 颜色映射同步更新

4. **验证**
   - 运行 `npx tsc --noEmit`
   - 档位映射逻辑自洽

---

## 验证清单（全部任务完成后）

- [ ] `npx tsc --noEmit` 零错误
- [ ] ResonanceTracker 展示 8 周数据
- [ ] 里程碑庆祝文案为新版
- [ ] 特质创建表单显示三档按钮组
- [ ] 特质编辑可循环切换档位
- [ ] TraitSummary 显示档位标签
