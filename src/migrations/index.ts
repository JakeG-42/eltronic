import * as migration_20260505_115337_payload_init from './20260505_115337_payload_init';
import * as migration_20260505_131513_cms_foundation from './20260505_131513_cms_foundation';
import * as migration_20260505_143431_page_builder_design_controls from './20260505_143431_page_builder_design_controls';
import * as migration_20260505_150545_visual_builder_puck from './20260505_150545_visual_builder_puck';
import * as migration_20260505_163224_wysiwyg_menus from './20260505_163224_wysiwyg_menus';
import * as migration_20260505_181210_themes_and_templates from './20260505_181210_themes_and_templates';
import * as migration_20260505_185957_theme_settings from './20260505_185957_theme_settings';
import * as migration_20260505_195112_code_snippets from './20260505_195112_code_snippets';

export const migrations = [
  {
    up: migration_20260505_115337_payload_init.up,
    down: migration_20260505_115337_payload_init.down,
    name: '20260505_115337_payload_init',
  },
  {
    up: migration_20260505_131513_cms_foundation.up,
    down: migration_20260505_131513_cms_foundation.down,
    name: '20260505_131513_cms_foundation',
  },
  {
    up: migration_20260505_143431_page_builder_design_controls.up,
    down: migration_20260505_143431_page_builder_design_controls.down,
    name: '20260505_143431_page_builder_design_controls',
  },
  {
    up: migration_20260505_150545_visual_builder_puck.up,
    down: migration_20260505_150545_visual_builder_puck.down,
    name: '20260505_150545_visual_builder_puck',
  },
  {
    up: migration_20260505_163224_wysiwyg_menus.up,
    down: migration_20260505_163224_wysiwyg_menus.down,
    name: '20260505_163224_wysiwyg_menus',
  },
  {
    up: migration_20260505_181210_themes_and_templates.up,
    down: migration_20260505_181210_themes_and_templates.down,
    name: '20260505_181210_themes_and_templates',
  },
  {
    up: migration_20260505_185957_theme_settings.up,
    down: migration_20260505_185957_theme_settings.down,
    name: '20260505_185957_theme_settings',
  },
  {
    up: migration_20260505_195112_code_snippets.up,
    down: migration_20260505_195112_code_snippets.down,
    name: '20260505_195112_code_snippets'
  },
];
