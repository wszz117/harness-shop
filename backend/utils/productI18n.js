// productI18n —— 商品双语支撑工具
// buildKeywordFilter(keyword, lang): 按语言限定关键词检索字段
// projectProductForLang(product, lang): 按语言投影商品文案字段

export function buildKeywordFilter(keyword, lang = 'zh') {
  if (!keyword) return {};
  const rx = { $regex: keyword, $options: 'i' };
  if (lang === 'en') {
    // 英文界面下允许命中英文名与中文名（双向兜底）
    return { $or: [{ name_en: rx }, { name: rx }] };
  }
  return { $or: [{ name: rx }, { name_en: rx }] };
}

export function projectProductForLang(productDoc, lang = 'zh') {
  const p = productDoc.toObject ? productDoc.toObject() : { ...productDoc };
  if (lang === 'en') {
    p.name = p.name_en || p.name;
    p.description = p.description_en || p.description;
    p.category = p.category_en || p.category;
  }
  delete p.name_en;
  delete p.description_en;
  delete p.category_en;
  return p;
}

export function resolveLang(req) {
  const lang = (req.query.lang || req.headers['x-ui-language'] || 'zh')
    .toString()
    .toLowerCase();
  return lang === 'en' ? 'en' : 'zh';
}
