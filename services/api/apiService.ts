// API service to communicate with backend
class ApiService {





  // User Management
  async getUsers() {
    try {
      const response = await fetch(`/api/users`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiUsers = await response.json();
      return apiUsers;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const createdUser = await response.json();
      return createdUser;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      return updatedUser;
    } catch (error: any) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // If API endpoint doesn't exist (404), allow fallback to work
      if (response.status === 404) {
        console.log('API login endpoint not found, allowing fallback authentication');
        throw new Error('API endpoint not found');
      }
      
      if (!response.ok) {
        // Try to parse error response, but handle if it's not JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Login failed');
        } catch (parseError) {
          // If we can't parse JSON, throw a generic error
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API login request failed:', error);
      throw error;
    }
  }

  // Pending Registrations
  async getPendingRegistrations() {
    try {
      const response = await fetch(`/api/pending-registrations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Failed to fetch pending registrations:', error);
      throw error;
    }
  }

  async submitRegistration(registrationData) {
    try {
      const response = await fetch(`/api/pending-registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit registration');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async approveRegistration(id) {
    try {
      const response = await fetch(`/api/pending-registrations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve registration');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async rejectRegistration(id) {
    try {
      const response = await fetch(`/api/pending-registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject registration');
      }
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getProjects() {
    try {
      const response = await fetch(`/api/projects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If API endpoint doesn't exist (404), return empty array to allow fallback
      if (response.status === 404) {
        console.log('API projects endpoint not found, returning empty array for fallback');
        return [];
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      // Return empty array to allow fallback to localStorage/SQLite
      return [];
    }
  }

  async createProject(projectData) {
    try {
      const response = await fetch(`/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async updateProject(id, projectData) {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`/api/health`);
      // If API endpoint doesn't exist (404), return mock health status
      if (response.status === 404) {
        console.log('API health endpoint not found, returning mock health status');
        return { status: 'ok', message: 'API not available, using local storage' };
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error('API health check failed:', error);
      // Return mock health status for fallback
      return { status: 'degraded', message: 'API unavailable, using local fallback' };
    }
  }

  // Staff Management APIs
  async getLeaveRequests() {
    try {
      const response = await fetch(`/api/leave-requests`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Failed to fetch leave requests:', error);
      throw error;
    }
  }

  async createLeaveRequest(leaveRequest: any) {
    try {
      const response = await fetch(`/api/leave-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveRequest)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create leave request');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async updateLeaveRequest(id: string, updates: any) {
    try {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update leave request');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }


}

// Export singleton instance
export const apiService = new ApiService();