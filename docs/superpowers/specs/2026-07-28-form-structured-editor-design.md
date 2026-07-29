# 表单详情编辑器设计 — 结构化字段 + 参考图

> 日期：2026-07-28
> 依据：表单构建器「详细编辑」功能需求
> 决策方式：头脑风暴 + 用户确认

---

## 背景

当前 FormBuilder 仅支持每个感官记录一段纯文本描述。用户需要更结构化的表单来系统性地设计 Tulpa 形态，并支持参考图管理。

---

## 变更 1：结构化字段系统

### 数据模型变更

**`form_details` 表添加 `fields` 列：**

```diff
- CREATE TABLE form_details (id, sense_type, description TEXT)
+ CREATE TABLE form_details (id, sense_type, description TEXT, fields TEXT DEFAULT '[]')
```

`fields` 为 JSON 数组，每条记录格式：
```json
{"name": "身高", "value": "175cm", "type": "text"}
```

支持的字段类型：
- `text` — 自由文本输入
- `select` — 下拉选项
- `number` — 数值输入（带单位）

### 字段模板（TS 常量）

各感官预定义字段：

| 感官 | 字段 |
|---|---|
| 👁 视觉 | 身高(text)、体型(select:纤细/匀称/健壮/丰满)、发色(text)、发型(text)、瞳色(text)、肤色(text)、面型(text)、服装风格(text)、特殊标识(text) |
| 👂 听觉 | 音色(text)、音调(text)、语速(select:缓慢/中等/快速)、口音(text)、说话风格(text)、习惯用语(text) |
| 👃 嗅觉 | 气味类型(text)、浓度(select:淡雅/适中/浓郁)、联想场景(text) |
| ✋ 触觉 | 体温感(select:温暖/凉爽/中性)、质感(text)、实体感(select:虚幻/半透明/实体)、接触反应(text) |
| 👅 味觉 | 关联味道(text)、感受描述(text) |

字段模板定义于 `src/constants/formFields.ts`，单一来源。

---

## 变更 2：参考图系统

### 数据模型

**新建 `form_images` 表：**

```sql
CREATE TABLE IF NOT EXISTS form_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_detail_id INTEGER REFERENCES form_details(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK(source_type IN ('local','url')),
  source_path TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_form_images_detail
  ON form_images (form_detail_id, sort_order);
```

### 本地图片存储策略

- 使用 `@tauri-apps/plugin-dialog` 选择本地图片文件
- 使用 `@tauri-apps/plugin-fs` 将图片复制到 app 数据目录 `{app_data}/form_images/{id}_{timestamp}.{ext}`
- `source_path` 存储本地绝对路径，`thumbnail` 存储缩略图路径

### URL 图片存储策略

- `source_path` 直接存储 URL
- 前端通过 `<img src={url}>` 直接展示
- 无需本地缓存（简单实现）

---

## 变更 3：新增 Tauri 插件

```diff
# Cargo.toml
+ tauri-plugin-dialog = "2"
+ tauri-plugin-fs = "2"

# package.json
+ "@tauri-apps/plugin-dialog": "^2"
+ "@tauri-apps/plugin-fs": "^2"

# capabilities/default.json
+ "dialog:default",
+ "dialog:allow-open",
+ "fs:default",
```

---

## UI 交互设计

### FormBuilder 重构

现有感官标签栏保留，内容区改为上下分区：

```
┌────────────────────────────────┐
│ 👁视觉 👂听觉 👃嗅觉 ✋触觉 👅味觉 │  ← 感官标签
├────────────────────────────────┤
│ ┌─ 结构化字段 ───────────────┐ │
│ │ 身高    [175cm       ]    │ │  ← 各字段行
│ │ 体型    [纤细 ▾      ]    │ │  ← select 类型
│ │ 发色    [银白色      ]    │ │
│ │ ...                       │ │
│ │ 自由描述 [_____________]  │ │  ← 保留原 description
│ └────────────────────────────┘ │
│ ┌─ 参考图 ──────────────────┐ │
│ │ [＋上传] [＋URL]          │ │  ← 添加图片按钮
│ │ ┌──┐ ┌──┐ ┌──┐          │ │
│ │ │  │ │  │ │  │          │ │  ← 缩略图网格
│ │ └──┘ └──┘ └──┘          │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### 字段编辑行为

- 字段值变更实时更新本地 state，失焦自动保存
- 自由描述保持 Textarea，Ctrl+Enter 保存
- 模板字段不可增删（此版本仅使用预定义模板）

### 参考图行为

- 点击缩略图：全屏预览
- 右/长按：删除确认
- 本地图：通过 Tauri dialog 选择，自动复制到 app 数据目录
- URL 图：弹出输入框，输入后即时预览
- 拖拽排序（stretch goal）

---

## 文件变更清单

| 文件 | 变更类型 | 职责 |
|---|---|---|
| `src/constants/formFields.ts` | **新建** | 各感官字段模板定义 |
| `src/db/schema.ts` | 修改 | form_details 加 fields 列 + form_images 表 |
| `src/db/database.ts` | 修改 | form_images CRUD + form_details CRUD 适配 |
| `src/stores/useFormStore.ts` | 修改 | 添加 fields 状态管理 + images 状态 |
| `src/features/form/FormBuilder.tsx` | **重写** | 结构化字段表单 + 参考图管理 |
| `src/features/form/FormSummary.tsx` | 修改 | 适配新 schema |
| `src/features/form/ImageGrid.tsx` | **新建** | 参考图缩略图网格组件 |
| `src/features/form/ImagePreview.tsx` | **新建** | 全屏图片预览模态 |
| `src-tauri/Cargo.toml` | 修改 | 添加 dialog + fs 插件 |
| `src-tauri/capabilities/default.json` | 修改 | 添加 dialog + fs 权限 |
| `package.json` | 修改 | 添加插件 npm 依赖 |

---

## 不在范围内

- 字段自定义增删（此版本仅预定义模板）
- 图片拖拽排序（stretch goal）
- 图片 OCR/标签识别
- 云端同步
- iOS 打包

---

## 验证标准

- [ ] TypeScript 编译零错误
- [ ] 五个感官标签切换正常
- [ ] 各感官显示对应预定义字段模板
- [ ] 字段值编辑后自动保存，刷新后数据仍在
- [ ] 本地图片选择并显示缩略图
- [ ] URL 图片输入并显示缩略图
- [ ] 图片点击预览
- [ ] 图片删除确认
- [ ] 旧数据（无 fields 列）正常显示不崩溃
