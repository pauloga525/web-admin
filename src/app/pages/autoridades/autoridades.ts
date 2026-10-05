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
  eliminando = false;
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
      // Sin esto la autoridad se guarda pero no aparece en la página pública,
      // que solo muestra las que tienen publicada = true.
      orden: this.lista.length + 1,
      publicada: true,
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
    if (this.eliminando || !id) return;
    const nombre = this.seleccionada?.name || 'esta autoridad';
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    this.eliminando = true;
    this.svc.eliminar(id).subscribe({
      next: () => {
        this.eliminando = false;
        if (this.seleccionada?._id === id) this.seleccionada = null;
      },
      error: err => {
        this.eliminando = false;
        console.error('Error al eliminar autoridad:', err);
        alert(err?.status === 403
          ? 'No tienes permisos para eliminar autoridades (se requiere rol admin).'
          : 'No se pudo eliminar la autoridad. Inténtalo de nuevo.');
      },
    });
  }

  private mostrarGuardado(): void {
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }
}
