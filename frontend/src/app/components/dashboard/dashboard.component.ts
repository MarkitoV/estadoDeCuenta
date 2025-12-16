import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento } from '../../models/movimiento.model';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  movimientos: Movimiento[] = [];
  displayedColumns: string[] = ['fecha', 'descripcion', 'debito', 'credito', 'saldo', 'acciones'];
  loading = true;
  error: string | null = null;



  constructor(private movimientoService: MovimientoService) { }

  ngOnInit(): void {
    this.loadMovimientos();
  }

  loadMovimientos(): void {
    this.loading = true;
    this.error = null;

    this.movimientoService.movimientos$.subscribe({
      next: (data) => {
        this.movimientos = data.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movimientos:', err);
        this.error = 'Error al cargar los movimientos. Por favor, verifica que el servidor esté corriendo.';
        this.loading = false;
      }
    });
  }

  showDeleteModal = false;
  itemToDelete: string | null = null;

  deleteMovimiento(id: string): void {
    this.itemToDelete = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete) {
      this.movimientoService.deleteMovimiento(this.itemToDelete).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => {
          console.error('Error deleting movimiento:', err);
          alert('Error al eliminar el movimiento');
          this.closeModal();
        }
      });
    }
  }

  cancelDelete(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
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
