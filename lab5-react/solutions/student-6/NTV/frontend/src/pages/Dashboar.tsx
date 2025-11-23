import React, { FC } from 'react'

import { Link } from 'react-router-dom'

import Header from '../components/Layout/Header'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Dashboard.css'

interface QuickAction {
  icon: string
  title: string
  description: string
  link: string
  badge: string | null
  color: string
}

const Dashboard: FC = () => {
  const { user } = useAuth()

  const quickActions: QuickAction[] = [
    {
      icon: '🛠️',
      title: 'Create New Topology',
      description: 'Start building your network infrastructure from scratch with our intuitive drag-and-drop editor',
      link: '/editor',
      badge: 'New',
      color: 'primary'
    },
    {
      icon: '👤',
      title: 'My Account',
      description: 'Manage your profile, view saved projects, and check your usage statistics',
      link: '/account',
      badge: null,
      color: 'secondary'
    },
    {
      icon: '📚',
      title: 'Documentation',
      description: 'Learn how to make the most of our topology visualization tools and features',
      link: '#',
      badge: 'Coming Soon',
      color: 'muted'
    },
    {
      icon: '🔄',
      title: 'Network Templates',
      description: 'Start with pre-built network templates for common scenarios and architectures',
      link: '#',
      badge: 'Coming Soon',
      color: 'muted'
    }
  ]

  const handleComingSoon = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    if ((e.currentTarget as HTMLAnchorElement).getAttribute('href') === '#') {
      e.preventDefault()
      alert('This feature is coming soon!')
    }
  }

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content container">
        <div className="welcome-section">
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p>Design, visualize, and manage your network infrastructure with our powerful topology visualization tool</p>
        </div>

        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="action-card"
              onClick={handleComingSoon}
            >
              <div className="card-icon">{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              {action.badge && (
                <span className={`card-badge ${action.color === 'muted' ? 'coming-soon' : ''}`}>
                  {action.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="recent-section">
          <h2>Recent Projects</h2>
          <div className="recent-list">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No recent projects found</p>
              <Link to="/editor" className="create-link">
                Create your first network topology
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
