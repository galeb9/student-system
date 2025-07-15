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
  allCourses = ['Math', 'Physics', 'History', 'Biology'];
  courseOptions: Option[] = [];

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
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

    if (param) {
      const id = param;
      this.studentService.getById(id).subscribe({
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

    const student: Student = {
      ...raw,
      id: this.route.snapshot.paramMap.has('id')
        ? +this.route.snapshot.paramMap.get('id')!
        : undefined,
    };

    this.studentService.save(student).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: student.id ? 'Updated' : 'Created',
          detail: `Student ${student.id ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/overview']);
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Save Error',
          detail: 'Could not save student.',
        }),
    });
  }
}
