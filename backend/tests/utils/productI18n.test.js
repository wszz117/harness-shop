import { describe, it, expect } from 'vitest';
import {
  buildKeywordFilter,
  projectProductForLang,
} from '../../utils/productI18n.js';

describe('productI18n', () => {
  it('空关键词返回空过滤器', () => {
    expect(buildKeywordFilter('')).toEqual({});
  });

  it('en 优先匹配 name_en', () => {
    const f = buildKeywordFilter('mouse', 'en');
    expect(f.$or[0].name_en).toBeDefined();
  });

  it('projectProductForLang(en) 投影英文并删除 *_en 字段', () => {
    const p = projectProductForLang(
      {
        name: '鼠标',
        name_en: 'Mouse',
        description: '中文描述',
        description_en: 'English desc',
        category: '电子产品',
        category_en: 'Electronics',
      },
      'en'
    );
    expect(p.name).toBe('Mouse');
    expect(p.category).toBe('Electronics');
    expect(p.name_en).toBeUndefined();
  });

  it('en 缺失英文文案时回退中文', () => {
    const p = projectProductForLang({ name: '仅中文', name_en: '' }, 'en');
    expect(p.name).toBe('仅中文');
  });
});
