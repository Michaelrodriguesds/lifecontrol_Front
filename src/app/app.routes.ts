import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./goals/goals.component').then(m => m.GoalsComponent),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./expenses/expenses.component').then(m => m.ExpensesComponent),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./items/items.component').then(m => m.ItemsComponent),
      },
      {
        path: 'notes',
        loadComponent: () =>
          import('./notes/notes.component').then(m => m.NotesComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./analytics/analytics.component').then(m => m.AnalyticsComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings.component').then(m => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
