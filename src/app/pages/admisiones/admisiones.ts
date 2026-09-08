import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdmisionesService, AdmisionesConfig, AdmisionStep, AdmisionReq, AdmisionDownload, AdmisionDate } from '../../services/admisiones.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';
import { IconPickerComponent } from '../../components/icon-picker/icon-picker.component';

type Tab = 'hero' | 'proceso' | 'requisitos' | 'fechas' | 'cta';

@Component({
  selector: 'app-admisiones',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent, IconPickerComponent],
  templateUrl: './admisiones.html',
})
export class Admisiones implements OnInit {
  config!: AdmisionesConfig;
  tabActiva: Tab = 'hero';
  guardado = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',       label: 'Hero'       },
    { id: 'proceso',    label: 'Proceso'    },
    { id: 'requisitos', label: 'Requisitos' },
    { id: 'fechas',     label: 'Fechas'     },
    { id: 'cta',        label: 'CTA'        },
  ];

  constructor(private svc: AdmisionesService) {}
  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.svc.cargarDesdeBackend().subscribe(cfg => { this.config = cfg; });
  }
  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.svc.guardar(this.config).subscribe();
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  // Steps
  agregarStep(): void {
    const n = this.config.steps.length + 1;
    this.config.steps.push({ id: this.svc.nextId(), stepNumber: n, icon: 'star', title: '', description: '' });
    this.onChange();
  }
  eliminarStep(id: number): void { this.config.steps = this.config.steps.filter(s => s.id !== id); this.onChange(); }

  // Requisitos
  agregarReq(): void {
    this.config.requisitos.push({ id: this.svc.nextId(), icon: 'description', title: '', description: '' });
    this.onChange();
  }
  eliminarReq(id: number): void { this.config.requisitos = this.config.requisitos.filter(r => r.id !== id); this.onChange(); }

  // Descargas
  agregarDescarga(): void {
    this.config.descargas.push({ id: this.svc.nextId(), icon: 'picture_as_pdf', label: '', url: '' });
    this.onChange();
  }
  eliminarDescarga(id: number): void { this.config.descargas = this.config.descargas.filter(d => d.id !== id); this.onChange(); }

  // Fechas
  agregarFecha(): void {
    this.config.fechas.push({ id: this.svc.nextId(), title: '', subtitle: '', date: '', year: '', isPrimary: false });
    this.onChange();
  }
  eliminarFecha(id: number): void { this.config.fechas = this.config.fechas.filter(f => f.id !== id); this.onChange(); }
}
