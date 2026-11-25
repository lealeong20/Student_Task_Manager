import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- AUTHENTICATION VIEW -->
    <div *ngIf="!isLoggedIn" class="container" style="max-width: 450px; margin-top: 60px;">
      <header style="border-radius: 8px 8px 0 0; text-align: center;">
        <h1>Student Task Manager</h1>
        <p style="font-size: 0.9rem; opacity: 0.8;">{{ isRegistering ? 'Create a New Account' : 'Student Login' }}</p>
      </header>
      <div class="card" style="border-radius: 0 0 8px 8px; border-top: none;">
        <form (ngSubmit)="handleAuth()">
          <div class="form-group" *ngIf="isRegistering">
            <label>Full Name / Display Name</label>
            <input type="text" [(ngModel)]="authData.name" name="name" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label>Email Address (For Task Reminders)</label>
            <input type="email" [(ngModel)]="authData.email" name="email" placeholder="student@university.edu" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="authData.password" name="password" placeholder="••••••••" required>
          </div>
          <button type="submit" style="width: 100%; margin-bottom: 10px;">
            {{ isRegistering ? 'Register Account' : 'Login to Dashboard' }}
          </button>
          <p style="text-align: center; font-size: 0.85rem; color: #4b5563; cursor: pointer;" (click)="isRegistering = !isRegistering">
            {{ isRegistering ? 'Already have an account? Login here' : "Don't have an account? Register here" }}
          </p>
        </form>
      </div>
    </div>

    <!-- MAIN APP LAYOUT (When Logged In) -->
    <div *ngIf="isLoggedIn">
      <!-- HEADER WITH NAVIGATION -->
      <header>
        <h1>Student Task & Deadline Management System</h1>
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          
          <!-- Navigation View Switchers -->
          <button (click)="currentView = 'dashboard'" [style.background-color]="currentView === 'dashboard' ? '#1d4ed8' : '#3b82f6'" style="padding: 6px 12px; font-size: 0.8rem;">
            Dashboard
          </button>
          <button (click)="currentView = 'add-task'" [style.background-color]="currentView === 'add-task' ? '#1d4ed8' : '#3b82f6'" style="padding: 6px 12px; font-size: 0.8rem;">
            + Add Academic Task
          </button>
          <button (click)="currentView = 'profile'" [style.background-color]="currentView === 'profile' ? '#1d4ed8' : '#3b82f6'" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 0.8rem;">
            <div style="width: 20px; height: 20px; border-radius: 50%; overflow: hidden; background: #cbd5e1; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem;">
              <img *ngIf="authData.profilePic" [src]="authData.profilePic" style="width: 100%; height: 100%; object-fit: cover;">
              <span *ngIf="!authData.profilePic">👤</span>
            </div>
            Settings
          </button>

          <button (click)="logout()" style="background-color: #dc2626; padding: 6px 12px; font-size: 0.8rem;">Logout</button>
        </div>
      </header>
      
      <!-- DASHBOARD VIEW -->
      <div class="container" *ngIf="currentView === 'dashboard'">
        <!-- Progress Summary Cards -->
        <div class="dashboard-grid" style="margin-bottom: 20px;">
          <div class="card" style="border-top-color: #2563eb;">
            <h3>Total Tasks</h3>
            <p style="font-size: 1.5rem; font-weight: bold; color: #2563eb;">{{ tasks.length }}</p>
          </div>
          <div class="card" style="border-top-color: #d97706;">
            <h3>Pending / In Progress</h3>
            <p style="font-size: 1.5rem; font-weight: bold; color: #d97706;">{{ getPendingCount() }}</p>
          </div>
          <div class="card" style="border-top-color: #059669;">
            <h3>Completed</h3>
            <p style="font-size: 1.5rem; font-weight: bold; color: #059669;">{{ getCompletedCount() }}</p>
          </div>
        </div>

        <!-- 3-DAY DEADLINE REMINDER SECTION -->
        <div *ngIf="urgentTasks.length > 0" class="card" style="margin-bottom: 20px; border-left: 5px solid #dc2626; background-color: #fef2f2;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #991b1b;">Deadline Reminder</h3>
            <span style="background: #dc2626; color: #ffffff; padding: 3px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 600;">
              {{ urgentTasks.length }} Due Soon
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div *ngFor="let task of urgentTasks" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 10px 12px; background: #ffffff; border: 1px solid #fecaca; border-radius: 6px;">
              <div>
                <strong style="color: #111827;">{{ task.title }}</strong>
                <span *ngIf="task.category && task.category !== '0'" style="color: #6b7280; font-size: 0.85rem; margin-left: 8px;">({{ task.category }})</span>
              </div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #b91c1c;">
                <span *ngIf="getDaysLeft(task.dueDate) === 0">Due Today!</span>
                <span *ngIf="getDaysLeft(task.dueDate) === 1">Only 1 day left</span>
                <span *ngIf="(getDaysLeft(task.dueDate) ?? 0) > 1">Only {{ getDaysLeft(task.dueDate) }} days left</span>
                <span style="color: #6b7280; font-weight: 400; margin-left: 6px;">• {{ task.dueDate | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <div class="card" style="margin-bottom: 20px; padding: 15px 20px;">
          <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
            <div style="flex: 1; min-width: 220px;">
              <input type="text" [(ngModel)]="searchTerm" placeholder="Search tasks by title or description..." style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            </div>
            <div>
              <select [(ngModel)]="filterCategory" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                <option value="All">All Categories</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Exam">Exam</option>
                <option value="Reading">Reading</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Task Lists & Upcoming Deadlines -->
        <h2>Upcoming & Active Tasks</h2>
        <div class="dashboard-grid">
          <div *ngFor="let task of filteredTasks" class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="badge" [ngClass]="{
                'badge-pending': task.status === 'Pending',
                'badge-progress': task.status === 'In Progress',
                'badge-completed': task.status === 'Completed'
              }">{{ task.status }}</span>
              <small style="color: #6b7280;">Due: {{ task.dueDate }}</small>
            </div>
            <h3>{{ task.title }}</h3>
            <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 10px;">{{ task.description }}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
              <span><strong>Category:</strong> {{ task.category }}</span>
              <span><strong>Priority:</strong> {{ task.priority }}</span>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
              <button (click)="cycleStatus(task)" style="padding: 5px 10px; font-size: 0.8rem; background-color: #059669;">Change Status</button>
              <button (click)="deleteTask(task)" style="padding: 5px 10px; font-size: 0.8rem; background-color: #dc2626;">Delete</button>
            </div>
          </div>

          <div *ngIf="filteredTasks.length === 0" class="card" style="grid-column: 1 / -1; text-align: center; color: #6b7280;">
            <p>No matching tasks found.</p>
          </div>
        </div>
      </div>

      <!-- ADD ACADEMIC TASK VIEW -->
      <div class="container" *ngIf="currentView === 'add-task'">
        <div class="card" style="max-width: 720px; margin: 30px auto; padding: 30px;">
          <h2 style="margin-bottom: 20px; color: #1e3a8a;">Add New Academic Task</h2>

          <form (ngSubmit)="createTask()">
            <div class="dashboard-grid" style="margin-top: 0; margin-bottom: 15px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label>Task Title</label>
                <input type="text" [(ngModel)]="newTask.title" name="title" placeholder="e.g., Data Structures Project" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label>Category</label>
                <select [(ngModel)]="newTask.category" name="category">
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                  <option value="Exam">Exam</option>
                  <option value="Reading">Reading</option>
                </select>
              </div>
            </div>

            <div class="dashboard-grid" style="margin-top: 0; margin-bottom: 15px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label>Priority Level</label>
                <select [(ngModel)]="newTask.priority" name="priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label>Due Date</label>
                <input type="date" [(ngModel)]="newTask.dueDate" name="dueDate" required>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newTask.description" name="description" rows="3" placeholder="Task details..."></textarea>
            </div>

            <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="submit" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Saving Task...' : 'Create Task & Send Reminder' }}
              </button>
              <button type="button" (click)="goToDashboard()" style="background-color: #6b7280;">Back to Dashboard</button>
            </div>
          </form>
        </div>
      </div>

      <!-- PROFILE SETTINGS VIEW -->
      <div class="container" *ngIf="currentView === 'profile'">
        <div class="card" style="max-width: 600px; margin: 30px auto; padding: 30px;">
          <h2 style="margin-bottom: 20px; color: #1e3a8a;">Account Profile & Settings</h2>
          
          <!-- Profile Avatar Preview & Local File Upload -->
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #e0e7ff; display: flex; align-items: center; justify-content: center; font-size: 2rem; overflow: hidden; border: 2px solid #3b82f6; flex-shrink: 0;">
              <img *ngIf="authData.profilePic" [src]="authData.profilePic" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
              <span *ngIf="!authData.profilePic">👤</span>
            </div>
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Upload Profile Picture from Device</label>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" style="width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; background: #f9fafb;">
              <small style="color: #6b7280; font-size: 0.75rem; display: block; margin-top: 4px;">Choose an image file from your computer storage.</small>
            </div>
          </div>

          <!-- Edit Display Name -->
          <div class="form-group">
            <label>Display Name</label>
            <input type="text" [(ngModel)]="authData.name" placeholder="Your Name">
          </div>

          <!-- Email Address (Read-only for notification routing) -->
          <div class="form-group">
            <label>Notification Email Address</label>
            <input type="email" [(ngModel)]="authData.email" disabled style="background-color: #f3f4f6; cursor: not-allowed;">
            <small style="color: #6b7280; font-size: 0.75rem;">Your account email is locked as it handles your incoming task alerts.</small>
          </div>

          <div style="margin-top: 25px; display: flex; gap: 10px;">
            <button (click)="saveProfile()" style="background-color: #059669;">Save Profile Changes</button>
            <button (click)="currentView = 'dashboard'" style="background-color: #6b7280;">Back to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isRegistering = false;
  isSubmitting = false;
  currentView: 'dashboard' | 'add-task' | 'profile' = 'dashboard';
  searchTerm = '';
  filterCategory = 'All';

  authData = {
    name: '',
    email: '',
    password: '',
    profilePic: ''
  };

  newTask: any = {
    title: '',
    description: '',
    category: 'Assignment',
    priority: 'Medium',
    dueDate: '',
    status: 'Pending'
  };

  tasks: any[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    const savedLogin = localStorage.getItem('isLoggedIn');
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    const savedPic = localStorage.getItem('userProfilePic');

    if (savedLogin === 'true' && savedEmail) {
      this.isLoggedIn = true;
      if (savedName) this.authData.name = savedName;
      this.authData.email = savedEmail;
      if (savedPic) this.authData.profilePic = savedPic;
      this.loadTasks();
    }
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data: any) => this.tasks = Array.isArray(data) ? data : [],
      error: (err: any) => console.error('Error fetching tasks from backend:', err)
    });
  }

  getDaysLeft(dueDateInput: string | Date): number | null {
    if (!dueDateInput) return null;
    const due = new Date(dueDateInput);
    if (Number.isNaN(due.getTime())) return null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((startOfDue.getTime() - startOfToday.getTime()) / msPerDay);
  }

  get urgentTasks() {
    return this.tasks.filter((task: any) => {
      const daysLeft = this.getDaysLeft(task.dueDate);
      return task.status !== 'Completed' && daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
    });
  }

  get filteredTasks() {
    return this.tasks.filter((task: any) => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesCategory = this.filterCategory === 'All' || task.category === this.filterCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getPendingCount() {
    return this.tasks.filter((t: any) => t.status === 'Pending' || t.status === 'In Progress').length;
  }

  getCompletedCount() {
    return this.tasks.filter((t: any) => t.status === 'Completed').length;
  }

  handleAuth() {
    if (!this.authData.email || !this.authData.password) {
      alert('Please fill out your email and password.');
      return;
    }
    this.isLoggedIn = true;
    if (!this.authData.name) {
      this.authData.name = this.authData.email.split('@')[0];
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', this.authData.name);
    localStorage.setItem('userEmail', this.authData.email);
    localStorage.setItem('userProfilePic', this.authData.profilePic);
    this.loadTasks();
  }

  // Handles local file selection and converts it to a previewable Base64 string
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.authData.profilePic = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (!this.authData.name.trim()) {
      alert('Display name cannot be empty!');
      return;
    }
    localStorage.setItem('userName', this.authData.name);
    localStorage.setItem('userProfilePic', this.authData.profilePic);
    alert('Profile updated successfully!');
    this.currentView = 'dashboard';
  }

  goToDashboard() {
    this.currentView = 'dashboard';
  }

  createTask() {
    try {
      const trimmedTitle = (this.newTask.title || '').trim();
      const dueDateValue = this.newTask.dueDate;

      console.log('createTask triggered with:', {
        title: trimmedTitle,
        dueDate: dueDateValue,
        userEmail: this.authData.email
      });

      if (!trimmedTitle || !dueDateValue) {
        alert('Please fill out both the Task Title and Due Date!');
        return;
      }

      const fallbackEmail = this.authData.email || localStorage.getItem('userEmail') || '';
      if (!fallbackEmail) {
        alert('User email is missing. Please log out and log back in.');
        return;
      }

      this.isSubmitting = true;

      const taskPayload: any = {
        ...this.newTask,
        title: trimmedTitle,
        userEmail: fallbackEmail
      };

      this.taskService.addTask(taskPayload).subscribe({
        next: (createdTask: any) => {
          console.log('Task created response:', createdTask);
          const taskToAdd = createdTask && typeof createdTask === 'object'
            ? (createdTask.task || createdTask.data || createdTask)
            : taskPayload;

          this.tasks.push(taskToAdd);
          this.newTask = { title: '', description: '', category: 'Assignment', priority: 'Medium', dueDate: '', status: 'Pending' };
          this.isSubmitting = false;
          this.currentView = 'dashboard';
        },
        error: (err: any) => {
          console.error('Detailed Backend error:', err);
          this.isSubmitting = false;
          const serverMsg = err?.error?.error || err?.message || 'Check console for details.';
          alert(`Failed to create task: ${serverMsg}`);
        }
      });
    } catch (err) {
      console.error('Unexpected error in createTask():', err);
      this.isSubmitting = false;
      alert('An error occurred while submitting the task.');
    }
  }

  logout() {
    this.isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfilePic');
    this.authData = { name: '', email: '', password: '', profilePic: '' };
    this.currentView = 'dashboard';
  }
  
  cycleStatus(task: any) {
    const statuses: ('Pending' | 'In Progress' | 'Completed')[] = ['Pending', 'In Progress', 'Completed'];
    const current = task.status;
    const nextIndex = (statuses.indexOf(current) + 1) % statuses.length;
    task.status = statuses[nextIndex];

    if (task._id) {
      this.taskService.updateTask(task._id, task).subscribe({
        error: (err: any) => console.error('Error updating status:', err)
      });
    }
  }

  deleteTask(task: any) {
    if (!task._id) {
      const index = this.tasks.indexOf(task);
      if (index > -1) this.tasks.splice(index, 1);
      return;
    }

    this.taskService.deleteTask(task._id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t: any) => t._id !== task._id);
      },
      error: (err: any) => console.error('Error deleting task:', err)
    });
  }
}