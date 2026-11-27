import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SPECIALTIES } from '../../config/medical.config';
import { CareService } from '../../services/care.service';

@Component({
  selector: 'app-specialties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialties.component.html',
  styleUrl: './specialties.component.scss'
})
export class SpecialtiesComponent {
  specialties = SPECIALTIES;

  constructor(private careService: CareService) {}

  /** Pré-remplit le formulaire de rendez-vous avec la spécialité choisie. */
  book(name: string, event: Event): void {
    event.preventDefault();
    this.careService.selectCare(name);
    document.getElementById('rendez-vous')?.scrollIntoView({ behavior: 'smooth' });
  }
}
