import React, { useState, useEffect, FC } from 'react'

import NetworkCanvas from '../components/Canvas/NetworkCanvas'
import Header from '../components/Layout/Header'
import { useAuth } from '../contexts/AuthContext'
import { validateConnections } from '../utils/connectionLogic'
import projectService from '../utils/projectService'
import '../styles/Editor.css'

interface Node {
  id: string
  data: {
    type: string
    ip?: string
    [key: string]: unknown
  }
}

interface Edge {
  id: string
  source: string
  target: string
}

interface ValidationResult {
  hasDuplicates: boolean
  duplicates: string[]
  hasInvalidIPs: boolean
  invalidIPs?: string[]
}

interface ConnectionValidation {
  valid: boolean
  errors: string[]
}

declare global {
  interface Window {
    __editorNodes?: Node[]
    __editorEdges?: Edge[]
    addEventListener(event: string, handler: EventListener): void
    removeEventListener(event: string, handler: EventListener): void
  }
}

const Editor: FC = () => {
  const { user } = useAuth()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    // Слушаем событие сохранения из Toolbar
    const handleSaveEvent = (): void => {
      setShowSaveDialog(true)
      setSaveStatus('')
      setSaveError('')
    }

    window.addEventListener('saveProject', handleSaveEvent)

    return () => window.removeEventListener('saveProject', handleSaveEvent)
  }, [])

  const handleSaveProject = (): void => {
    setShowSaveDialog(true)
  }

  const checkDuplicateIPs = (nodes: Node[]): ValidationResult => {
    // Фильтруем устройства (не сеть) с IP адресами
    const deviceNodes = nodes.filter(node =>
      node.data.type !== 'network' &&
      node.data.ip &&
      (node.data.ip as string).trim() !== ''
    )

    const ips = deviceNodes.map(node => node.data.ip as string)
    const duplicates = ips.filter((ip, index) => ips.indexOf(ip) !== index)

    if (duplicates.length > 0) {
      return {
        hasDuplicates: true,
        duplicates: [...new Set(duplicates)],
        hasInvalidIPs: false
      }
    }

    // Проверяем на невалидные IP адреса
    const invalidIPs: string[] = []
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/

    deviceNodes.forEach(node => {
      const ip = node.data.ip as string

      if (!ipRegex.test(ip)) {
        invalidIPs.push(ip)
      } else {
        const parts = ip.split('.')

        if (!parts.every(part => {
          const num = parseInt(part)

          return num >= 0 && num <= 255
        })) {
          invalidIPs.push(ip)
        }
      }
    })

    if (invalidIPs.length > 0) {
      return {
        hasDuplicates: false,
        duplicates: [],
        hasInvalidIPs: true,
        invalidIPs: [...new Set(invalidIPs)]
      }
    }

    return {
      hasDuplicates: false,
      duplicates: [],
      hasInvalidIPs: false
    }
  }

  const confirmSaveProject = (nodes: Node[], edges: Edge[]): void => {
    setSaveError('')

    if (!projectName.trim()) {
      setSaveStatus('error')
      setSaveError('Project name is required')

      return
    }

    // Проверяем на дубликаты и невалидные IP
    const ipCheck = checkDuplicateIPs(nodes)

    if (ipCheck.hasDuplicates) {
      setSaveStatus('error')
      setSaveError(`Duplicate IP addresses found: ${ipCheck.duplicates.join(', ')}`)

      return
    }

    if (ipCheck.hasInvalidIPs) {
      setSaveStatus('error')
      setSaveError(`Invalid IP addresses found: ${ipCheck.invalidIPs?.join(', ')}`)

      return
    }

    // Проверяем корректность соединений
    const connectionValidation = validateConnections(nodes, edges) as ConnectionValidation

    if (!connectionValidation.valid) {
      setSaveStatus('error')
      setSaveError(`Connection errors:\n${connectionValidation.errors.join('\n')}`)

      return
    }

    try {
      projectService.saveProject(user!.id, projectName, {
        nodes,
        edges
      })
      setSaveStatus('success')
      setProjectName('')
      setTimeout(() => {
        setShowSaveDialog(false)
        setSaveStatus('')
        setSaveError('')
      }, 2000)
    } catch (error) {
      setSaveStatus('error')
      setSaveError('Failed to save project')
    }
  }

  return (
    <div className="editor-container">
      <Header />
      <NetworkCanvas />

      {showSaveDialog && (
        <div className="save-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="save-dialog" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2>Сохранить проект</h2>
            <input
              type="text"
              placeholder="Введите имя проекта..."
              value={projectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
              className="project-name-input"
              onKeyPress={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  const nodes = window.__editorNodes || []
                  const edges = window.__editorEdges || []

                  confirmSaveProject(nodes, edges)
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
                  setShowSaveDialog(false)
                  setSaveStatus('')
                  setSaveError('')
                }}
              >
                Отменить
              </button>
              <button
                className="btn-save"
                onClick={() => {
                  const nodes = window.__editorNodes || []
                  const edges = window.__editorEdges || []

                  confirmSaveProject(nodes, edges)
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Editor
