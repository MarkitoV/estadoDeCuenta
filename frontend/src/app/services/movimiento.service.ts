import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../models/movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = '/api/movimientos';

  constructor(private http: HttpClient) { }

  getMovimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.apiUrl);
  }

  getMovimientoById(id: string): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
  }

  createMovimiento(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  updateMovimiento(id: string, movimiento: Movimiento): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento);
  }

  deleteMovimiento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
