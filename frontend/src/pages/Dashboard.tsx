import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { ChecklistTemplate, Checklist } from '../types';
import LanguageToggle from '../components/LanguageToggle';
import FamilySettings from '../components/FamilySettings';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [showFamilySettings, setShowFamilySettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, checklistsData] = await Promise.all([
        api.getTemplates(),
        api.getChecklists(),
      ]);
      setTemplates(templatesData);
      setChecklists(checklistsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChecklist = async (templateId: string) => {
    setCreating(templateId);
    try {
      const checklist = await api.createChecklist(templateId);
      navigate(`/checklist/${checklist.id}`);
    } catch (error) {
      console.error('Failed to create checklist:', error);
      setCreating(null);
    }
  };

  const deleteChecklist = async (id: string) => {
    const confirmMsg = language === 'zh' 
      ? '确定要删除这个清单吗？' 
      : 'Are you sure you want to delete this checklist?';
    if (!confirm(confirmMsg)) return;
    
    try {
      await api.deleteChecklist(id);
      setChecklists(checklists.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete checklist:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>{language === 'zh' ? '加载中...' : 'Loading your travel companion...'}</p>
      </div>
    );
  }

  const activeChecklists = checklists.filter((c) => !c.completedAt);
  const completedChecklists = checklists.filter((c) => c.completedAt);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <span className="header-icon">✈️</span>
            <h1>{language === 'zh' ? '旅行伴侣' : 'Travel Companion'}</h1>
          </div>
          <div className="header-right">
            <span className="user-name">
              {language === 'zh' ? `你好，${user?.name}` : `Hello, ${user?.name}`}
            </span>
            <button 
              onClick={() => setShowFamilySettings(true)} 
              className="family-btn"
              title={language === 'zh' ? '家庭模式' : 'Family Mode'}
            >
              👨‍👩‍👧
            </button>
            <LanguageToggle />
            <button onClick={logout} className="logout-btn">
              {language === 'zh' ? '退出' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="section">
          <h2>{language === 'zh' ? '新建清单' : 'Start a New Checklist'}</h2>
          <p className="section-desc">
            {language === 'zh' 
              ? '选择一个模板创建新的打包清单' 
              : 'Choose a template to create a new packing checklist'}
          </p>
          
          <div className="templates-grid">
            {templates.map((template) => (
              <button
                key={template.id}
                className="template-card"
                onClick={() => createChecklist(template.id)}
                disabled={creating === template.id}
              >
                <span className="template-icon">{template.icon || '📋'}</span>
                <h3>{t(template.name, template.nameEn)}</h3>
                <p>{t(template.description, template.descriptionEn)}</p>
                <span className="template-items">
                  {template._count?.items || template.items?.length || 0} {language === 'zh' ? '项' : 'items'}
                </span>
                {creating === template.id && (
                  <div className="template-loading">
                    <div className="spinner small"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {activeChecklists.length > 0 && (
          <section className="section">
            <h2>{language === 'zh' ? '进行中' : 'Active Checklists'}</h2>
            <p className="section-desc">
              {language === 'zh' ? '继续整理你的行李' : 'Continue packing for your trips'}
            </p>
            
            <div className="checklists-grid">
              {activeChecklists.map((checklist) => (
                <div key={checklist.id} className="checklist-card">
                  <div
                    className="checklist-content"
                    onClick={() => navigate(`/checklist/${checklist.id}`)}
                  >
                    <span className="checklist-icon">
                      {checklist.template.icon || '📋'}
                    </span>
                    <div className="checklist-info">
                      <h3>{checklist.name}</h3>
                      <span className="checklist-template">
                        {t(checklist.template.name, checklist.template.nameEn)}
                      </span>
                    </div>
                    <div className="checklist-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${checklist.progress.percentage}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {checklist.progress.checked}/{checklist.progress.total}
                      </span>
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChecklist(checklist.id);
                    }}
                    title={language === 'zh' ? '删除清单' : 'Delete checklist'}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {completedChecklists.length > 0 && (
          <section className="section">
            <h2>{language === 'zh' ? '已完成' : 'Completed'}</h2>
            <p className="section-desc">
              {language === 'zh' ? '之前的旅行清单' : 'Past trips you\'ve packed for'}
            </p>
            
            <div className="checklists-grid completed">
              {completedChecklists.map((checklist) => (
                <div key={checklist.id} className="checklist-card completed">
                  <div
                    className="checklist-content"
                    onClick={() => navigate(`/checklist/${checklist.id}`)}
                  >
                    <span className="checklist-icon">✅</span>
                    <div className="checklist-info">
                      <h3>{checklist.name}</h3>
                      <span className="checklist-template">
                        {language === 'zh' ? '完成于 ' : 'Completed '}
                        {new Date(checklist.completedAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChecklist(checklist.id);
                    }}
                    title={language === 'zh' ? '删除清单' : 'Delete checklist'}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {showFamilySettings && (
        <FamilySettings onClose={() => setShowFamilySettings(false)} />
      )}
    </div>
  );
}
