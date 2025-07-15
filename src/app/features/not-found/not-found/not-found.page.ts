import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [CommonModule, ButtonModule],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.scss',
})
export class NotFoundPage {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/overview']);
  }
}
