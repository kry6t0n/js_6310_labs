/**
 * Логика для управления соединениями между устройствами в сети
 */

export const CONNECTION_TYPES = {
  PHYSICAL: 'physical',      // Физическое соединение (кабель)
  ROUTING: 'routing',        // Маршрутизация между подсетями
  LOGICAL: 'logical'         // Логическое соединение (VLAN, VPN)
}

export const CONNECTION_STYLES = {
  physical: {
    strokeDasharray: 'none',
    strokeWidth: 2,
    label: 'Physical'
  },
  routing: {
    strokeDasharray: '5,5',
    strokeWidth: 2,
    label: 'Routing'
  },
  logical: {
    strokeDasharray: '10,5',
    strokeWidth: 2,
    label: 'Logical'
  }
}

export const CONNECTION_STATUS_STYLES = {
  active: {
    stroke: '#10b981',
    opacity: 1
  },
  inactive: {
    stroke: '#ef9a00',
    opacity: 0.6
  },
  error: {
    stroke: '#ef4444',
    opacity: 1,
    strokeDasharray: '3,3'
  }
}

interface ConnectionStyle {
  strokeDasharray: string
  strokeWidth?: number
  stroke?: string
  opacity?: number
}

export const getConnectionStyle = (connectionType: string = 'physical', status: string = 'active'): ConnectionStyle => {
  const typeStyle = (CONNECTION_STYLES as Record<string, any>)[connectionType] || CONNECTION_STYLES.physical
  const statusStyle = (CONNECTION_STATUS_STYLES as Record<string, any>)[status] || CONNECTION_STATUS_STYLES.active

  return {
    ...typeStyle,
    stroke: statusStyle.stroke,
    opacity: statusStyle.opacity,
    strokeDasharray: status === 'error' ? statusStyle.strokeDasharray : typeStyle.strokeDasharray
  }
}

export const getNetworkAddress = (ip: string | null, mask: string): string | null => {
  if (!ip || !mask) return null

  try {
    const ipParts = ip.split('.').map(Number)
    const maskParts = mask.split('.').map(Number)

    if (ipParts.length !== 4 || maskParts.length !== 4) {
      return null
    }

    for (let i = 0; i < 4; i++) {
      if (isNaN(ipParts[i]) || isNaN(maskParts[i]) ||
        ipParts[i] < 0 || ipParts[i] > 255 ||
        maskParts[i] < 0 || maskParts[i] > 255) {
        return null
      }
    }

    const network = ipParts.map((part, i) => part & maskParts[i])
    return network.join('.')
  } catch (error) {
    console.error('Error calculating network address:', error)
    return null
  }
}

export const areIPsCompatible = (sourceIP: string, sourceMask: string, targetIP: string, targetMask: string): boolean => {
  const sourceNetwork = getNetworkAddress(sourceIP, sourceMask)
  const targetNetwork = getNetworkAddress(targetIP, targetMask)

  if (!sourceNetwork || !targetNetwork) return false
  return sourceNetwork === targetNetwork
}

interface CanConnectResult {
  allowed: boolean
  message: string
}

export const canConnectNodes = (sourceNode: any, targetNode: any): CanConnectResult => {
  if (!sourceNode || !targetNode) {
    return { allowed: false, message: 'Invalid nodes' }
  }

  // Узел не может соединяться сам с собой
  if (sourceNode.id === targetNode.id) {
    return { allowed: false, message: 'A node cannot connect to itself' }
  }

  const sourceType = sourceNode.data?.type
  const targetType = targetNode.data?.type

  // Network/Internet не может быть источником
  if (sourceType === 'network') {
    return { allowed: false, message: 'Network cannot be a source' }
  }

  // Проверяем IP совместимость
  if (sourceType !== 'network' && targetType !== 'network') {
    const sourceIP = sourceNode.data?.ip
    const sourceMask = sourceNode.data?.mask
    const targetIP = targetNode.data?.ip
    const targetMask = targetNode.data?.mask

    if (sourceIP && sourceMask && targetIP && targetMask) {
      const sourceNetwork = getNetworkAddress(sourceIP, sourceMask)
      const targetNetwork = getNetworkAddress(targetIP, targetMask)

      if (sourceNetwork && targetNetwork && sourceNetwork !== targetNetwork) {
        return { allowed: false, message: 'Devices must be in the same network' }
      }
    }
  }

  return { allowed: true, message: 'Connection allowed' }
}

export const getSuggestedConnectionType = (sourceNode: any, targetNode: any): string => {
  const sourceType = sourceNode.data?.type
  const targetType = targetNode.data?.type

  if (targetType === 'network') {
    return CONNECTION_TYPES.ROUTING
  }

  if ((sourceType === 'router' || targetType === 'router') && sourceType !== targetType) {
    return CONNECTION_TYPES.ROUTING
  }

  if ((sourceType === 'switch' || targetType === 'switch') && sourceType !== targetType) {
    return CONNECTION_TYPES.PHYSICAL
  }

  return CONNECTION_TYPES.PHYSICAL
}

interface EdgeInfo {
  type: string
  label: string
  description: string
  source?: string
  target?: string
}

export const getEdgeInfo = (edge: any, nodes?: any[]): EdgeInfo => {
  const connectionType = edge.connectionType || 'physical'
  const typeStyles = (CONNECTION_STYLES as Record<string, any>)[connectionType]

  return {
    type: connectionType,
    label: typeStyles?.label || 'Unknown',
    description: `${typeStyles?.label} connection`,
    source: edge.source,
    target: edge.target
  }
}

export const validateConnections = (nodes: any[], edges: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)

    if (!sourceNode || !targetNode) {
      errors.push(`Invalid edge: ${edge.id}`)
      return
    }

    const check = canConnectNodes(sourceNode, targetNode)
    if (!check.allowed) {
      errors.push(`Connection error between ${sourceNode.data?.label} and ${targetNode.data?.label}: ${check.message}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
