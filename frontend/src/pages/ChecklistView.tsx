import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Checklist, ChecklistItemWithState } from '../types';
import './ChecklistView.css';

export default function ChecklistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

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
      // Revert on error
      loadChecklist();
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="checklist-loading">
        <div className="spinner"></div>
        <p>Loading checklist...</p>
      </div>
    );
  }

  if (!checklist) {
    return null;
  }

  // Group items by category
  const itemsByCategory = (checklist.items || []).reduce(
    (acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItemWithState[]>
  );

  const categories = Object.keys(itemsByCategory).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  const allChecked = checklist.progress.percentage === 100;

  return (
    <div className="checklist-view">
      <header className="checklist-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span>←</span>
          <span className="back-text">Back</span>
        </button>
        
        <div className="header-center">
          <span className="header-icon">{checklist.template.icon || '📋'}</span>
          <h1>{checklist.name}</h1>
        </div>

        <div className="header-progress">
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
          <span>All packed! You're ready for your trip!</span>
        </div>
      )}

      <main className="checklist-main">
        <div className="progress-summary">
          <span>{checklist.progress.checked} of {checklist.progress.total} items packed</span>
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
                <button
                  key={item.id}
                  className={`item-row ${item.checked ? 'checked' : ''}`}
                  onClick={() => toggleItem(item)}
                  disabled={toggling === item.id}
                >
                  <span className={`checkbox ${item.checked ? 'checked' : ''}`}>
                    {item.checked && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="item-name">{item.name}</span>
                  {toggling === item.id && (
                    <span className="item-loading">
                      <div className="spinner tiny"></div>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
