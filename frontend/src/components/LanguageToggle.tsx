import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <span className={`lang-option ${language === 'zh' ? 'active' : ''}`}>中</span>
      <span className="lang-divider">/</span>
      <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>EN</span>
    </button>
  );
}
