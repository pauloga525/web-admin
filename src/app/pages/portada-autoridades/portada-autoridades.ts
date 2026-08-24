import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoridadesPageService, AutoridadesPageConfig } from '../../services/autoridades-page.service';

@Component({
  selector: 'app-portada-autoridades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portada-autoridades.html',
})
export class PortadaAutoridades implements OnInit {
  config!: AutoridadesPageConfig;
  guardado = false;

  constructor(private svc: AutoridadesPageService) {}

  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.svc.config$.subscribe(c => this.config = JSON.parse(JSON.stringify(c)));
  }

  guardar(): void {
    this.svc.guardar(this.config).subscribe({
      next: () => { this.guardado = true; setTimeout(() => this.guardado = false, 3000); },
      error: () => alert('Error al guardar'),
    });
  }
}
