import { useSelector } from 'react-redux';
import { selectLanguage } from '../slices/languageSlice.js';
import { t } from '../utils/i18n.js';

// useT —— 组件内翻译 hook：const tr = useT(); tr('nav.cart')
const useT = () => {
  const lang = useSelector(selectLanguage);
  return (key) => t(lang, key);
};

export default useT;
