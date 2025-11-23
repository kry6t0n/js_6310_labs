import React, { memo, FC } from 'react'

import { Handle, Position, NodeProps } from 'reactflow'

interface CustomNodeData {
  label: string
  type: string
  ip?: string
  mask?: string
  status: string
}

const CustomNode: FC<NodeProps<CustomNodeData>> = memo(({ data }) => {
  const getNodeStyle = (type: string) => {
    const styles: Record<string, React.CSSProperties> = {
      router: { background: '#e3f2fd', border: '2px solid #2196f3' },
      switch: { background: '#f3e5f5', border: '2px solid #9c27b0' },
      server: { background: '#e8f5e8', border: '2px solid #4caf50' },
      workstation: { background: '#fff3e0', border: '2px solid #ff9800' },
      network: { background: '#f0f4f8', border: '2px solid #64748b' }
    }

    return styles[type] || styles.router
  }

  const getIcon = (type: string): string => {
    const icons: Record<string, string> = {
      router: '🔄',
      switch: '🔀',
      server: '🖥️',
      workstation: '💻',
      network: '🌐'
    }

    return icons[type] || '🔘'
  }

  return (
    <div className="custom-node" style={getNodeStyle(data.type)}>
      <Handle type="target" position={Position.Top} />

      <div className="node-header">
        <span className="node-icon">{getIcon(data.type)}</span>
        <strong>{data.label}</strong>
      </div>

      <div className="node-content">
        {data.type !== 'network' ? (
          <>
            {data.ip && <div>IP: {data.ip}</div>}
            {data.mask && <div style={{ fontSize: '11px', color: '#666' }}>Mask: {data.mask}</div>}
            <div className={`status ${data.status}`}>
              Status: {data.status}
            </div>
          </>
        ) : (
          <div className={`status ${data.status}`}>
            Global Network
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

CustomNode.displayName = 'CustomNode'

export default CustomNode
