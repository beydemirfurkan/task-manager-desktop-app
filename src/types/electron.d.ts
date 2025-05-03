interface ElectronAPI {
  getTasks: () => Promise<Task[]>;
  saveTasks: (tasks: Task[]) => Promise<boolean>;
  addTask: (task: Task) => Promise<Task[]>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task[]>;
  deleteTask: (id: string) => Promise<Task[]>;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  createdAt: string;
}

interface Window {
  electronAPI: ElectronAPI;
} 