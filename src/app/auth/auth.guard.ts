import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  if (environment.devMode) return true;
  const token = localStorage.getItem('lc_token');
  if (token) return true;
  inject(Router).navigate(['/login']);
  return false;
};
