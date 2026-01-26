// API service to communicate with backend
class ApiService {
  private baseUrl: string;
  private mockData: {
    users: any[];
    projects: any[];
    pendingRegistrations: any[];
  };

  constructor() {
    // In production, this would be your backend URL
    // For now, we'll use a mock implementation that simulates API calls
    this.baseUrl = 'https://roadpro-api.example.com'; // Placeholder
    this.mockData = {
      users: [
        {
          id: 'admin-1',
          name: 'System Administrator',
          email: 'admin@roadpro.com',
          phone: '+1234567890',
          role: 'ADMIN',
          avatar: 'https://ui-avatars.com/api/?name=System+Administrator&background=random'
        }
      ],
      projects: [],
      pendingRegistrations: []
    };
  }

  // Mock delay to simulate network requests
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // User Management
  async getUsers() {
    await this.delay();
    return this.mockData.users;
  }

  async createUser(userData) {
    await this.delay();
    
    // Check if user already exists
    const existingUser = this.mockData.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      createdAt: new Date().toISOString()
    };
    
    this.mockData.users.push(newUser);
    return newUser;
  }

  async loginUser(email, password) {
    await this.delay();
    
    const user = this.mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token: 'mock-jwt-token-' + Date.now()
    };
  }

  // Pending Registrations
  async getPendingRegistrations() {
    await this.delay();
    return this.mockData.pendingRegistrations;
  }

  async submitRegistration(registrationData) {
    await this.delay();
    
    const existingPending = this.mockData.pendingRegistrations.find(
      r => r.email.toLowerCase() === registrationData.email.toLowerCase()
    );
    
    if (existingPending) {
      throw new Error('Registration already pending');
    }
    
    const pendingReg = {
      id: `pending-${Date.now()}`,
      ...registrationData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.mockData.pendingRegistrations.push(pendingReg);
    return pendingReg;
  }

  async approveRegistration(id) {
    await this.delay();
    
    const pendingUser = this.mockData.pendingRegistrations.find(r => r.id === id);
    if (!pendingUser) {
      throw new Error('Pending registration not found');
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      role: pendingUser.requestedRole,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(pendingUser.name)}&background=random`,
      createdAt: new Date().toISOString()
    };
    
    this.mockData.users.push(newUser);
    this.mockData.pendingRegistrations = this.mockData.pendingRegistrations.filter(r => r.id !== id);
    
    return newUser;
  }

  async rejectRegistration(id) {
    await this.delay();
    
    this.mockData.pendingRegistrations = this.mockData.pendingRegistrations.filter(r => r.id !== id);
  }

  // Projects
  async getProjects() {
    await this.delay();
    return this.mockData.projects;
  }

  async createProject(projectData) {
    await this.delay();
    
    const project = {
      id: `proj-${Date.now()}`,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockData.projects.push(project);
    return project;
  }

  async updateProject(id, projectData) {
    await this.delay();
    
    const index = this.mockData.projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    this.mockData.projects[index] = {
      ...this.mockData.projects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    
    return this.mockData.projects[index];
  }

  async deleteProject(id) {
    await this.delay();
    
    this.mockData.projects = this.mockData.projects.filter(p => p.id !== id);
  }

  // Health check
  async healthCheck() {
    await this.delay(100);
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

// Export singleton instance
export const apiService = new ApiService();