import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import type { Checklist, ChecklistItemWithState } from '../types';
import LanguageToggle from '../components/LanguageToggle';
import './ChecklistView.css';

export default function ChecklistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadChecklist();
    }
  }, [id]);

  const loadChecklist = async () => {
    try {
      const data = await api.getChecklist(id!);
      setChecklist(data);
    } catch (error) {
      console.error('Failed to load checklist:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: ChecklistItemWithState) => {
    if (!checklist || toggling) return;
    
    setToggling(item.id);
    const newChecked = !item.checked;

    // Optimistic update
    setChecklist({
      ...checklist,
      items: checklist.items?.map((i) =>
        i.id === item.id ? { ...i, checked: newChecked } : i
      ),
      progress: {
        ...checklist.progress,
        checked: checklist.progress.checked + (newChecked ? 1 : -1),
        percentage: Math.round(
          ((checklist.progress.checked + (newChecked ? 1 : -1)) /
            checklist.progress.total) *
            100
        ),
      },
    });

    try {
      await api.toggleItem(checklist.id, item.id, newChecked);
    } catch (error) {
      console.error('Failed to toggle item:', error);
      loadChecklist();
    } finally {
      setToggling(null);
    }
  };

  const addItem = async () => {
    if (!checklist || !newItemName.trim() || addingItem) return;

    setAddingItem(true);
    try {
      await api.addItem(checklist.id, newItemName.trim());
      setNewItemName('');
      setShowAddForm(false);
      await loadChecklist();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setAddingItem(false);
    }
  };

  const deleteItem = async (item: ChecklistItemWithState) => {
    if (!checklist || deleting) return;

    const confirmMsg = language === 'zh'
      ? `确定要删除"${item.name}"吗？`
      : `Delete "${t(item.name, item.nameEn)}"?`;
    if (!confirm(confirmMsg)) return;

    setDeleting(item.id);
    try {
      await api.deleteItem(checklist.id, item.id);
      await loadChecklist();
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="checklist-loading">
        <div className="spinner"></div>
        <p>{language === 'zh' ? '加载清单...' : 'Loading checklist...'}</p>
      </div>
    );
  }

  if (!checklist) {
    return null;
  }

  // Group items by category (using translated category names)
  const itemsByCategory = (checklist.items || []).reduce(
    (acc, item) => {
      const category = t(item.category, item.categoryEn) || (language === 'zh' ? '其他' : 'Other');
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItemWithState[]>
  );

  const customLabel = language === 'zh' ? '自定义' : 'Custom';
  const categories = Object.keys(itemsByCategory).sort((a, b) => {
    const importantLabel = language === 'zh' ? '重要' : 'Important';
    const otherLabel = language === 'zh' ? '其他' : 'Other';
    
    // Important always first
    if (a === importantLabel) return -1;
    if (b === importantLabel) return 1;
    
    // Custom and Other always last
    if (a === customLabel) return 1;
    if (b === customLabel) return -1;
    if (a === otherLabel) return 1;
    if (b === otherLabel) return -1;
    
    return a.localeCompare(b);
  });

  const allChecked = checklist.progress.percentage === 100;

  return (
    <div className="checklist-view">
      <header className="checklist-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span>←</span>
          <span className="back-text">{language === 'zh' ? '返回' : 'Back'}</span>
        </button>
        
        <div className="header-center">
          <span className="header-icon">{checklist.template.icon || '📋'}</span>
          <h1>{checklist.name}</h1>
        </div>

        <div className="header-actions">
          <LanguageToggle />
          <div className="progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                className="progress-ring-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="progress-ring-fill"
                strokeDasharray={`${checklist.progress.percentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="progress-percent">{checklist.progress.percentage}%</span>
          </div>
        </div>
      </header>

      {allChecked && (
        <div className="completion-banner">
          <span className="completion-icon">🎉</span>
          <span>
            {language === 'zh' 
              ? '全部打包完成！准备出发！' 
              : "All packed! You're ready for your trip!"}
          </span>
        </div>
      )}

      <main className="checklist-main">
        <div className="progress-summary">
          <span>
            {language === 'zh'
              ? `已打包 ${checklist.progress.checked} / ${checklist.progress.total} 项`
              : `${checklist.progress.checked} of ${checklist.progress.total} items packed`}
          </span>
        </div>

        {categories.map((category) => (
          <section key={category} className="category-section">
            <h2 className="category-title">
              {category}
              <span className="category-count">
                {itemsByCategory[category].filter((i) => i.checked).length}/
                {itemsByCategory[category].length}
              </span>
            </h2>
            
            <div className="items-list">
              {itemsByCategory[category].map((item) => (
                <div key={item.id} className={`item-row ${item.checked ? 'checked' : ''}`}>
                  <button
                    className="item-content"
                    onClick={() => toggleItem(item)}
                    disabled={toggling === item.id || deleting === item.id}
                  >
                    <span className={`checkbox ${item.checked ? 'checked' : ''}`}>
                      {item.checked && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="item-name">
                      {t(item.name, item.nameEn)}
                      {item.isCustom && <span className="custom-badge">+</span>}
                    </span>
                    {toggling === item.id && (
                      <span className="item-loading">
                        <div className="spinner tiny"></div>
                      </span>
                    )}
                  </button>
                  <button
                    className="item-delete"
                    onClick={() => deleteItem(item)}
                    disabled={deleting === item.id}
                    title={language === 'zh' ? '删除' : 'Delete'}
                  >
                    {deleting === item.id ? (
                      <div className="spinner tiny"></div>
                    ) : (
                      '×'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Add Item Section */}
        <section className="add-item-section">
          {showAddForm ? (
            <div className="add-item-form">
              <input
                type="text"
                placeholder={language === 'zh' ? '输入物品名称...' : 'Enter item name...'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                autoFocus
                disabled={addingItem}
              />
              <button
                className="add-confirm-btn"
                onClick={addItem}
                disabled={!newItemName.trim() || addingItem}
              >
                {addingItem ? (
                  <div className="spinner tiny"></div>
                ) : (
                  language === 'zh' ? '添加' : 'Add'
                )}
              </button>
              <button
                className="add-cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemName('');
                }}
                disabled={addingItem}
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button className="add-item-btn" onClick={() => setShowAddForm(true)}>
              <span className="add-icon">+</span>
              <span>{language === 'zh' ? '添加物品' : 'Add Item'}</span>
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
