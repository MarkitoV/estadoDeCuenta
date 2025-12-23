import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento } from '../../models/movimiento.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MovimientoFormComponent } from '../movimiento-form/movimiento-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  movimientos = new MatTableDataSource<Movimiento>([]);
  displayedColumns: string[] = ['fecha', 'descripcion', 'debito', 'credito', 'saldo', 'acciones'];
  loading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private movimientoService: MovimientoService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadMovimientos();
  }

  ngAfterViewInit() {
    this.movimientos.paginator = this.paginator;
  }

  loadMovimientos(): void {
    this.loading = true;
    this.error = null;

    this.movimientoService.movimientos$.subscribe({
      next: (data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        this.movimientos.data = sortedData;
        this.movimientos.paginator = this.paginator; // Re-assign paginator after data load
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movimientos:', err);
        this.error = 'Error al cargar los movimientos. Por favor, verifica que el servidor esté corriendo.';
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    // Find the most recent movement by createdAt to get its date
    const lastMovimiento = this.movimientos.data.reduce((prev, current) => {
      const prevDate = prev.createdAt ? new Date(prev.createdAt).getTime() : 0;
      const currentDate = current.createdAt ? new Date(current.createdAt).getTime() : 0;
      return (currentDate > prevDate) ? current : prev;
    }, this.movimientos.data[0]);

    const dialogRef = this.dialog.open(MovimientoFormComponent, {
      width: '500px',
      data: lastMovimiento ? { fecha: lastMovimiento.fecha } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMovimientos(); // Refresh list if a movement was created
      }
    });
  }

  editMovimiento(movimiento: Movimiento): void {
    const dialogRef = this.dialog.open(MovimientoFormComponent, {
      width: '500px',
      data: movimiento
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMovimientos(); // Refresh list if a movement was updated
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
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
