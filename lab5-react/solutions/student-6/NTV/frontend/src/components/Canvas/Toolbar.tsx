import React, { useRef, useState, useEffect, FC, RefObject, ChangeEvent } from 'react'

import { Node, Edge } from 'reactflow'

import { CONNECTION_TYPES, CONNECTION_STYLES, getConnectionStyle, getEdgeInfo } from '../../utils/connectionLogic'
import { exportToJson, importFromJson } from '../../utils/exportUtils'

interface ToolbarProps {
  onAddNode: (type: string) => void
  selectedNode: Node | null
  selectedEdge: Edge | null
  nodes: Node[]
  edges: Edge[]
  onSetNodes: (nodes: Node[]) => void
  onSetEdges: (edges: Edge[]) => void
}

interface DeviceType {
  type: string
  label: string
  icon: string
}

const Toolbar: FC<ToolbarProps> = ({
  onAddNode,
  selectedNode,
  selectedEdge,
  nodes,
  edges,
  onSetNodes,
  onSetEdges
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editError, setEditError] = useState('')
  const [localIP, setLocalIP] = useState('')
  const [localMask, setLocalMask] = useState('')

  // Синхронизируем локальное состояние с selectedNode
  useEffect(() => {
    if (selectedNode) {
      setLocalIP(selectedNode.data?.ip || '')
      setLocalMask(selectedNode.data?.mask || '')
      setEditError('')
    }
  }, [selectedNode?.id])

  const handleExport = (): void => {
    exportToJson({ nodes, edges })
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    if (file) {
      importFromJson(file, onSetNodes, onSetEdges)
    }
  }

  const validateIP = (ip: string): boolean => {
    if (!ip || ip.trim() === '') return true
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/

    if (!ipRegex.test(ip)) return false
    const parts = ip.split('.')

    return parts.every(part => {
      const num = parseInt(part, 10)

      return num >= 0 && num <= 255
    })
  }

  const validateMask = (mask: string): boolean => {
    if (!mask || mask.trim() === '') return true
    const maskRegex = /^(\d{1,3}\.){3}\d{1,3}$/

    if (!maskRegex.test(mask)) return false
    const parts = mask.split('.')

    return parts.every(part => {
      const num = parseInt(part, 10)

      return num >= 0 && num <= 255
    })
  }

  const isIPDuplicate = (ip: string, nodeId: string): boolean => {
    if (!ip || ip.trim() === '') return false

    return nodes.some(node =>
      node.id !== nodeId &&
      node.data?.ip === ip &&
      node.data?.type !== 'network'
    )
  }

  const deviceTypes: DeviceType[] = [
    { type: 'router', label: 'Router', icon: '🔄' },
    { type: 'switch', label: 'Switch', icon: '🔀' },
    { type: 'server', label: 'Server', icon: '🖥️' },
    { type: 'workstation', label: 'Workstation', icon: '💻' }
  ]

  const networkTypes: DeviceType[] = [
    { type: 'network', label: 'Network/Internet', icon: '🌐' }
  ]

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
        <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Export/Import</h3>
        <button
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '8px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={handleExport}
        >
          📥 Export
        </button>
        <button
          style={{
            width: '100%',
            padding: '10px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          📤 Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

      {selectedNode && (
        <div style={{
          background: '#f1f5f9',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '24px'
        }}>
          <h4 style={{ marginBottom: '12px', color: '#1e293b' }}>Node Properties</h4>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#64748b' }}>Type: {selectedNode.data?.type}</label>
          </div>
          {selectedNode.data?.type !== 'network' && (
            <>
              <input
                type="text"
                placeholder="IP Address"
                value={localIP}
                onChange={(e) => setLocalIP(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px'
                }}
              />
              <input
                type="text"
                placeholder="Subnet Mask"
                value={localMask}
                onChange={(e) => setLocalMask(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px'
                }}
              />
              {editError && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>
                  {editError}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedEdge && (
        <div style={{
          background: '#f1f5f9',
          padding: '12px',
          borderRadius: '6px'
        }}>
          <h4 style={{ marginBottom: '12px', color: '#1e293b' }}>Edge Properties</h4>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            <p>From: {selectedEdge.source}</p>
            <p>To: {selectedEdge.target}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Toolbar
