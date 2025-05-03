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
  labels?: string[];
  images?: TaskAttachment[];
  comments?: TaskComment[];
  files?: TaskAttachment[];
  audioRecordings?: TaskAttachment[];
}

interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
  createdBy?: string;
}

interface TaskAttachment {
  id: string;
  url: string;
  name: string;
  type?: string;
  createdAt?: string;
}

interface Window {
  electronAPI: ElectronAPI;
} 