import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionEstudiantesService, CreateEstudianteDto } from '../../services/gestion-estudiantes.service';
import { Estudiante } from '../../models/api.models';

const VACIO: CreateEstudianteDto = {
  nombre: '', apellido: '', cedula: '', email: '', telefono: '',
  especialidad: '', curso: '', foto: '', anioLectivo: 0, estado: 'activo',
};

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-estudiantes.html',
})
export class GestionEstudiantes implements OnInit {
  lista: Estudiante[] = [];
  seleccionado: Estudiante | null = null;
  form: CreateEstudianteDto = { ...VACIO };
  esNuevo = false;
  guardado = false;
  cargando = false;
  busqueda = '';
  filtroEstado = '';
  readonly estados = ['activo', 'inactivo', 'egresado'];

  constructor(private svc: GestionEstudiantesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.svc.getAll().subscribe({
      next: lista => { this.lista = lista; this.cargando = false; },
      error: ()   => { this.cargando = false; },
    });
  }

  get listaFiltrada(): Estudiante[] {
    const q = this.busqueda.toLowerCase();
    return this.lista.filter(e => {
      const txt = !q || [e.nombre, e.apellido, e.cedula, e.especialidad].some(v => v?.toLowerCase().includes(q));
      const est = !this.filtroEstado || e.estado === this.filtroEstado;
      return txt && est;
    });
  }

  nuevo(): void { this.form = { ...VACIO }; this.seleccionado = null; this.esNuevo = true; }

  seleccionar(e: Estudiante): void {
    this.seleccionado = e;
    this.esNuevo = false;
    this.form = { nombre: e.nombre, apellido: e.apellido, cedula: e.cedula,
      email: e.email, telefono: e.telefono, especialidad: e.especialidad,
      curso: e.curso, foto: e.foto, anioLectivo: e.anioLectivo, estado: e.estado };
  }

  guardar(): void {
    if (!this.form.nombre || !this.form.cedula) return;
    const op = this.esNuevo
      ? this.svc.crear(this.form)
      : this.svc.actualizar(this.seleccionado!._id, this.form);
    op.subscribe({
      next: () => { this.cargar(); this.cerrar(); this.guardado = true; setTimeout(() => this.guardado = false, 3000); },
      error: err => alert(err?.error?.detail ?? 'Error al guardar'),
    });
  }

  eliminar(e: Estudiante): void {
    if (!confirm(`¿Eliminar a ${e.nombre} ${e.apellido}?`)) return;
    this.svc.eliminar(e._id).subscribe(() => { this.cargar(); this.cerrar(); });
  }

  cerrar(): void { this.seleccionado = null; this.esNuevo = false; }
}
