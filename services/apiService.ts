import { Project, ScheduleTask, BOQItem, RFI, LabTest, Vehicle, ProjectDocument, DailyReport, StructureAsset, Defect, Comment, AuditLog, AccountingTransaction } from '../types';

// Interface for API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Interface for API configuration
export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// Main API service class
export class ApiService {
  private config: ApiConfig;
  
  constructor(config: ApiConfig) {
    this.config = config;
  }

  // Generic request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const config = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  // Project-related endpoints
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>('/api/projects');
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async createProject(project: Omit<Project, 'id'>): Promise<ApiResponse<Project>> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Schedule task endpoints
  async getTasks(projectId: string): Promise<ApiResponse<ScheduleTask[]>> {
    return this.request<ScheduleTask[]>(`/api/projects/${projectId}/tasks`);
  }

  async getTask(projectId: string, taskId: string): Promise<ApiResponse<ScheduleTask>> {
    return this.request<ScheduleTask>(`/api/projects/${projectId}/tasks/${taskId}`);
  }

  async createTask(projectId: string, task: Omit<ScheduleTask, 'id'>): Promise<ApiResponse<ScheduleTask>> {
    return this.request<ScheduleTask>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(projectId: string, taskId: string, task: Partial<ScheduleTask>): Promise<ApiResponse<ScheduleTask>> {
    return this.request<ScheduleTask>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(projectId: string, taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // BOQ item endpoints
  async getBOQItems(projectId: string): Promise<ApiResponse<BOQItem[]>> {
    return this.request<BOQItem[]>(`/api/projects/${projectId}/boq`);
  }

  async getBOQItem(projectId: string, itemId: string): Promise<ApiResponse<BOQItem>> {
    return this.request<BOQItem>(`/api/projects/${projectId}/boq/${itemId}`);
  }

  async createBOQItem(projectId: string, item: Omit<BOQItem, 'id'>): Promise<ApiResponse<BOQItem>> {
    return this.request<BOQItem>(`/api/projects/${projectId}/boq`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateBOQItem(projectId: string, itemId: string, item: Partial<BOQItem>): Promise<ApiResponse<BOQItem>> {
    return this.request<BOQItem>(`/api/projects/${projectId}/boq/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteBOQItem(projectId: string, itemId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/boq/${itemId}`, {
      method: 'DELETE',
    });
  }

  // RFI endpoints
  async getRFIs(projectId: string): Promise<ApiResponse<RFI[]>> {
    return this.request<RFI[]>(`/api/projects/${projectId}/rfis`);
  }

  async getRFI(projectId: string, rfiId: string): Promise<ApiResponse<RFI>> {
    return this.request<RFI>(`/api/projects/${projectId}/rfis/${rfiId}`);
  }

  async createRFI(projectId: string, rfi: Omit<RFI, 'id'>): Promise<ApiResponse<RFI>> {
    return this.request<RFI>(`/api/projects/${projectId}/rfis`, {
      method: 'POST',
      body: JSON.stringify(rfi),
    });
  }

  async updateRFI(projectId: string, rfiId: string, rfi: Partial<RFI>): Promise<ApiResponse<RFI>> {
    return this.request<RFI>(`/api/projects/${projectId}/rfis/${rfiId}`, {
      method: 'PUT',
      body: JSON.stringify(rfi),
    });
  }

  async deleteRFI(projectId: string, rfiId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/rfis/${rfiId}`, {
      method: 'DELETE',
    });
  }

  // Lab test endpoints
  async getLabTests(projectId: string): Promise<ApiResponse<LabTest[]>> {
    return this.request<LabTest[]>(`/api/projects/${projectId}/lab-tests`);
  }

  async getLabTest(projectId: string, testId: string): Promise<ApiResponse<LabTest>> {
    return this.request<LabTest>(`/api/projects/${projectId}/lab-tests/${testId}`);
  }

  async createLabTest(projectId: string, test: Omit<LabTest, 'id'>): Promise<ApiResponse<LabTest>> {
    return this.request<LabTest>(`/api/projects/${projectId}/lab-tests`, {
      method: 'POST',
      body: JSON.stringify(test),
    });
  }

  async updateLabTest(projectId: string, testId: string, test: Partial<LabTest>): Promise<ApiResponse<LabTest>> {
    return this.request<LabTest>(`/api/projects/${projectId}/lab-tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(test),
    });
  }

  async deleteLabTest(projectId: string, testId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/lab-tests/${testId}`, {
      method: 'DELETE',
    });
  }

  // Vehicle endpoints
  async getVehicles(projectId: string): Promise<ApiResponse<Vehicle[]>> {
    return this.request<Vehicle[]>(`/api/projects/${projectId}/vehicles`);
  }

  async getVehicle(projectId: string, vehicleId: string): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/api/projects/${projectId}/vehicles/${vehicleId}`);
  }

  async createVehicle(projectId: string, vehicle: Omit<Vehicle, 'id'>): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/api/projects/${projectId}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }

  async updateVehicle(projectId: string, vehicleId: string, vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/api/projects/${projectId}/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  }

  async deleteVehicle(projectId: string, vehicleId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  }

  // Document endpoints
  async getDocuments(projectId: string): Promise<ApiResponse<ProjectDocument[]>> {
    return this.request<ProjectDocument[]>(`/api/projects/${projectId}/documents`);
  }

  async getDocument(projectId: string, documentId: string): Promise<ApiResponse<ProjectDocument>> {
    return this.request<ProjectDocument>(`/api/projects/${projectId}/documents/${documentId}`);
  }

  async createDocument(projectId: string, document: Omit<ProjectDocument, 'id'>): Promise<ApiResponse<ProjectDocument>> {
    return this.request<ProjectDocument>(`/api/projects/${projectId}/documents`, {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updateDocument(projectId: string, documentId: string, document: Partial<ProjectDocument>): Promise<ApiResponse<ProjectDocument>> {
    return this.request<ProjectDocument>(`/api/projects/${projectId}/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(document),
    });
  }

  async deleteDocument(projectId: string, documentId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Daily report endpoints
  async getDailyReports(projectId: string): Promise<ApiResponse<DailyReport[]>> {
    return this.request<DailyReport[]>(`/api/projects/${projectId}/daily-reports`);
  }

  async getDailyReport(projectId: string, reportId: string): Promise<ApiResponse<DailyReport>> {
    return this.request<DailyReport>(`/api/projects/${projectId}/daily-reports/${reportId}`);
  }

  async createDailyReport(projectId: string, report: Omit<DailyReport, 'id'>): Promise<ApiResponse<DailyReport>> {
    return this.request<DailyReport>(`/api/projects/${projectId}/daily-reports`, {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  async updateDailyReport(projectId: string, reportId: string, report: Partial<DailyReport>): Promise<ApiResponse<DailyReport>> {
    return this.request<DailyReport>(`/api/projects/${projectId}/daily-reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(report),
    });
  }

  async deleteDailyReport(projectId: string, reportId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/daily-reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // Structure endpoints
  async getStructures(projectId: string): Promise<ApiResponse<StructureAsset[]>> {
    return this.request<StructureAsset[]>(`/api/projects/${projectId}/structures`);
  }

  async getStructure(projectId: string, structureId: string): Promise<ApiResponse<StructureAsset>> {
    return this.request<StructureAsset>(`/api/projects/${projectId}/structures/${structureId}`);
  }

  async createStructure(projectId: string, structure: Omit<StructureAsset, 'id'>): Promise<ApiResponse<StructureAsset>> {
    return this.request<StructureAsset>(`/api/projects/${projectId}/structures`, {
      method: 'POST',
      body: JSON.stringify(structure),
    });
  }

  async updateStructure(projectId: string, structureId: string, structure: Partial<StructureAsset>): Promise<ApiResponse<StructureAsset>> {
    return this.request<StructureAsset>(`/api/projects/${projectId}/structures/${structureId}`, {
      method: 'PUT',
      body: JSON.stringify(structure),
    });
  }

  async deleteStructure(projectId: string, structureId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/structures/${structureId}`, {
      method: 'DELETE',
    });
  }

  // Defect endpoints
  async getDefects(projectId: string): Promise<ApiResponse<Defect[]>> {
    return this.request<Defect[]>(`/api/projects/${projectId}/defects`);
  }

  async getDefect(projectId: string, defectId: string): Promise<ApiResponse<Defect>> {
    return this.request<Defect>(`/api/projects/${projectId}/defects/${defectId}`);
  }

  async createDefect(projectId: string, defect: Omit<Defect, 'id'>): Promise<ApiResponse<Defect>> {
    return this.request<Defect>(`/api/projects/${projectId}/defects`, {
      method: 'POST',
      body: JSON.stringify(defect),
    });
  }

  async updateDefect(projectId: string, defectId: string, defect: Partial<Defect>): Promise<ApiResponse<Defect>> {
    return this.request<Defect>(`/api/projects/${projectId}/defects/${defectId}`, {
      method: 'PUT',
      body: JSON.stringify(defect),
    });
  }

  async deleteDefect(projectId: string, defectId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/defects/${defectId}`, {
      method: 'DELETE',
    });
  }

  // Comment endpoints
  async getComments(projectId: string, entityId: string, entityType: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/api/projects/${projectId}/entities/${entityType}/${entityId}/comments`);
  }

  async getComment(projectId: string, commentId: string): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/api/projects/${projectId}/comments/${commentId}`);
  }

  async createComment(projectId: string, comment: Omit<Comment, 'id'>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/api/projects/${projectId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  async updateComment(projectId: string, commentId: string, comment: Partial<Comment>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/api/projects/${projectId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(comment),
    });
  }

  async deleteComment(projectId: string, commentId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Audit log endpoints
  async getAuditLogs(projectId: string): Promise<ApiResponse<AuditLog[]>> {
    return this.request<AuditLog[]>(`/api/projects/${projectId}/audit-logs`);
  }

  async getAuditLog(projectId: string, logId: string): Promise<ApiResponse<AuditLog>> {
    return this.request<AuditLog>(`/api/projects/${projectId}/audit-logs/${logId}`);
  }

  // Accounting transaction endpoints
  async getAccountingTransactions(projectId: string): Promise<ApiResponse<AccountingTransaction[]>> {
    return this.request<AccountingTransaction[]>(`/api/projects/${projectId}/accounting-transactions`);
  }

  async getAccountingTransaction(projectId: string, transactionId: string): Promise<ApiResponse<AccountingTransaction>> {
    return this.request<AccountingTransaction>(`/api/projects/${projectId}/accounting-transactions/${transactionId}`);
  }

  async createAccountingTransaction(projectId: string, transaction: Omit<AccountingTransaction, 'id'>): Promise<ApiResponse<AccountingTransaction>> {
    return this.request<AccountingTransaction>(`/api/projects/${projectId}/accounting-transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateAccountingTransaction(projectId: string, transactionId: string, transaction: Partial<AccountingTransaction>): Promise<ApiResponse<AccountingTransaction>> {
    return this.request<AccountingTransaction>(`/api/projects/${projectId}/accounting-transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteAccountingTransaction(projectId: string, transactionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/accounting-transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }
}

// Default API service instance
export const apiService = new ApiService({
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
  },
});