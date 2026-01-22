import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import type { Family } from '../types';
import './FamilySettings.css';

interface Props {
  onClose: () => void;
}

export default function FamilySettings({ onClose }: Props) {
  const { language } = useLanguage();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFamily();
  }, []);

  const loadFamily = async () => {
    try {
      const data = await api.getFamily();
      setFamily(data.family);
    } catch (err) {
      console.error('Failed to load family:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError('');
    setActionLoading(true);
    try {
      const data = await api.createFamily(familyName || undefined);
      setFamily(data.family);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setError(language === 'zh' ? '请输入家庭代码' : 'Please enter a family code');
      return;
    }
    setError('');
    setActionLoading(true);
    try {
      const data = await api.joinFamily(joinCode.trim());
      setFamily(data.family);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join family');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    const confirmMsg = language === 'zh'
      ? '确定要离开这个家庭吗？'
      : 'Are you sure you want to leave this family?';
    if (!confirm(confirmMsg)) return;

    setError('');
    setActionLoading(true);
    try {
      await api.leaveFamily();
      setFamily(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave family');
    } finally {
      setActionLoading(false);
    }
  };

  const copyCode = () => {
    if (family?.code) {
      navigator.clipboard.writeText(family.code);
    }
  };

  if (loading) {
    return (
      <div className="family-modal-overlay" onClick={onClose}>
        <div className="family-modal" onClick={(e) => e.stopPropagation()}>
          <div className="family-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="family-modal-overlay" onClick={onClose}>
      <div className="family-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>{language === 'zh' ? '👨‍👩‍👧 家庭模式' : '👨‍👩‍👧 Family Mode'}</h2>
        <p className="family-desc">
          {language === 'zh'
            ? '链接家庭成员，共享所有清单'
            : 'Link family members to share all checklists'}
        </p>

        {error && <div className="family-error">{error}</div>}

        {family ? (
          <div className="family-info">
            <div className="family-header">
              <h3>{family.name}</h3>
              <div className="family-code">
                <span className="code-label">
                  {language === 'zh' ? '家庭代码' : 'Family Code'}
                </span>
                <span className="code-value">{family.code}</span>
                <button className="copy-btn" onClick={copyCode} title="Copy">
                  📋
                </button>
              </div>
            </div>

            <div className="members-section">
              <h4>{language === 'zh' ? '成员' : 'Members'}</h4>
              <ul className="members-list">
                {family.members.map((member) => (
                  <li key={member.id}>
                    <span className="member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="member-name">{member.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="share-hint">
              {language === 'zh'
                ? '分享家庭代码让其他成员加入'
                : 'Share the family code to let others join'}
            </p>

            <button 
              className="leave-btn" 
              onClick={handleLeave}
              disabled={actionLoading}
            >
              {language === 'zh' ? '离开家庭' : 'Leave Family'}
            </button>
          </div>
        ) : (
          <div className="family-setup">
            <div className="setup-section">
              <h4>{language === 'zh' ? '创建家庭' : 'Create Family'}</h4>
              <input
                type="text"
                placeholder={language === 'zh' ? '家庭名称（可选）' : 'Family name (optional)'}
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
              <button 
                onClick={handleCreate} 
                disabled={actionLoading}
                className="primary-btn"
              >
                {actionLoading 
                  ? (language === 'zh' ? '创建中...' : 'Creating...') 
                  : (language === 'zh' ? '创建' : 'Create')}
              </button>
            </div>

            <div className="divider">
              <span>{language === 'zh' ? '或' : 'or'}</span>
            </div>

            <div className="setup-section">
              <h4>{language === 'zh' ? '加入家庭' : 'Join Family'}</h4>
              <input
                type="text"
                placeholder={language === 'zh' ? '输入家庭代码' : 'Enter family code'}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button 
                onClick={handleJoin} 
                disabled={actionLoading}
                className="primary-btn"
              >
                {actionLoading 
                  ? (language === 'zh' ? '加入中...' : 'Joining...') 
                  : (language === 'zh' ? '加入' : 'Join')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
