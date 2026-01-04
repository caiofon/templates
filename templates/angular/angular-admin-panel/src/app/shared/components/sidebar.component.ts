import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || sidenavOpen()"
        class="w-64"
      >
        <mat-toolbar color="primary">
          <span>Admin Panel</span>
        </mat-toolbar>

        <mat-nav-list>
          @for (item of filteredNavItems(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              (click)="isMobile() && toggleSidenav()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="absolute bottom-0 w-full p-4">
          <button mat-stroked-button class="w-full" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          @if (isMobile()) {
            <button mat-icon-button (click)="toggleSidenav()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span>{{ currentTitle() }}</span>
        </mat-toolbar>

        <main class="p-6">
          <ng-content />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `],
})
export class SidebarComponent {
  private authService = inject(AuthService);

  sidenavOpen = signal(false);
  isMobile = signal(window.innerWidth < 768);
  currentTitle = signal('Dashboard');

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Users', route: '/users', icon: 'people', roles: ['admin'] },
    { label: 'Products', route: '/products', icon: 'inventory' },
    { label: 'Orders', route: '/orders', icon: 'shopping_cart' },
    { label: 'Reports', route: '/reports', icon: 'bar_chart' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];

  filteredNavItems = computed(() => {
    const userRole = this.authService.user()?.role;
    return this.navItems.filter(
      (item) => !item.roles || item.roles.includes(userRole || '')
    );
  });

  toggleSidenav() {
    this.sidenavOpen.update((v) => !v);
  }

  logout() {
    this.authService.logout();
  }

  constructor() {
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth < 768);
    });
  }
}
