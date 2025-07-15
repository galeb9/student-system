// src/app/features/overview/pages/student-form/student-form.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../core/models/student.model';
import { Observable } from 'rxjs';

type Option = { label: string; value: string };

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
    ToastModule,
    CardModule,
  ],
  providers: [MessageService],
  templateUrl: './student-form.page.html',
  styleUrls: ['./student-form.page.scss'],
})
export class StudentFormPage implements OnInit {
  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    public route: ActivatedRoute,
    public router: Router,
    private messageService: MessageService
  ) {}
  form!: FormGroup;
  isEdit = false;
  allCourses = [
    'Math',
    'Physics',
    'History',
    'Biology',
    'Chemistry',
    'English Literature',
    'Computer Science',
    'Art',
    'Music',
    'Economics',
    'Geography',
    'Physical Education',
    'Philosophy',
    'Psychology',
    'Sociology',
  ];
  courseOptions: Option[] = [];
  studentId: string | null = null;

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.studentId = param || null;
    this.isEdit = !!param;

    this.courseOptions = this.allCourses.map((c) => ({ label: c, value: c }));

    this.form = this.fb.group({
      name: [
        { value: '', disabled: this.isEdit },
        [Validators.required, Validators.minLength(2)],
      ],
      surname: [
        { value: '', disabled: this.isEdit },
        [Validators.required, Validators.minLength(2)],
      ],
      email: [
        { value: '', disabled: this.isEdit },
        [Validators.required, Validators.email],
      ],
      courses: [<string[]>[], Validators.required], // stays enabled
    });

    if (this.isEdit && this.studentId) {
      this.studentService.getById(this.studentId).subscribe({
        next: (student) => this.form.patchValue(student),
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Load Error',
            detail: 'Could not load student data.',
          }),
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const courses = raw.courses as string[];

    let op$: Observable<Student>;

    if (this.isEdit && this.studentId) {
      // PATCH only the courses field
      op$ = this.studentService.patch(this.studentId, { courses });
    } else {
      // CREATE a brand new student
      const newStudent: Omit<Student, 'id'> = {
        name: raw.name,
        surname: raw.surname,
        email: raw.email,
        courses,
      };
      op$ = this.studentService.create(newStudent);
    }

    op$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.isEdit ? 'Updated' : 'Created',
          detail: `Student ${
            this.isEdit ? 'updated' : 'created'
          } successfully.`,
        });
        this.router.navigate(['/overview']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Error',
          detail: 'Could not save student.',
        });
      },
    });
  }
}
