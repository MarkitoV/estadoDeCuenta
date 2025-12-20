import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from './services/movimiento.service';
import { Movimiento } from './models/movimiento.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container header-summary">
            <!-- Spacer for Fecha (15%) and Descripción (35%) - Now contains Title -->
            <div class="summary-spacer">
              <h1 class="app-title">
                <span class="gradient-text">Estado de Cuenta</span>
              </h1>
            </div>
            
            <!-- Egresos (Aligns with Débito - 15%) -->
            <div class="summary-item">
              <span class="summary-label">Egresos</span>
              <span class="summary-value egreso-text">{{ formatCurrency(totalEgresos) }}</span>
            </div>

            <!-- Ingresos (Aligns with Crédito - 15%) -->
            <div class="summary-item">
              <span class="summary-label">Ingresos</span>
              <span class="summary-value ingreso-text">{{ formatCurrency(totalIngresos) }}</span>
            </div>

            <!-- Saldo (Aligns with Saldo - 15%) -->
            <div class="summary-item">
              <span class="summary-label">Saldo</span>
              <span class="summary-value saldo-text" [class.negative]="saldoActual < 0">{{ formatCurrency(saldoActual) }}</span>
            </div>
            
            <!-- Spacer for Acciones (5%) -->
            <div class="summary-spacer-end"></div>
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
      padding: 0.75rem 0;
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

    .header-content {
      display: flex;
      /* Removed flex-direction: column and gap */
    }

    .header-summary {
      display: flex;
      width: 100%;
      max-width: 1200px; /* Match container max-width if needed, or just 100% of header-content */
      margin-left: auto;
    }
    
    .summary-spacer {
      width: 50%; /* 15% Fecha + 35% Descripción */
      display: flex;
      align-items: center;
    }

    .summary-spacer-end {
      width: 5%; /* 5% Acciones */
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 15%; /* Match column width */
      padding-right: 1.5rem; /* Match table cell padding */
      box-sizing: border-box;
    }



    .summary-label {
      font-size: 0.875rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .summary-value {
      font-size: 1.5rem; /* Increased font size */
      font-weight: 700;
      font-family: 'Monaco', 'Consolas', monospace;
    }

    .ingreso-text { color: #10b981; }
    .egreso-text { color: #ef4444; }
    .saldo-text { color: #3b82f6; }
    .saldo-text.negative { color: #ef4444; }

    @media (max-width: 768px) {
      .header-summary {
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
      }

      .summary-spacer {
        width: 100%;
        margin-bottom: 0.5rem;
        justify-content: center;
      }

      .app-title {
        font-size: 1.5rem;
      }

      .summary-item {
        width: auto;
        padding-right: 0;
        align-items: center;
        flex: 1;
      }

      .summary-value {
        font-size: 1.1rem;
      }
      
      .summary-spacer-end {
        display: none;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Estado de Cuenta';

  totalIngresos = 0;
  totalEgresos = 0;
  saldoActual = 0;

  constructor(private movimientoService: MovimientoService) { }

  ngOnInit() {
    this.movimientoService.movimientos$.subscribe(movimientos => {
      this.calculateSummary(movimientos);
    });

    // Initial load
    this.movimientoService.getMovimientos().subscribe();
  }

  calculateSummary(movimientos: Movimiento[]): void {
    this.totalIngresos = movimientos
      .reduce((sum, m) => sum + (m.credito || 0), 0);

    this.totalEgresos = movimientos
      .reduce((sum, m) => sum + (m.debito || 0), 0);

    this.saldoActual = this.totalIngresos - this.totalEgresos;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }
}
