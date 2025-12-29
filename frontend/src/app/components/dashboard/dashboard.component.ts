import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MovimientoFormComponent } from '../movimiento-form/movimiento-form.component';
import { MetaMensualService, MetaMensual } from '../../services/meta-mensual.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexFill,
  ApexTooltip
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
};

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
    MatPaginatorModule,
    MatSnackBarModule,
    NgApexchartsModule,
    MatButtonToggleModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
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

  @ViewChild('movimientosPaginator') movimientosPaginator!: MatPaginator;
  @ViewChild('metasPaginator') metasPaginator!: MatPaginator;

  // Filter properties
  filterValues = {
    descripcion: '',
    fechaInicio: null as Date | null,
    fechaFin: null as Date | null
  };



  activeChart: 'comparativa' | 'actividad' | 'rendimiento' | null = null;

  public comparativaChart!: Partial<ChartOptions>;
  public actividadChart!: Partial<ChartOptions>;
  public rendimientoChart!: Partial<ChartOptions>;

  constructor(
    private movimientoService: MovimientoService,
    private metaMensualService: MetaMensualService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
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
    this.movimientos.paginator = this.movimientosPaginator;
    this.metas.paginator = this.metasPaginator;
    this.setupFilterPredicate();
  }

  setupFilterPredicate() {
    this.movimientos.filterPredicate = (data: Movimiento, filter: string) => {
      const searchTerms = JSON.parse(filter);

      // Description filter
      const matchesDescripcion = data.descripcion.toLowerCase().includes(searchTerms.descripcion.toLowerCase());

      // Date range filter
      const movDate = new Date(data.fecha);
      movDate.setHours(0, 0, 0, 0);

      let matchesDateRange = true;
      if (searchTerms.fechaInicio) {
        const startDate = new Date(searchTerms.fechaInicio);
        startDate.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && movDate >= startDate;
      }
      if (searchTerms.fechaFin) {
        const endDate = new Date(searchTerms.fechaFin);
        endDate.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && movDate <= endDate;
      }

      return matchesDescripcion && matchesDateRange;
    };
  }

  applyFilter() {
    this.movimientos.filter = JSON.stringify(this.filterValues);
    if (this.movimientos.paginator) {
      this.movimientos.paginator.firstPage();
    }
  }

  clearFilters() {
    this.filterValues = {
      descripcion: '',
      fechaInicio: null,
      fechaFin: null
    };
    this.applyFilter();
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
        this.movimientos.paginator = this.movimientosPaginator; // Re-assign paginator after data load

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

          // Find last movement of the month for saldoMes
          const lastMov = monthMovs.length > 0 ? monthMovs.reduce((prev, curr) => {
            const timePrev = prev.createdAt ? new Date(prev.createdAt).getTime() : new Date(prev.fecha).getTime();
            const timeCurr = curr.createdAt ? new Date(curr.createdAt).getTime() : new Date(curr.fecha).getTime();
            return timeCurr > timePrev ? curr : prev;
          }) : null;

          return {
            mes: date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
            mesNum: date.getMonth(),
            anio: date.getFullYear(),
            saldoMinimo: m.saldoMinimo,
            saldoMes: lastMov ? (lastMov.saldo || 0) : 0,
            numMovimientos: monthMovs.length
          };
        }).sort((a, b) => {
          const dateA = new Date(a.anio, a.mesNum).getTime();
          const dateB = new Date(b.anio, b.mesNum).getTime();
          return dateB - dateA;
        });
        this.metas.data = metasData;
        this.metas.paginator = this.metasPaginator;
        this.updateCharts();
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

      // Find last movement of the month for fallback
      const lastMov = monthMovs.length > 0 ? monthMovs.reduce((prev, curr) => {
        const timePrev = prev.createdAt ? new Date(prev.createdAt).getTime() : new Date(prev.fecha).getTime();
        const timeCurr = curr.createdAt ? new Date(curr.createdAt).getTime() : new Date(curr.fecha).getTime();
        return timeCurr > timePrev ? curr : prev;
      }) : null;

      return {
        mes: m.nombre,
        mesNum: m.mes,
        anio: m.anio,
        saldoMinimo: m.saldo,
        saldoMes: lastMov ? (lastMov.saldo || 0) : 0,
        numMovimientos: monthMovs.length
      };
    }).sort((a, b) => {
      const dateA = new Date(a.anio, a.mesNum).getTime();
      const dateB = new Date(b.anio, b.mesNum).getTime();
      return dateB - dateA;
    });

    this.metas.data = metasData;
    this.metas.paginator = this.metasPaginator;
    this.updateCharts();
  }

  private updateCharts(): void {
    const data = [...this.metas.data].reverse(); // Order from oldest to newest for charts
    const labels = data.map(m => m.mes);
    const saldoMinimo = data.map(m => m.saldoMinimo);
    const saldoMes = data.map(m => m.saldoMes);
    const movimientos = data.map(m => m.numMovimientos);

    // Calculate total income and expenses for the Pie chart
    const totalIngresos = this.movimientos.data.reduce((acc, m) => acc + (m.credito || 0), 0);
    const totalEgresos = this.movimientos.data.reduce((acc, m) => acc + (m.debito || 0), 0);

    // 1. Comparativa Chart (Area)
    this.comparativaChart = {
      series: [
        { name: "Saldo Mínimo", data: saldoMinimo },
        { name: "Saldo Real", data: saldoMes }
      ],
      chart: {
        height: 350,
        type: "area",
        toolbar: { show: false },
        animations: { enabled: true },
        foreColor: '#94a3b8',
        theme: 'dark'
      } as ApexChart,
      colors: ["#a855f7", "#22c55e"], // Purple and Neon Green
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          formatter: (val) => `Bs ${val.toLocaleString()}`
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100]
        } as any
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => `Bs ${val.toLocaleString()}`
        }
      }
    };

    // 2. Actividad Chart (Column)
    this.actividadChart = {
      series: [
        { name: "Movimientos", data: movimientos }
      ],
      chart: {
        height: 350,
        type: "bar",
        toolbar: { show: false },
        foreColor: '#94a3b8'
      } as ApexChart,
      plotOptions: {
        bar: {
          columnWidth: "50%",
          borderRadius: 4
        }
      },
      colors: ["#6366f1"],
      dataLabels: { enabled: false },
      xaxis: {
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        title: { text: "Cantidad" }
      },
      tooltip: { theme: 'dark' }
    };

    // 3. Rendimiento Chart (Pie - Ingresos vs Egresos)
    this.rendimientoChart = {
      series: [totalIngresos, totalEgresos],
      chart: {
        height: 350,
        type: "pie",
        foreColor: '#94a3b8',
        theme: 'dark'
      } as ApexChart,
      labels: ["Ingresos", "Egresos"],
      colors: ["#22c55e", "#ef4444"], // Green for Income, Red for Expenses
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '14px',
        markers: { radius: 12 }
      },
      tooltip: {
        y: {
          formatter: (val) => `Bs ${val.toLocaleString()}`
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opts: any) {
          return opts.w.globals.labels[opts.seriesIndex] + ": " + Math.round(val) + "%"
        }
      }
    };
  }

  toggleChart(chart: 'comparativa' | 'actividad' | 'rendimiento'): void {
    if (this.activeChart === chart) {
      this.activeChart = null;
    } else {
      this.activeChart = chart;
    }
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
            this.snackBar.open('No hay meses nuevos para agregar', 'Cerrar', { duration: 3000 });
            return;
          }

          // 3. Sequential creation
          this.createMetasSequentially(monthsToProcess, currentSaldoMinimo, movimientos, monthsToProcess.length);
        });
      },
      error: (err) => console.error('Error fetching existing metas:', err)
    });
  }

  private createMetasSequentially(months: Date[], lastSaldo: number, movimientos: any[], totalToAdd: number, addedCount: number = 0): void {
    if (months.length === 0) {
      this.loadMovimientos();
      if (addedCount > 0) {
        this.snackBar.open(`Se agregaron ${addedCount} meses nuevos`, 'Cerrar', { duration: 3000 });
      }
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

    const lastMov = monthMovs.length > 0 ? monthMovs.reduce((prev, curr) => {
      // Use createdAt for better precision if available, otherwise fecha
      const timePrev = prev.createdAt ? new Date(prev.createdAt).getTime() : new Date(prev.fecha).getTime();
      const timeCurr = curr.createdAt ? new Date(curr.createdAt).getTime() : new Date(curr.fecha).getTime();
      return timeCurr > timePrev ? curr : prev;
    }) : null;

    const newMeta: MetaMensual = {
      mes: currentMonth,
      saldoMinimo: newSaldo,
      saldoMes: lastMov ? (lastMov.saldo || 0) : 0,
      nAbonos: monthMovs.length
    };

    this.metaMensualService.createMeta(newMeta).subscribe({
      next: () => {
        this.createMetasSequentially(months, newSaldo, movimientos, totalToAdd, addedCount + 1);
      },
      error: (err) => {
        console.error('Error creating meta:', err);
        this.createMetasSequentially(months, newSaldo, movimientos, totalToAdd, addedCount);
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
