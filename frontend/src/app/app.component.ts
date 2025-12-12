import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <h1 class="app-title">
            <span class="gradient-text">Estado de Cuenta</span>
          </h1>
        </div>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }

    .app-header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .app-title {
      font-size: 1.875rem;
      font-weight: 700;
      margin: 0;
    }

    .gradient-text {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .app-main {
      padding: 2rem 0;
    }
  `]
})
export class AppComponent {
  title = 'Estado de Cuenta';
}
