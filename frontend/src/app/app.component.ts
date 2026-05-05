import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <app-navbar *ngIf="showNav"></app-navbar>
    <main [class.with-nav]="showNav">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main { min-height: 100vh; background: var(--bg-primary); }
    main.with-nav { min-height: calc(100vh - 64px); }
  `]
})
export class AppComponent {
  private router = inject(Router);
  showNav = false;

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects;
        this.showNav = !url.startsWith('/login') && !url.startsWith('/register');
      });
  }
}
