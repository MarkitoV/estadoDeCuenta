import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento } from '../../models/movimiento.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

interface Meta {
  mes: string;
  mesNum: number;
  anio: number;
  saldoMinimo: number;
  numMovimientos: number;
}
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MovimientoFormComponent } from '../movimiento-form/movimiento-form.component';
import { MetaMensualService, MetaMensual } from '../../services/meta-mensual.service';

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

  metas = new MatTableDataSource<Meta>([]);
  metasColumns: string[] = ['mes', 'saldoMinimo', 'numMovimientos'];

  loading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private movimientoService: MovimientoService,
    private metaMensualService: MetaMensualService,
    private dialog: MatDialog,
    private _intl: MatPaginatorIntl
  ) {
    this._intl.itemsPerPageLabel = 'Items por página';
    this._intl.nextPageLabel = 'Siguiente página';
    this._intl.previousPageLabel = 'Página anterior';
    this._intl.firstPageLabel = 'Primera página';
    this._intl.lastPageLabel = 'Última página';
    this._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 de ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };
  }

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

        this.calculateMetas(data);

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movimientos:', err);
        this.error = 'Error al cargar los movimientos. Por favor, verifica que el servidor esté corriendo.';
        this.loading = false;
      }
    });
  }

  private calculateMetas(movimientos: Movimiento[]): void {
    this.metaMensualService.getMetas().subscribe({
      next: (metasBackend) => {
        const metasData: Meta[] = metasBackend.map(m => {
          const date = new Date(m.mes);
          const count = movimientos.filter(mov => {
            const d = new Date(mov.fecha);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
          }).length;

          return {
            mes: date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
            mesNum: date.getMonth(),
            anio: date.getFullYear(),
            saldoMinimo: m.saldoMinimo,
            numMovimientos: count
          };
        });
        this.metas.data = metasData;
      },
      error: (err) => {
        console.error('Error fetching metas:', err);
        // Fallback to hardcoded values if backend fails or is empty
        this.useFallbackMetas(movimientos);
      }
    });
  }

  private useFallbackMetas(movimientos: Movimiento[]): void {
    const meses = [
      { nombre: 'marzo de 2025', mes: 2, anio: 2025, saldo: 0 },
      { nombre: 'abril de 2025', mes: 3, anio: 2025, saldo: 400 },
      { nombre: 'mayo de 2025', mes: 4, anio: 2025, saldo: 800 },
      { nombre: 'junio de 2025', mes: 5, anio: 2025, saldo: 1200 },
      { nombre: 'julio de 2025', mes: 6, anio: 2025, saldo: 1800 },
      { nombre: 'agosto de 2025', mes: 7, anio: 2025, saldo: 2400 },
      { nombre: 'septiembre de 2025', mes: 8, anio: 2025, saldo: 3000 },
      { nombre: 'octubre de 2025', mes: 9, anio: 2025, saldo: 3600 },
      { nombre: 'noviembre de 2025', mes: 10, anio: 2025, saldo: 4200 },
      { nombre: 'diciembre de 2025', mes: 11, anio: 2025, saldo: 4800 },
      { nombre: 'enero de 2026', mes: 0, anio: 2026, saldo: 5400 },
      { nombre: 'febrero de 2026', mes: 1, anio: 2026, saldo: 6000 },
      { nombre: 'marzo de 2026', mes: 2, anio: 2026, saldo: 6600 },
    ];

    const metasData: Meta[] = meses.map(m => {
      const count = movimientos.filter(mov => {
        const d = new Date(mov.fecha);
        return d.getMonth() === m.mes && d.getFullYear() === m.anio;
      }).length;

      return {
        mes: m.nombre,
        mesNum: m.mes,
        anio: m.anio,
        saldoMinimo: m.saldo,
        numMovimientos: count
      };
    });

    this.metas.data = metasData;
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
