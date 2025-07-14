import { Injectable } from '@angular/core';
import { Student } from '../models/student.model';
import { MOCK_STUDENTS } from '../../shared/mocks/mock-students';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private students: Student[] = [...MOCK_STUDENTS];
  private baseUrl = '/api/students';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Student[]> {
    console.log('Fapening');
    return this.http.get<Student[]>(this.baseUrl);
  }

  getById(id: number): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  save(student: Student): void {
    const index = this.students.findIndex((s) => s.id === student.id);
    if (index > -1) this.students[index] = student;
    else this.students.push(student);
  }

  delete(id: number): void {
    this.students = this.students.filter((s) => s.id !== id);
  }
}
