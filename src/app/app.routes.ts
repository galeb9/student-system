import { Routes } from '@angular/router';
import { NotFoundPage } from './features/not-found/not-found/not-found.page';

export const routes: Routes = [
  {
    path: 'overview',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/overview/pages/overview/overview.page').then(
            (m) => m.OverviewPage
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            './features/overview/pages/student-form/student-form.page'
          ).then((m) => m.StudentFormPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            './features/overview/pages/student-form/student-form.page'
          ).then((m) => m.StudentFormPage),
      },
    ],
  },
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: '**', component: NotFoundPage },
];
