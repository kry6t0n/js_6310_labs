/**
 * Утилиты валидации для форм и сетевых адресов
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email.trim()) {
    return { valid: false, error: 'Email is required' }
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

export const validateUsername = (username: string): ValidationResult => {
  if (!username.trim()) {
    return { valid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (username.length > 20) {
    return { valid: false, error: 'Username must not exceed 20 characters' }
  }

  return { valid: true }
}

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' }
  }

  return { valid: true }
}

export const validateIP = (ip: string): ValidationResult => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/

  if (!ip.trim()) {
    return { valid: false, error: 'IP address is required' }
  }

  if (!ipRegex.test(ip)) {
    return { valid: false, error: 'Invalid IP format' }
  }

  const parts = ip.split('.')

  for (const part of parts) {
    const num = parseInt(part, 10)

    if (num < 0 || num > 255) {
      return { valid: false, error: 'IP octets must be between 0 and 255' }
    }
  }

  return { valid: true }
}

export const validateSubnetMask = (mask: string): ValidationResult => {
  const maskRegex = /^(\d{1,3}\.){3}\d{1,3}$/

  if (!mask.trim()) {
    return { valid: false, error: 'Subnet mask is required' }
  }

  if (!maskRegex.test(mask)) {
    return { valid: false, error: 'Invalid subnet mask format' }
  }

  const parts = mask.split('.')

  for (const part of parts) {
    const num = parseInt(part, 10)

    if (num < 0 || num > 255) {
      return { valid: false, error: 'Mask octets must be between 0 and 255' }
    }
  }

  const maskBinary = parts.map((part) => parseInt(part, 10).toString(2).padStart(8, '0')).join('')
  const firstZeroIndex = maskBinary.indexOf('0')

  if (firstZeroIndex !== -1) {
    const afterFirstZero = maskBinary.substring(firstZeroIndex)

    if (afterFirstZero.includes('1')) {
      return { valid: false, error: 'Invalid subnet mask: non-contiguous bits' }
    }
  }

  return { valid: true }
}

export const validateProjectName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { valid: false, error: 'Project name is required' }
  }

  if (name.length > 100) {
    return { valid: false, error: 'Project name must not exceed 100 characters' }
  }

  return { valid: true }
}

export const validateNodeLabel = (label: string): ValidationResult => {
  if (!label.trim()) {
    return { valid: false, error: 'Node label is required' }
  }

  if (label.length > 50) {
    return { valid: false, error: 'Node label must not exceed 50 characters' }
  }

  return { valid: true }
}

export interface TopologyValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateTopologyData = (data: any): TopologyValidationResult => {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Topology data must be an object'] }
  }

  if (!Array.isArray(data.nodes)) {
    errors.push('Topology must have a nodes array')
  }

  if (!Array.isArray(data.edges)) {
    errors.push('Topology must have an edges array')
  }

  if (Array.isArray(data.nodes)) {
    data.nodes.forEach((node: any, index: number) => {
      if (!node.id) {
        errors.push(`Node at index ${index} must have an id`)
      }

      if (!node.position || typeof node.position !== 'object') {
        errors.push(`Node ${node.id} must have a position object`)
      }

      if (!node.data || typeof node.data !== 'object') {
        errors.push(`Node ${node.id} must have a data object`)
      }
    })
  }

  if (Array.isArray(data.edges)) {
    data.edges.forEach((edge: any, index: number) => {
      if (!edge.id) {
        errors.push(`Edge at index ${index} must have an id`)
      }

      if (!edge.source) {
        errors.push(`Edge ${edge.id} must have a source`)
      }

      if (!edge.target) {
        errors.push(`Edge ${edge.id} must have a target`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
