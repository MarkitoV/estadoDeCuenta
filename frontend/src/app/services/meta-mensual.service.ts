import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetaMensual {
  _id?: string;
  mes: string | Date;
  saldoMinimo: number;
  nAbonos: number;
}

@Injectable({
  providedIn: 'root'
})
export class MetaMensualService {
  private apiUrl = '/api/metas';

  constructor(private http: HttpClient) { }

  getMetas(): Observable<MetaMensual[]> {
    return this.http.get<MetaMensual[]>(this.apiUrl);
  }

  createMeta(meta: MetaMensual): Observable<MetaMensual> {
    return this.http.post<MetaMensual>(this.apiUrl, meta);
  }

  updateMeta(id: string, meta: MetaMensual): Observable<MetaMensual> {
    return this.http.put<MetaMensual>(`${this.apiUrl}/${id}`, meta);
  }

  deleteMeta(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
