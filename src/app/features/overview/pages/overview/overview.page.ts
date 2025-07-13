import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TableFilterEvent, TableModule } from 'primeng/table';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { ConfirmationService, MessageService } from 'primeng/api';

import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../core/models/student.model';

@Component({
  selector: 'app-overview',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    FormsModule,
    BadgeModule,
    ConfirmDialog,
    ToastModule,
    CardModule,
    ChipModule,
    TooltipModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './overview.page.html',
  styleUrl: './overview.page.scss',
  providers: [ConfirmationService, MessageService, ViewChild],
  standalone: true,
})
export class OverviewPage {
  readonly MAX_VISIBLE_COURSES = 2;
  @ViewChild('dt') dt!: any;

  students = signal<Student[]>([]);
  selectedStudents = signal<Student[]>([]);

  displayDialog = signal(false);
  first: number = 0;
  rows: number = 20;
  studentsCount = signal(0);

  deleteSelectedLabel = computed(() =>
    this.selectedStudents().length
      ? `Selected (${this.selectedStudents().length})`
      : 'Delete'
  );

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private studentService: StudentService,
    private router: Router
  ) {
    this.students.set(this.studentService.getAll());
    this.studentsCount.set(this.students().length);
  }

  onGlobalFilter(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(input, 'contains');
  }

  onTableFilter(event: TableFilterEvent) {
    const filtered = event.filteredValue ?? this.students();
    this.studentsCount.set(filtered.length);
  }

  goToView(student: Student) {
    this.router.navigate([`/overview/${student.id}/view`]);
  }

  goToEdit(student: Student) {
    this.router.navigate([`/overview/${student.id}/edit`]);
  }

  goToMakeNew() {
    this.router.navigate(['/overview/new']);
  }

  getOverflowCourses(student: Student): string {
    return student.courses.slice(this.MAX_VISIBLE_COURSES).join(', ');
  }
  confirmDelete(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this student?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },

      accept: () => {
        this.studentService.delete(id);
        this.students.update((prev) => prev.filter((s) => s.id !== id));
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'Record deleted',
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
        });
      },
    });
  }
  confirmBulkDelete(event: Event) {
    const selected = this.selectedStudents();
    console.log(selected);
    if (!selected.length) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete ${selected.length} student(s)?`,
      header: 'Confirm Bulk Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        const idsToDelete = new Set(selected.map((s) => s.id));
        selected.forEach((student) => {
          this.studentService.delete(student.id);
        });
        this.students.update((prev) =>
          prev.filter((s) => !idsToDelete.has(s.id))
        );
        this.selectedStudents.set([]);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `${selected.length} student(s) deleted.`,
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Bulk deletion cancelled.',
        });
      },
    });
  }
}
