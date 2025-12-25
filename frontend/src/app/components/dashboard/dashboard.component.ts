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
  saldoMes: number;
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
  metasColumns: string[] = ['mes', 'saldoMinimo', 'saldoMes', 'numMovimientos'];

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
          const monthMovs = movimientos.filter(mov => {
            const d = new Date(mov.fecha);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
          });

          return {
            mes: date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
            mesNum: date.getMonth(),
            anio: date.getFullYear(),
            saldoMinimo: m.saldoMinimo,
            saldoMes: m.saldoMes || 0,
            numMovimientos: monthMovs.length
          };
        }).sort((a, b) => {
          const dateA = new Date(a.anio, a.mesNum).getTime();
          const dateB = new Date(b.anio, b.mesNum).getTime();
          return dateB - dateA;
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
      const monthMovs = movimientos.filter(mov => {
        const d = new Date(mov.fecha);
        return d.getMonth() === m.mes && d.getFullYear() === m.anio;
      });

      // Find first movement of the month for fallback
      const firstMov = monthMovs.length > 0 ? monthMovs.reduce((prev, curr) => {
        return new Date(curr.fecha).getTime() < new Date(prev.fecha).getTime() ? curr : prev;
      }) : null;

      return {
        mes: m.nombre,
        mesNum: m.mes,
        anio: m.anio,
        saldoMinimo: m.saldo,
        saldoMes: firstMov ? (firstMov.saldo || 0) : 0,
        numMovimientos: monthMovs.length
      };
    }).sort((a, b) => {
      const dateA = new Date(a.anio, a.mesNum).getTime();
      const dateB = new Date(b.anio, b.mesNum).getTime();
      return dateB - dateA;
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

  fillMetas(): void {
    this.metaMensualService.getMetas().subscribe({
      next: (existingMetas) => {
        this.movimientoService.movimientos$.subscribe((movimientos) => {
          if (movimientos.length === 0) return;

          // 1. Determine starting point
          let startDate: Date;
          let currentSaldoMinimo = 0;

          if (existingMetas.length === 0) {
            // Start from March 2025
            startDate = new Date(2025, 2, 1); // March is 2
          } else {
            // Find the last registered month
            const lastMeta = existingMetas.reduce((prev, current) => {
              return new Date(current.mes).getTime() > new Date(prev.mes).getTime() ? current : prev;
            });
            const lastDate = new Date(lastMeta.mes);
            startDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
            currentSaldoMinimo = lastMeta.saldoMinimo;
          }

          // Determine end point: the month of the last movement
          const lastMovDate = movimientos.reduce((prev, current) => {
            return new Date(current.fecha).getTime() > new Date(prev.fecha).getTime() ? current : prev;
          }).fecha;
          const endDate = new Date(new Date(lastMovDate).getFullYear(), new Date(lastMovDate).getMonth(), 1);

          // 2. Process months from startDate to endDate
          const monthsToProcess: Date[] = [];
          let tempDate = new Date(startDate);
          while (tempDate <= endDate) {
            monthsToProcess.push(new Date(tempDate));
            tempDate.setMonth(tempDate.getMonth() + 1);
          }

          if (monthsToProcess.length === 0) {
            console.log('No new months to process');
            return;
          }

          // 3. Sequential creation
          this.createMetasSequentially(monthsToProcess, currentSaldoMinimo, movimientos);
        });
      },
      error: (err) => console.error('Error fetching existing metas:', err)
    });
  }

  private createMetasSequentially(months: Date[], lastSaldo: number, movimientos: any[]): void {
    if (months.length === 0) {
      this.loadMovimientos();
      return;
    }

    const currentMonth = months.shift()!;

    // Calculate Saldo Mínimo
    let newSaldo = lastSaldo;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    if (year === 2025 && month === 2) {
      newSaldo = 0;
    } else if (year === 2025 && month >= 3 && month <= 5) {
      newSaldo += 400;
    } else if (year > 2025 || (year === 2025 && month >= 6)) {
      newSaldo += 600;
    }

    // Count and find last movement
    const monthMovs = movimientos.filter(mov => {
      const d = new Date(mov.fecha);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const firstMov = monthMovs.length > 0 ? monthMovs.reduce((prev, curr) => {
      // Use createdAt for better precision if available, otherwise fecha
      const timePrev = prev.createdAt ? new Date(prev.createdAt).getTime() : new Date(prev.fecha).getTime();
      const timeCurr = curr.createdAt ? new Date(curr.createdAt).getTime() : new Date(curr.fecha).getTime();
      return timeCurr < timePrev ? curr : prev;
    }) : null;

    const newMeta: MetaMensual = {
      mes: currentMonth,
      saldoMinimo: newSaldo,
      saldoMes: firstMov ? (firstMov.saldo || 0) : 0,
      nAbonos: monthMovs.length
    };

    this.metaMensualService.createMeta(newMeta).subscribe({
      next: () => {
        this.createMetasSequentially(months, newSaldo, movimientos);
      },
      error: (err) => {
        console.error('Error creating meta:', err);
        this.createMetasSequentially(months, newSaldo, movimientos);
      }
    });
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
