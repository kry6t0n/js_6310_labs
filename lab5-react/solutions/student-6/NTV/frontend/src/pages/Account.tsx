import React, { useState, useEffect, FC } from 'react'

import { useNavigate } from 'react-router-dom'

import Header from '../components/Layout/Header'
import { useAuth } from '../contexts/AuthContext'
import projectService from '../utils/projectService'
import '../styles/Account.css'

interface ProjectStats {
  totalProjects: number
  totalNodes: number
  totalEdges: number
}

interface Project {
  id: string
  name: string
  description?: string
  nodes?: unknown[]
  edges?: unknown[]
  createdAt: string
  updatedAt: string
}

const Account: FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userTopologies, setUserTopologies] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    totalNodes: 0,
    totalEdges: 0
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    // Загружаем проекты при открытии страницы
    if (user?.id) {
      loadProjects()
    }
  }, [user])

  const loadProjects = (): void => {
    try {
      const projects = projectService.getUserProjects(user!.id)

      setUserTopologies(projects)

      const userStats = projectService.getUserStats(user!.id)

      setStats(userStats)
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const handleDeleteProject = (projectId: string): void => {
    try {
      projectService.deleteProject(user!.id, projectId)
      loadProjects()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleOpenProject = (projectId: string): void => {
    // Сохраняем текущий проект ID в sessionStorage для загрузки в Editor
    sessionStorage.setItem('currentProjectId', projectId)
    navigate('/editor')
  }

  const handleExportProject = (project: Project): void => {
    const dataStr = JSON.stringify({
      name: project.name,
      nodes: project.nodes,
      edges: project.edges
    }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')

    link.href = URL.createObjectURL(dataBlob)
    link.download = `${project.name}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="account-page">
      <Header />

      <div className="account-content">
        <div className="profile-section">
          <div className="profile-header">
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1>{user?.username}</h1>
              <p>{user?.role || 'Network Engineer'}</p>
              <span className="member-since">
                Member since {new Date(user?.createdAt || '').toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        <div className="topologies-section">
          <div className="section-header">
            <h2>My Topologies ({userTopologies.length})</h2>
            <button
              className="btn-primary"
              onClick={() => navigate('/editor')}
            >
              + New Topology
            </button>
          </div>

          {userTopologies.length === 0 ? (
            <div className="empty-topologies">
              <div className="empty-icon">📋</div>
              <p>No topologies yet</p>
              <p className="empty-hint">Create your first topology using the editor</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/editor')}
              >
                Go to Editor
              </button>
            </div>
          ) : (
            <div className="topologies-grid">
              {userTopologies.map(topology => (
                <div key={topology.id} className="topology-card">
                  <div className="card-header">
                    <h3>{topology.name}</h3>
                    <span className="date">{formatDate(topology.createdAt)}</span>
                  </div>
                  <div className="card-stats">
                    <span>📍 Nodes: {topology.nodes?.length || 0}</span>
                    <span>🔗 Connections: {topology.edges?.length || 0}</span>
                  </div>
                  <div className="card-description">
                    {topology.description && <p>{topology.description}</p>}
                    <small>Updated: {formatDate(topology.updatedAt)}</small>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-outline"
                      onClick={() => handleExportProject(topology)}
                    >
                      📤 Export
                    </button>
                    <button
                      className="btn-text danger"
                      onClick={() => setDeleteConfirm(topology.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {deleteConfirm === topology.id && (
                    <div className="delete-confirm">
                      <p>Are you sure?</p>
                      <div className="confirm-buttons">
                        <button
                          className="btn-cancel"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProject(topology.id)}
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stats-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Projects</h3>
              <p className="stat-number">{stats.totalProjects}</p>
            </div>
            <div className="stat-card">
              <h3>Total Nodes</h3>
              <p className="stat-number">{stats.totalNodes}</p>
            </div>
            <div className="stat-card">
              <h3>Total Connections</h3>
              <p className="stat-number">{stats.totalEdges}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
