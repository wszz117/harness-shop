import { describe, it, expect } from 'vitest';
import dict, { t } from '../utils/i18n.js';

describe('i18n 词典完整性 (I18N-S-004 EN 覆盖率)', () => {
  it('en 词典覆盖所有 zh key（无缺失回退）', () => {
    const zhKeys = Object.keys(dict.zh);
    const missing = zhKeys.filter((k) => !(k in dict.en));
    expect(missing).toEqual([]);
  });

  it('未知 key 回退 key 本身', () => {
    expect(t('zh', 'not.exist.key')).toBe('not.exist.key');
  });
});
