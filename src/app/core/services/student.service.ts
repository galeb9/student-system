import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Student } from '../models/student.model';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = '/api/students';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl);
  }

  getById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  create(student: Omit<Student, 'id'>): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, student);
  }

  patch(id: string, changes: Partial<Student>): Observable<Student> {
    return this.http.patch<Student>(`${this.baseUrl}/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPaginated(
    pageIndex: number,
    pageSize: number,
    sortField?: string,
    sortOrder: number = 1
  ): Observable<PaginatedResult<Student>> {
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    return this.getAll().pipe(
      map((all) => {
        let data = all;

        if (sortField) {
          data = [...data].sort((a, b) => {
            const aVal = (a as any)[sortField];
            const bVal = (b as any)[sortField];

            if (aVal == null && bVal != null) return -1 * sortOrder;
            if (aVal != null && bVal == null) return 1 * sortOrder;
            if (aVal == null && bVal == null) return 0;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return (aVal - bVal) * sortOrder;
            }

            return String(aVal).localeCompare(String(bVal)) * sortOrder;
          });
        }

        const slice = data.slice(start, end);
        return {
          data: slice,
          total: all.length,
        };
      })
    );
  }
}
