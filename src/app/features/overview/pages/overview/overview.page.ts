// src/app/features/overview/pages/overview/overview.page.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableModule, Table, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';

import { ConfirmationService, MessageService } from 'primeng/api';
import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../core/models/student.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    ConfirmDialog,
    ToastModule,
    BadgeModule,
    CardModule,
    ChipModule,
    InputTextModule,
    CommonModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit {
  @ViewChild('dt', { static: true }) dt!: Table;
  students = signal<Student[]>([]);
  studentsCount = signal(0);
  selectedStudents = signal<Student[]>([]);
  filterText = signal('');
  first: number = 0;
  rows: number = 20;
  sortField: string = 'surname';
  sortOrder: number = 1;
  loading: boolean = true;

  deleteSelectedLabel = computed(() => {
    const n = this.selectedStudents().length;
    return n ? `Selected (${n})` : 'Delete Selected';
  });

  ngOnInit(): void {
    this.dt.reset();
  }

  constructor(
    private studentService: StudentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  loadStudentsLazy(event: TableLazyLoadEvent) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;

    if (event.sortField) {
      const sf = Array.isArray(event.sortField)
        ? event.sortField[0]
        : event.sortField;

      this.sortField = sf;
    }

    if (event.sortOrder != null) {
      this.sortOrder = event.sortOrder;
    }

    const pageIndex = this.first / this.rows;

    this.studentService
      .getPaginated(pageIndex, this.rows, this.sortField, this.sortOrder)
      .subscribe(({ data, total }) => {
        this.students.set(data);
        this.studentsCount.set(total);
      });
  }

  goToView(s: Student) {
    this.router.navigate([`/overview/${s.id}/view`]);
  }
  goToEdit(s: Student) {
    this.router.navigate([`/overview/${s.id}/edit`]);
  }
  goToMakeNew() {
    this.router.navigate(['/overview/new']);
  }

  confirmDelete(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this student?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.studentService.delete(id).subscribe(() => {
          this.messageService.add({
            severity: 'info',
            summary: 'Deleted',
            detail: 'Student removed',
          });
          this.dt.reset();
        });
      },
    });
  }

  confirmBulkDelete(event: Event) {
    const toDelete = this.selectedStudents();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete ${toDelete.length} selected student(s)?`,
      header: 'Bulk Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        import('rxjs').then(({ forkJoin }) => {
          forkJoin(
            toDelete.map((s) => this.studentService.delete(s.id!))
          ).subscribe(() => {
            this.selectedStudents.set([]);
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${toDelete.length} removed`,
            });
            this.dt.reset();
          });
        });
      },
    });
  }
}
