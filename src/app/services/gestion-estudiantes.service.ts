import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Estudiante } from '../models/api.models';

export type CreateEstudianteDto = Omit<Estudiante, '_id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class GestionEstudiantesService {
  private readonly api = `${environment.apiUrl}/estudiantes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Estudiante[]> { return this.http.get<Estudiante[]>(this.api); }
  getById(id: string): Observable<Estudiante> { return this.http.get<Estudiante>(`${this.api}/${id}`); }
  crear(dto: CreateEstudianteDto): Observable<Estudiante> { return this.http.post<Estudiante>(this.api, dto); }
  actualizar(id: string, dto: Partial<CreateEstudianteDto>): Observable<Estudiante> { return this.http.put<Estudiante>(`${this.api}/${id}`, dto); }
  eliminar(id: string): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
  statsPorEspecialidad(): Observable<{ especialidad: string; total: number }[]> {
    return this.http.get<{ especialidad: string; total: number }[]>(`${this.api}/stats/por-especialidad`);
  }
}
