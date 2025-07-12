import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

import { StudentService } from '../../../../core/services/student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Student } from '../../../../core/models/student.model';

@Component({
  selector: 'app-student-form',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
  ],
  templateUrl: './student-form.page.html',
  styleUrl: './student-form.page.scss',
})
export class StudentFormPage {
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = signal<number | null>(null);
  isEdit = computed(() => this.id() !== null);
  name = signal('');
  email = signal('');
  courses = signal<string[]>([]);
  allCourses = ['Math', 'Physics', 'History', 'Biology'];

  constructor() {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const student = this.studentService.getById(+paramId);
      if (student) {
        this.id.set(student.id);
        this.name.set(student.name);
        this.email.set(student.email);
        this.courses.set([...student.courses]);
      }
    }
  }

  save() {
    const student: Student = {
      id: this.id() ?? Date.now(),
      name: this.name(),
      email: this.email(),
      courses: this.courses(),
    };
    this.studentService.save(student);
    this.goToList();
  }

  goToList() {
    this.router.navigate(['/overview']);
  }

  get nameModel() {
    return this.name();
  }
  set nameModel(value: string) {
    this.name.set(value);
  }

  get emailModel() {
    return this.email();
  }
  set emailModel(value: string) {
    this.email.set(value);
  }

  get coursesModel() {
    return this.courses();
  }
  set coursesModel(value: string[]) {
    this.courses.set(value);
  }
}
