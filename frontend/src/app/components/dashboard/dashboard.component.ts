import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento } from '../../models/movimiento.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  movimientos: Movimiento[] = [];
  loading = true;
  error: string | null = null;

  // Summary statistics
  totalIngresos = 0;
  totalEgresos = 0;
  saldoActual = 0;

  constructor(private movimientoService: MovimientoService) { }

  ngOnInit(): void {
    this.loadMovimientos();
  }

  loadMovimientos(): void {
    this.loading = true;
    this.error = null;

    this.movimientoService.getMovimientos().subscribe({
      next: (data) => {
        this.movimientos = data.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.calculateSummary();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movimientos:', err);
        this.error = 'Error al cargar los movimientos. Por favor, verifica que el servidor esté corriendo.';
        this.loading = false;
      }
    });
  }

  calculateSummary(): void {
    this.totalIngresos = this.movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);

    this.totalEgresos = this.movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);

    this.saldoActual = this.totalIngresos - this.totalEgresos;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
