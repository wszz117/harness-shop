import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useGetUsdCnyQuery } from '../slices/fxSlice.js';
import { selectFxState } from '../slices/fxSlice.js';
import { selectLanguage } from '../slices/languageSlice.js';
import { t } from '../utils/i18n.js';

// FX 状态横幅：stale → 提示当前为缓存汇率（黄色）；unavailable → 汇率暂不可用（灰色）；loading / available → 不渲染
const FxStatusBarBanner = () => {
  useGetUsdCnyQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 5 * 60 * 1000,
  });
  const fxState = useSelector(selectFxState);
  const lang = useSelector(selectLanguage);

  if (fxState === 'loading' || fxState === 'available') return null;

  return (
    <Alert
      variant={fxState === 'stale' ? 'warning' : 'secondary'}
      className="fx-banner"
      data-testid="fx-banner"
    >
      {fxState === 'stale'
        ? t(lang, 'fx.banner.stale')
        : t(lang, 'fx.banner.unavailable')}
    </Alert>
  );
};

export default FxStatusBarBanner;
