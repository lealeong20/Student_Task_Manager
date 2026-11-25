export interface Task {
  _id?: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  userEmail?: string; // <-- Add this line here
}