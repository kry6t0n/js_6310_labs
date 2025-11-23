import React, { useState, useEffect, FC } from 'react'

import { useNavigate } from 'react-router-dom'

import Header from '../components/Layout/Header'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Admin.css'

interface Stats {
  totalUsers: number
  totalProjects: number
  totalNodes: number
}

interface ProjectItem {
  id: string
  name: string
  userId: string
  ownerName: string
  nodes?: unknown[]
  edges?: unknown[]
  createdAt: string
}

const Admin: FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 3,
    totalProjects: 0,
    totalNodes: 0
  })
  const [allProjects, setAllProjects] = useState<ProjectItem[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Проверяем, является ли пользователь админом
    if (user?.role !== 'Administrator') {
      navigate('/')

      return
    }

    loadAdminData()
  }, [user, navigate])

  const loadAdminData = (): void => {
    try {
      // Получаем все проекты из localStorage
      const storageData = JSON.parse(localStorage.getItem('network_projects') || '{}')
      const projects: ProjectItem[] = []
      let totalProjects = 0
      let totalNodes = 0

      Object.entries(storageData).forEach(([userId, userProjects]) => {
        (userProjects as ProjectItem[]).forEach(project => {
          projects.push({
            ...project,
            userId,
            ownerName: `User ${(userId as string).substring(0, 4)}`
          })
          totalProjects++
          totalNodes += (project.nodes?.length || 0) as number
        })
      })

      setAllProjects(projects)
      setStats({
        totalUsers: 3, // Фиксированное количество
        totalProjects,
        totalNodes
      })
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const handleDeleteProject = (projectId: string, userId: string): void => {
    try {
      const storageData = JSON.parse(localStorage.getItem('network_projects') || '{}')

      if (storageData[userId]) {
        storageData[userId] = (storageData[userId] as ProjectItem[]).filter(p => p.id !== projectId)
        localStorage.setItem('network_projects', JSON.stringify(storageData))
        loadAdminData()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleClearAllData = (): void => {
    if (window.confirm('Are you sure? This will delete ALL projects!')) {
      localStorage.removeItem('network_projects')
      loadAdminData()
    }
  }

  return (
    <div className="admin-page">
      <Header />

      <div className="admin-container">
        <div className="admin-header">
          <div className="header-content">
            <h1>📊 Admin Dashboard</h1>
            <p>Manage users and projects</p>
          </div>
          <button
            className="btn-logout"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Logout
          </button>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Total Projects</h3>
              <p className="stat-value">{stats.totalProjects}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔗</div>
            <div className="stat-info">
              <h3>Total Nodes</h3>
              <p className="stat-value">{stats.totalNodes}</p>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            📦 Projects ({allProjects.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="overview-section">
              <h2>System Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Registered Users</h3>
                  <p>Total registered user accounts in the system</p>
                  <div className="overview-value">{stats.totalUsers}</div>
                </div>
                <div className="overview-card">
                  <h3>Created Projects</h3>
                  <p>Total network topology projects created</p>
                  <div className="overview-value">{stats.totalProjects}</div>
                </div>
                <div className="overview-card">
                  <h3>Network Devices</h3>
                  <p>Total nodes across all projects</p>
                  <div className="overview-value">{stats.totalNodes}</div>
                </div>
              </div>

              <div className="recent-projects">
                <h3>Recent Projects</h3>
                {allProjects.slice(0, 5).map(project => (
                  <div key={project.id} className="recent-item">
                    <div className="item-info">
                      <h4>{project.name}</h4>
                      <p className="item-meta">
                        Owner: {project.ownerName} |
                        Created: {new Date(project.createdAt).toLocaleDateString('ru-RU')} |
                        Nodes: {project.nodes?.length || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="tab-content">
            <div className="projects-section">
              <h2>All Projects</h2>
              {allProjects.length === 0 ? (
                <div className="empty-message">
                  <p>No projects yet</p>
                </div>
              ) : (
                <div className="projects-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Owner</th>
                        <th>Nodes</th>
                        <th>Connections</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProjects.map(project => (
                        <tr key={project.id}>
                          <td className="project-name">{project.name}</td>
                          <td>{project.ownerName}</td>
                          <td>{project.nodes?.length || 0}</td>
                          <td>{project.edges?.length || 0}</td>
                          <td>{new Date(project.createdAt).toLocaleDateString('ru-RU')}</td>
                          <td>
                            <button
                              className="btn-delete-small"
                              onClick={() => handleDeleteProject(project.id, project.userId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="settings-section">
              <h2>System Settings</h2>

              <div className="settings-group">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-actions">
                  <button
                    className="btn-danger"
                    onClick={handleClearAllData}
                  >
                    🗑️ Clear All Data
                  </button>
                  <p className="danger-warning">
                    This action will delete all projects and cannot be undone. Proceed with caution!
                  </p>
                </div>
              </div>

              <div className="settings-group">
                <h3>System Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <label>Application Version</label>
                    <span>1.0.0</span>
                  </div>
                  <div className="info-item">
                    <label>Storage Type</label>
                    <span>Browser Local Storage</span>
                  </div>
                  <div className="info-item">
                    <label>Total Projects</label>
                    <span>{stats.totalProjects}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Nodes</label>
                    <span>{stats.totalNodes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
