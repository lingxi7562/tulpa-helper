INSERT OR IGNORE INTO stages (id, name, "order", description, unlocked_at) VALUES
  ('prep', '准备期', 1, '定义 tulpa 的基础蓝图', datetime('now','localtime')),
  ('create', '创建期', 2, '通过持续专注与交流赋予 tulpa 生命力', datetime('now','localtime')),
  ('dev', '发展期', 3, '培养独立性，深化连接', NULL),
  ('mature', '成熟期', 4, '高阶练习与长期维护', NULL);
