import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
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
  ],
  templateUrl: './overview.page.html',
  styleUrl: './overview.page.scss',
  providers: [ConfirmationService, MessageService],
  standalone: true,
})
export class OverviewPage {
  students = signal<Student[]>([]);
  selectedStudent: Student | null = null;
  displayDialog = signal(false);

  studentsCount = computed(() => this.students().length);

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private studentService: StudentService,
    private router: Router
  ) {
    this.students.set(this.studentService.getAll());
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

  onSave(student: Student) {
    this.studentService.save(student);
    this.students.set(this.studentService.getAll());
    this.displayDialog.set(false);
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
        this.students.set(this.studentService.getAll());
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
}
