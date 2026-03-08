import { useState, useEffect, useCallback } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface LocaleInfo {
  language: string;
  region: string;
  locale: string;
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  ko: { greeting: '안녕하세요!', welcome: '환영합니다', button: '언어 확인' },
  en: { greeting: 'Hello!', welcome: 'Welcome', button: 'Check Locale' },
  ja: { greeting: 'こんにちは!', welcome: 'ようこそ', button: '言語確認' },
};

export function useLocale() {
  const [localeInfo, setLocaleInfo] = useState<LocaleInfo | null>(null);
  const { addEvent } = useEventLogStore();

  const detect = useCallback(async () => {
    addEvent('locale_detect');
    try {
      if (!isTossApp()) {
        const lang = navigator.language;
        const [language, region] = lang.split('-');
        setLocaleInfo({ language, region: region || '', locale: lang });
        addEvent('locale_detected_web', { locale: lang });
        return;
      }
      const { getLocale } = await import('@apps-in-toss/web-framework') as unknown as {
        getLocale: () => string;
      };
      const localeStr = getLocale();
      const [language, region = ''] = localeStr.split('-');
      setLocaleInfo({ language, region, locale: localeStr });
      addEvent('locale_detected', { locale: localeStr });
    } catch (error) {
      addEvent('locale_error', { error: String(error) });
    }
  }, [addEvent]);

  useEffect(() => { detect(); }, [detect]);

  const t = (key: string): string => {
    const lang = localeInfo?.language ?? 'ko';
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['ko'][key] ?? key;
  };

  return { localeInfo, t, refresh: detect };
}
