import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.student.taskmanager',
  appName: 'Student Task Manager',
  webDir: 'dist/frontend/browser',
  server: {
    url: 'https://student-task-manager-1-n85z.onrender.com',
    cleartext: false
  }
};

export default config;
