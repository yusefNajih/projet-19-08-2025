import { useEffect, useState } from 'react';
import { Switch } from './ui/switch';
import { useTranslation } from 'react-i18next';

export default function DarkModeToggle() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [enabled]);

  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-sm">{t('darkMode', 'Mode sombre')}</span>
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </div>
  );
}
