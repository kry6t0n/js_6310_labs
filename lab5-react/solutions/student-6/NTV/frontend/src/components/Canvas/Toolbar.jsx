import React, { useRef, useState, useEffect } from 'react';
import { exportToJson, importFromJson } from '../../utils/exportUtils';
import { CONNECTION_TYPES, getConnectionStyle } from '../../utils/connectionLogic';

const Toolbar = ({ onAddNode, selectedNode, selectedEdge, nodes, edges, onSetNodes, onSetEdges }) => {
  const fileInputRef = useRef(null);
  const [editError, setEditError] = useState('');
  const [localIP, setLocalIP] = useState('');
  const [localMask, setLocalMask] = useState('');

  // Синхронизируем локальное состояние с selectedNode
  useEffect(() => {
    if (selectedNode) {
      setLocalIP(selectedNode.data.ip || '');
      setLocalMask(selectedNode.data.mask || '');
      setEditError('');
    }
  }, [selectedNode?.id]);

  const handleExport = () => {
    exportToJson({ nodes, edges });
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importFromJson(file, onSetNodes, onSetEdges);
    }
  };

  const validateIP = (ip) => {
    if (!ip || ip.trim() === '') return true; // Пустое значение допустимо
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  };

  const validateMask = (mask) => {
    if (!mask || mask.trim() === '') return true; // Пустое значение допустимо
    const maskRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!maskRegex.test(mask)) return false;
    const parts = mask.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  };

  const isIPDuplicate = (ip, nodeId) => {
    if (!ip || ip.trim() === '') return false;
    return nodes.some(node => 
      node.id !== nodeId && 
      node.data.ip === ip && 
      node.data.type !== 'network'
    );
  };

  const deviceTypes = [
    { type: 'router', label: 'Router', icon: '🔄' },
    { type: 'switch', label: 'Switch', icon: '🔀' },
    { type: 'server', label: 'Server', icon: '🖥️' },
    { type: 'workstation', label: 'Workstation', icon: '💻' },
  ];

  const networkTypes = [
    { type: 'network', label: 'Network/Internet', icon: '🌐' },
  ];

  return (
    <div style={{
      width: '280px',
      background: 'white',
      borderRight: '1px solid #e2e8f0',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Network Devices</h3>
        {deviceTypes.map(device => (
          <button
            key={device.type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              marginBottom: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => onAddNode(device.type)}
          >
            <span>{device.icon}</span>
            {device.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Network</h3>
        {networkTypes.map(network => (
          <button
            key={network.type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              marginBottom: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => onAddNode(network.type)}
          >
            <span>{network.icon}</span>
            {network.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Project Actions</h3>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            marginBottom: '8px',
            border: '1px solid #10b981',
            background: '#10b981',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
          onClick={() => {
            // Сохраняем nodes и edges в глобальную переменную
            window.__editorNodes = nodes;
            window.__editorEdges = edges;
            window.dispatchEvent(new CustomEvent('saveProject'));
          }}
        >
          💾 Save Project
        </button>
        
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            marginBottom: '8px',
            border: '1px solid #3b82f6',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={handleExport}
        >
          � Export to JSON
        </button>
        
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Import from JSON
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>

      {selectedNode && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Node Properties</h3>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Type:</label>
              <div style={{ color: '#1e293b' }}>{selectedNode.data.type}</div>
            </div>

            {selectedNode.data.type !== 'network' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>IP Address:</label>
                  <input
                    type="text"
                    value={localIP}
                    onChange={(e) => {
                      const newIP = e.target.value;
                      setLocalIP(newIP);
                      setEditError('');

                      // Валидируем только если не пусто
                      if (newIP.trim() === '') {
                        setEditError('');
                      } else if (!validateIP(newIP)) {
                        setEditError('Invalid IP format (e.g., 192.168.0.1)');
                      } else if (isIPDuplicate(newIP, selectedNode.id)) {
                        setEditError('This IP is already used');
                      } else {
                        setEditError('');
                        // Обновляем реальные данные узла
                        const updatedNode = nodes.find(n => n.id === selectedNode.id);
                        if (updatedNode) {
                          updatedNode.data.ip = newIP;
                          onSetNodes([...nodes]);
                        }
                      }
                    }}
                    onBlur={() => {
                      // Сохраняем значение при потере фокуса
                      const updatedNode = nodes.find(n => n.id === selectedNode.id);
                      if (updatedNode && validateIP(localIP)) {
                        updatedNode.data.ip = localIP;
                        onSetNodes([...nodes]);
                      }
                    }}
                    placeholder="192.168.0.1"
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: editError ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Subnet Mask:</label>
                  <input
                    type="text"
                    value={localMask}
                    onChange={(e) => {
                      const newMask = e.target.value;
                      setLocalMask(newMask);
                      setEditError('');

                      // Валидируем только если не пусто
                      if (newMask.trim() === '') {
                        setEditError('');
                      } else if (!validateMask(newMask)) {
                        setEditError('Invalid mask format (e.g., 255.255.255.0)');
                      } else {
                        setEditError('');
                        // Обновляем реальные данные узла
                        const updatedNode = nodes.find(n => n.id === selectedNode.id);
                        if (updatedNode) {
                          updatedNode.data.mask = newMask;
                          onSetNodes([...nodes]);
                        }
                      }
                    }}
                    onBlur={() => {
                      // Сохраняем значение при потере фокуса
                      const updatedNode = nodes.find(n => n.id === selectedNode.id);
                      if (updatedNode && validateMask(localMask)) {
                        updatedNode.data.mask = localMask;
                        onSetNodes([...nodes]);
                      }
                    }}
                    placeholder="255.255.255.0"
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: editError ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                  />
                </div>

                {editError && (
                  <div style={{
                    padding: '8px 10px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    color: '#dc2626',
                    fontSize: '12px',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    ⚠️ {editError}
                  </div>
                )}

                <button
                  onClick={() => {
                    const newIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                    setLocalIP(newIP);
                    const updatedNode = nodes.find(n => n.id === selectedNode.id);
                    if (updatedNode) {
                      updatedNode.data.ip = newIP;
                      onSetNodes([...nodes]);
                    }
                    setEditError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#166534',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  🔄 Generate New IP
                </button>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Status:</span>
              <span style={{ 
                color: '#166534',
                background: '#dcfce7',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {selectedNode.data.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedEdge && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Connection Properties</h3>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
            {(() => {
              // Получаем актуальное соединение из массива
              const currentEdge = edges.find(e => e.id === selectedEdge.id) || selectedEdge;
              const sourceNode = nodes.find(n => n.id === currentEdge.source);
              const targetNode = nodes.find(n => n.id === currentEdge.target);
              
              return (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>From:</label>
                    <div style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500' }}>
                      {sourceNode?.data.label || 'Unknown'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>To:</label>
                    <div style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500' }}>
                      {targetNode?.data.label || 'Unknown'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Connection Type:</label>
                    <select
                      value={currentEdge.connectionType || CONNECTION_TYPES.PHYSICAL}
                      onChange={(e) => {
                        const updatedEdges = edges.map(ed => {
                          if (ed.id === currentEdge.id) {
                            return {
                              ...ed,
                              connectionType: e.target.value,
                              style: getConnectionStyle(e.target.value, ed.data?.status || 'active')
                            };
                          }
                          return ed;
                        });
                        onSetEdges(updatedEdges);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={CONNECTION_TYPES.PHYSICAL}>Physical (Solid)</option>
                      <option value={CONNECTION_TYPES.ROUTING}>Routing (Dashed)</option>
                      <option value={CONNECTION_TYPES.LOGICAL}>Logical (Double-Dashed)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Status:</label>
                    <select
                      value={currentEdge.data?.status || 'active'}
                      onChange={(e) => {
                        const updatedEdges = edges.map(ed => {
                          if (ed.id === currentEdge.id) {
                            return {
                              ...ed,
                              data: {
                                ...ed.data,
                                status: e.target.value
                              },
                              style: getConnectionStyle(ed.connectionType, e.target.value)
                            };
                          }
                          return ed;
                        });
                        onSetEdges(updatedEdges);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="active">✅ Active</option>
                      <option value="inactive">⏸️ Inactive</option>
                      <option value="error">❌ Error</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Bandwidth (Optional):</label>
                    <input
                      type="text"
                      value={currentEdge.data?.bandwidth || ''}
                      onChange={(e) => {
                        const updatedEdges = edges.map(ed => {
                          if (ed.id === currentEdge.id) {
                            return {
                              ...ed,
                              data: {
                                ...ed.data,
                                bandwidth: e.target.value
                              }
                            };
                          }
                          return ed;
                        });
                        onSetEdges(updatedEdges);
                      }}
                      placeholder="1Gbps"
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Description:</label>
                    <textarea
                      value={currentEdge.data?.description || ''}
                      onChange={(e) => {
                        const updatedEdges = edges.map(ed => {
                          if (ed.id === currentEdge.id) {
                            return {
                              ...ed,
                              data: {
                                ...ed.data,
                                description: e.target.value
                              }
                            };
                          }
                          return ed;
                        });
                        onSetEdges(updatedEdges);
                      }}
                      placeholder="Connection description"
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const updatedEdges = edges.filter(ed => ed.id !== currentEdge.id);
                      onSetEdges(updatedEdges);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#fecaca';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#fee2e2';
                    }}
                  >
                    🗑️ Delete Connection
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
