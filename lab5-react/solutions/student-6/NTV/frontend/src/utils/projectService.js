// utils/projectService.js
// Сервис для управления сохранением проектов

const STORAGE_KEY = 'network_projects';

export const projectService = {
  // Получить все проекты пользователя
  getUserProjects: (userId) => {
    try {
      const allProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return allProjects[userId] || [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  },

  // Сохранить новый проект
  saveProject: (userId, projectName, topology) => {
    try {
      const allProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      
      if (!allProjects[userId]) {
        allProjects[userId] = [];
      }

      const newProject = {
        id: Date.now().toString(),
        name: projectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: topology.nodes,
        edges: topology.edges,
        description: ''
      };

      // Проверяем, не существует ли уже проект с таким именем
      const existingIndex = allProjects[userId].findIndex(p => p.name === projectName);
      
      if (existingIndex !== -1) {
        // Обновляем существующий проект
        allProjects[userId][existingIndex] = {
          ...allProjects[userId][existingIndex],
          ...newProject,
          createdAt: allProjects[userId][existingIndex].createdAt
        };
      } else {
        // Добавляем новый проект
        allProjects[userId].push(newProject);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
      return newProject;
    } catch (error) {
      console.error('Error saving project:', error);
      throw new Error('Failed to save project');
    }
  },

  // Получить конкретный проект
  getProject: (userId, projectId) => {
    try {
      const projects = projectService.getUserProjects(userId);
      return projects.find(p => p.id === projectId);
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  },

  // Удалить проект
  deleteProject: (userId, projectId) => {
    try {
      const allProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      
      if (allProjects[userId]) {
        allProjects[userId] = allProjects[userId].filter(p => p.id !== projectId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  },

  // Обновить проект
  updateProject: (userId, projectId, updates) => {
    try {
      const allProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      
      if (allProjects[userId]) {
        const projectIndex = allProjects[userId].findIndex(p => p.id === projectId);
        
        if (projectIndex !== -1) {
          allProjects[userId][projectIndex] = {
            ...allProjects[userId][projectIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
          return allProjects[userId][projectIndex];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  },

  // Получить статистику пользователя
  getUserStats: (userId) => {
    try {
      const projects = projectService.getUserProjects(userId);
      let totalNodes = 0;
      let totalEdges = 0;

      projects.forEach(project => {
        totalNodes += project.nodes?.length || 0;
        totalEdges += project.edges?.length || 0;
      });

      return {
        totalProjects: projects.length,
        totalNodes,
        totalEdges,
        recentProject: projects[projects.length - 1] || null
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalProjects: 0,
        totalNodes: 0,
        totalEdges: 0,
        recentProject: null
      };
    }
  }
};

export default projectService;
