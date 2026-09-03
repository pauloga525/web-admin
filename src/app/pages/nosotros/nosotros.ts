import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NosotrosService, NosotrosConfig, MisionVisionItem, ValorItem, TimelineEvent } from '../../services/nosotros.service';
import { AutoridadesService } from '../../services/autoridades.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';
import { Autoridad } from '../../models/api.models';

type Tab = 'hero' | 'misionVision' | 'valores' | 'historia' | 'autoridades' | 'cta';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageUrlInputComponent],
  templateUrl: './nosotros.html',
})
export class Nosotros implements OnInit {

  config!: NosotrosConfig;
  tabActiva: Tab = 'hero';
  guardado = false;
  expandidoEvento: number | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  autoridades: Autoridad[] = [];

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',        label: 'Hero'          },
    { id: 'misionVision',label: 'Misión/Visión' },
    { id: 'valores',     label: 'Valores'       },
    { id: 'historia',    label: 'Historia'      },
    { id: 'autoridades', label: 'Autoridades'   },
    { id: 'cta',         label: 'CTA'           },
  ];

  constructor(
    private svc: NosotrosService,
    private autoridadesSvc: AutoridadesService,
  ) {}

  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.svc.cargarDesdeBackend().subscribe(cfg => { this.config = cfg; });
    
    // Cargar autoridades
    this.autoridadesSvc.autoridades$.subscribe(list => {
      this.autoridades = list;
    });
  }

  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.svc.guardar(this.config).subscribe();
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  // ── Misión/Visión ──────────────────────────────────────────────────────────
  agregarMV(): void {
    this.config.misionVision.push({ id: this.svc.nextId(), icon: 'info', title: '', description: '' });
    this.onChange();
  }
  eliminarMV(id: number): void {
    this.config.misionVision = this.config.misionVision.filter(i => i.id !== id);
    this.onChange();
  }

  // ── Valores ────────────────────────────────────────────────────────────────
  agregarValor(): void {
    this.config.valores.push({ id: this.svc.nextId(), icon: 'star', title: '', description: '' });
    this.onChange();
  }
  eliminarValor(id: number): void {
    this.config.valores = this.config.valores.filter(v => v.id !== id);
    this.onChange();
  }

  // ── Timeline ───────────────────────────────────────────────────────────────
  toggleEvento(index: number): void {
    this.expandidoEvento = this.expandidoEvento === index ? null : index;
  }

  agregarEvento(): void {
    this.config.timeline.push({ id: this.svc.nextId(), year: '', title: '', description: '', image: '' });
    this.onChange();
    this.expandidoEvento = this.config.timeline.length - 1;
  }
  eliminarEvento(id: number): void {
    const index = this.config.timeline.findIndex(e => e.id === id);
    if (this.expandidoEvento === index) this.expandidoEvento = null;
    this.config.timeline = this.config.timeline.filter(e => e.id !== id);
    this.onChange();
  }
}
