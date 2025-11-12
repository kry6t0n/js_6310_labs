import React, { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import NetworkCanvas from '../components/Canvas/NetworkCanvas';
import { useAuth } from '../contexts/AuthContext';
import projectService from '../utils/projectService';
import { validateConnections } from '../utils/connectionLogic';
import '../styles/Editor.css';

const Editor = () => {
  const { user } = useAuth();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  
  useEffect(() => {
    // Слушаем событие сохранения из Toolbar
    const handleSaveEvent = () => {
      setShowSaveDialog(true);
      setSaveStatus('');
      setSaveError('');
    };
    
    window.addEventListener('saveProject', handleSaveEvent);
    return () => window.removeEventListener('saveProject', handleSaveEvent);
  }, []);
  
  // Функция для передачи сохранения из NetworkCanvas
  const handleSaveProject = () => {
    setShowSaveDialog(true);
  };

  const checkDuplicateIPs = (nodes) => {
    // Фильтруем устройства (не сеть) с IP адресами
    const deviceNodes = nodes.filter(node => 
      node.data.type !== 'network' && 
      node.data.ip && 
      node.data.ip.trim() !== ''
    );
    
    const ips = deviceNodes.map(node => node.data.ip);
    const duplicates = ips.filter((ip, index) => ips.indexOf(ip) !== index);
    
    if (duplicates.length > 0) {
      return {
        hasDuplicates: true,
        duplicates: [...new Set(duplicates)],
        hasInvalidIPs: false
      };
    }

    // Проверяем на невалидные IP адреса
    const invalidIPs = [];
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    deviceNodes.forEach(node => {
      if (!ipRegex.test(node.data.ip)) {
        invalidIPs.push(node.data.ip);
      } else {
        const parts = node.data.ip.split('.');
        if (!parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255)) {
          invalidIPs.push(node.data.ip);
        }
      }
    });

    if (invalidIPs.length > 0) {
      return {
        hasDuplicates: false,
        duplicates: [],
        hasInvalidIPs: true,
        invalidIPs: [...new Set(invalidIPs)]
      };
    }

    return { 
      hasDuplicates: false, 
      duplicates: [],
      hasInvalidIPs: false
    };
  };

  const confirmSaveProject = (nodes, edges) => {
    setSaveError('');

    if (!projectName.trim()) {
      setSaveStatus('error');
      setSaveError('Project name is required');
      return;
    }

    // Проверяем на дубликаты и невалидные IP
    const ipCheck = checkDuplicateIPs(nodes);
    
    if (ipCheck.hasDuplicates) {
      setSaveStatus('error');
      setSaveError(`Duplicate IP addresses found: ${ipCheck.duplicates.join(', ')}`);
      return;
    }

    if (ipCheck.hasInvalidIPs) {
      setSaveStatus('error');
      setSaveError(`Invalid IP addresses found: ${ipCheck.invalidIPs.join(', ')}`);
      return;
    }

    // Проверяем корректность соединений
    const connectionValidation = validateConnections(nodes, edges);
    if (!connectionValidation.valid) {
      setSaveStatus('error');
      setSaveError(`Connection errors:\n${connectionValidation.errors.join('\n')}`);
      return;
    }

    try {
      projectService.saveProject(user.id, projectName, {
        nodes,
        edges
      });
      setSaveStatus('success');
      setProjectName('');
      setTimeout(() => {
        setShowSaveDialog(false);
        setSaveStatus('');
        setSaveError('');
      }, 2000);
    } catch (_) {
      setSaveStatus('error');
      setSaveError('Failed to save project');
    }
  };

  return (
    <div className="editor-container">
      <Header />
      <NetworkCanvas 
        onSaveProject={handleSaveProject}
        userId={user.id}
      />
      
      {showSaveDialog && (
        <div className="save-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="save-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Сохранить проект</h2>
            <input
              type="text"
              placeholder="Введите имя проекта..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="project-name-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const nodes = window.__editorNodes || [];
                  const edges = window.__editorEdges || [];
                  confirmSaveProject(nodes, edges);
                }
              }}
            />
            {saveError && (
              <p className="save-status error">✗ {saveError}</p>
            )}
            {saveStatus === 'success' && !saveError && (
              <p className="save-status success">✓ Проект успешно сохранён!</p>
            )}
            <div className="dialog-buttons">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveStatus('');
                  setSaveError('');
                }}
              >
                Отменить
              </button>
              <button 
                className="btn-save"
                onClick={() => {
                  const nodes = window.__editorNodes || [];
                  const edges = window.__editorEdges || [];
                  confirmSaveProject(nodes, edges);
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
