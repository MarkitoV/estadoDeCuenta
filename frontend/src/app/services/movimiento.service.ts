import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Movimiento } from '../models/movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = '/api/movimientos';
  private movimientosSubject = new BehaviorSubject<Movimiento[]>([]);
  public movimientos$ = this.movimientosSubject.asObservable();

  constructor(private http: HttpClient) { }

  getMovimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.apiUrl).pipe(
      tap(movimientos => this.movimientosSubject.next(movimientos))
    );
  }

  getMovimientoById(id: string): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
  }

  createMovimiento(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento).pipe(
      tap(() => this.refreshMovimientos())
    );
  }

  updateMovimiento(id: string, movimiento: Movimiento): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento).pipe(
      tap(() => this.refreshMovimientos())
    );
  }

  deleteMovimiento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshMovimientos())
    );
  }

  private refreshMovimientos(): void {
    this.getMovimientos().subscribe();
  }
}
