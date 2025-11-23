// utils/projectService.ts
// Сервис для управления сохранением проектов

const STORAGE_KEY = 'network_projects'

interface Topology {
  nodes: unknown[]
  edges: unknown[]
}

interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  nodes: unknown[]
  edges: unknown[]
  description: string
}

interface UserProjects {
  [userId: string]: Project[]
}

interface ProjectStats {
  totalProjects: number
  totalNodes: number
  totalEdges: number
}

const projectService = {
  // Получить все проекты пользователя
  getUserProjects: (userId: string): Project[] => {
    try {
      const allProjects: UserProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

      return allProjects[userId] || []
    } catch (error) {
      console.error('Error loading projects:', error)

      return []
    }
  },

  // Сохранить новый проект
  saveProject: (userId: string, projectName: string, topology: Topology): Project => {
    try {
      const allProjects: UserProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

      if (!allProjects[userId]) {
        allProjects[userId] = []
      }

      const newProject: Project = {
        id: Date.now().toString(),
        name: projectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: topology.nodes,
        edges: topology.edges,
        description: ''
      }

      // Проверяем, не существует ли уже проект с таким именем
      const existingIndex = allProjects[userId].findIndex(p => p.name === projectName)

      if (existingIndex !== -1) {
        // Обновляем существующий проект
        allProjects[userId][existingIndex] = {
          ...allProjects[userId][existingIndex],
          ...newProject,
          createdAt: allProjects[userId][existingIndex].createdAt
        }
      } else {
        // Добавляем новый проект
        allProjects[userId].push(newProject)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects))

      return newProject
    } catch (error) {
      console.error('Error saving project:', error)
      throw new Error('Failed to save project')
    }
  },

  // Получить конкретный проект
  getProject: (userId: string, projectId: string): Project | null => {
    try {
      const projects = projectService.getUserProjects(userId)

      return projects.find(p => p.id === projectId) || null
    } catch (error) {
      console.error('Error loading project:', error)

      return null
    }
  },

  // Удалить проект
  deleteProject: (userId: string, projectId: string): boolean => {
    try {
      const allProjects: UserProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

      if (allProjects[userId]) {
        allProjects[userId] = allProjects[userId].filter(p => p.id !== projectId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects))

        return true
      }

      return false
    } catch (error) {
      console.error('Error deleting project:', error)
      throw new Error('Failed to delete project')
    }
  },

  // Обновить проект
  updateProject: (userId: string, projectId: string, updates: Partial<Project>): Project | null => {
    try {
      const allProjects: UserProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

      if (allProjects[userId]) {
        const projectIndex = allProjects[userId].findIndex(p => p.id === projectId)

        if (projectIndex !== -1) {
          allProjects[userId][projectIndex] = {
            ...allProjects[userId][projectIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects))

          return allProjects[userId][projectIndex]
        }
      }

      return null
    } catch (error) {
      console.error('Error updating project:', error)
      throw new Error('Failed to update project')
    }
  },

  // Получить статистику пользователя
  getUserStats: (userId: string): ProjectStats => {
    try {
      const projects = projectService.getUserProjects(userId)
      let totalNodes = 0
      let totalEdges = 0

      projects.forEach(project => {
        totalNodes += (project.nodes?.length || 0) as number
        totalEdges += (project.edges?.length || 0) as number
      })

      return {
        totalProjects: projects.length,
        totalNodes,
        totalEdges
      }
    } catch (error) {
      console.error('Error calculating stats:', error)

      return {
        totalProjects: 0,
        totalNodes: 0,
        totalEdges: 0
      }
    }
  }
}

export default projectService
