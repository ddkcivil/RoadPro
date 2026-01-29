import { Project, User, Message } from '../../types';

const LOCAL_STORAGE_KEYS = {
  PROJECTS: 'roadmaster-projects',
  USERS: 'roadmaster-users',
  MESSAGES: 'roadmaster-messages',
  SETTINGS: 'roadmaster-settings'
};

export const LocalStorageUtils = {
  // Projects
  getProjects(): Project[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  },

  setProjects(projects: Project[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  setUsers(users: User[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Messages
  getMessages(): Message[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  setMessages(messages: Message[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  // Settings
  getSettings() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  setSettings(settings: any): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Initialize with empty data if no data exists
  initializeEmptyData(): void {
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    }

    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify([]));
    }

    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
  },

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SETTINGS);
  }
};