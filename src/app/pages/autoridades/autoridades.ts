import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutoridadesService } from '../../services/autoridades.service';
import { Autoridad, CreateAutoridadDto } from '../../models/api.models';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

@Component({
  selector: 'app-autoridades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageUrlInputComponent],
  templateUrl: './autoridades.html',
})
export class Autoridades implements OnInit {

  lista: Autoridad[] = [];
  seleccionada: Autoridad | null = null;
  guardado = false;
  esNueva = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private svc: AutoridadesService) {}

  ngOnInit(): void {
    this.svc.autoridades$.subscribe(lista => { this.lista = lista; });
  }

  seleccionar(a: Autoridad): void {
    this.seleccionada = JSON.parse(JSON.stringify(a));
    this.esNueva = false;
    this.guardado = false;
  }

  nueva(): void {
    this.seleccionada = {
      _id: '', createdAt: '', updatedAt: '',
      name: '', title: '', categoryLabel: 'Rectorado', image: '',
      email: '', specialization: '', linkedin: '', fullBio: '',
      ubicacion: 'Campus Principal UETS', horario: 'Lunes a Viernes 8:00 - 17:00', telefono: '',
    };
    this.esNueva = true;
    this.guardado = false;
  }

  onChange(): void { this.guardado = false; }

  guardar(): void {
    if (!this.seleccionada) return;
    const { _id, createdAt, updatedAt, ...dto } = this.seleccionada;

    if (this.esNueva) {
      this.svc.crear(dto as CreateAutoridadDto).subscribe({
        next: () => { this.esNueva = false; this.seleccionada = null; this.mostrarGuardado(); },
        error: err => console.error('Error al crear autoridad:', err),
      });
    } else {
      this.svc.actualizar(_id, dto).subscribe({
        next: () => this.mostrarGuardado(),
        error: err => console.error('Error al actualizar autoridad:', err),
      });
    }
  }

  eliminar(id: string): void {
    if (!confirm('¿Eliminar esta autoridad?')) return;
    this.svc.eliminar(id).subscribe({
      next: () => { if (this.seleccionada?._id === id) this.seleccionada = null; },
      error: err => console.error('Error al eliminar autoridad:', err),
    });
  }

  private mostrarGuardado(): void {
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }
}
