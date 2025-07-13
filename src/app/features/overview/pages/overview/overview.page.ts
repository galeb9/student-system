import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';

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
  ],
  templateUrl: './overview.page.html',
  styleUrl: './overview.page.scss',
  providers: [ConfirmationService, MessageService],
  standalone: true,
})
export class OverviewPage {
  readonly MAX_VISIBLE_COURSES = 2;
  students = signal<Student[]>([]);
  selectedStudents = signal<Student[]>([]);

  displayDialog = signal(false);
  first: number = 0;
  rows: number = 20;
  studentsCount = computed(() => this.students().length);
  deleteSelectedLabel = computed(() =>
    this.selectedStudents().length
      ? `Delete Selected (${this.selectedStudents().length})`
      : 'Delete Selected'
  );

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
        // change this to filter out?
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
        selected.forEach((student) => {
          this.studentService.delete(student.id);
        });

        this.students.set(this.studentService.getAll());
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

  onRowSelect(event: any) {
    console.log('clicked');
    const selected = event.data; // the selected row object
    console.log('Selected row:', selected);
  }

  // next() {
  //   this.first = this.first + this.rows;
  // }

  // prev() {
  //   this.first = this.first - this.rows;
  // }

  // reset() {
  //   this.first = 0;
  // }
  // pageChange(event: any) {
  //   this.first = event.first;
  //   this.rows = event.rows;
  // }

  // isLastPage(): boolean {
  //   return this.students()
  //     ? this.first + this.rows >= this.students().length
  //     : true;
  // }

  // isFirstPage(): boolean {
  //   return this.students().length ? this.first === 0 : true;
  // }
}
