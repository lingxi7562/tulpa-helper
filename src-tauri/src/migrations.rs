use tauri_plugin_sql::{Migration, MigrationKind};

pub const DB_URL: &str = "sqlite:tulpa.db";

pub fn all() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_stages",
            sql: include_str!("../migrations/0001_create_stages.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed_stages",
            sql: include_str!("../migrations/0002_seed_stages.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_entries",
            sql: include_str!("../migrations/0003_create_entries.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_dialogue_messages",
            sql: include_str!("../migrations/0004_create_dialogue_messages.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_traits",
            sql: include_str!("../migrations/0005_create_traits.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_form_details",
            sql: include_str!("../migrations/0006_create_form_details.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "create_deviations",
            sql: include_str!("../migrations/0007_create_deviations.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "create_deviation_index",
            sql: include_str!("../migrations/0008_create_deviation_index.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "create_milestones",
            sql: include_str!("../migrations/0009_create_milestones.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "create_imposition_levels",
            sql: include_str!("../migrations/0010_create_imposition_levels.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 11,
            description: "entries_stage_index",
            sql: include_str!("../migrations/0011_entries_stage_index.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 12,
            description: "entries_type_index",
            sql: include_str!("../migrations/0012_entries_type_index.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 13,
            description: "entries_duration_index",
            sql: include_str!("../migrations/0013_entries_duration_index.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 14,
            description: "dialogue_entry_index",
            sql: include_str!("../migrations/0014_dialogue_entry_index.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 15,
            description: "milestones_stage_index",
            sql: include_str!("../migrations/0015_milestones_stage_index.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 16,
            description: "traits_category_index",
            sql: include_str!("../migrations/0016_traits_category_index.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 17,
            description: "clean_orphan_deviations",
            sql: include_str!("../migrations/0017_clean_orphan_deviations.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 18,
            description: "validate_deviation_insert",
            sql: include_str!("../migrations/0018_validate_deviation_insert.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 19,
            description: "validate_deviation_update",
            sql: include_str!("../migrations/0019_validate_deviation_update.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 20,
            description: "delete_trait_deviations",
            sql: include_str!("../migrations/0020_delete_trait_deviations.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 21,
            description: "delete_form_deviations",
            sql: include_str!("../migrations/0021_delete_form_deviations.sql"),
            kind: MigrationKind::Up,
        },
    ]
}
