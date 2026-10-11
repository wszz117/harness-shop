import { useSelector } from 'react-redux';
import { selectFxSnapshotForConversion } from '../slices/fxSlice.js';
import { selectLanguage } from '../slices/languageSlice.js';
import { t } from '../utils/i18n.js';

// 全站金额展示统一组件 —— 统一消费 Redux selectFxSnapshotForConversion
// FX 完全不可用时只展示 USD，不展示换算 (S-004 全站一致)
const MoneyDisplay = ({ usd }) => {
  const rate = useSelector(selectFxSnapshotForConversion);
  const lang = useSelector(selectLanguage);
  const amount = Number(usd);

  return (
    <span data-testid="money-display">
      ${amount.toFixed(2)}
      {rate ? (
        <small className="text-muted ms-1 text-nowrap d-inline-block" data-testid="cny-ref">
          {t(lang, 'fx.approx')} ¥{(amount * rate).toFixed(2)}
        </small>
      ) : null}
    </span>
  );
};

export default MoneyDisplay;
