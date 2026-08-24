import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NivelService } from '../../services/nivel.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';
import {
  NivelConfig, NivelKeyFact,
  NivelCurriculumHighlight, NivelSubject,
} from '../../models/nivel.model';

type Tab = 'hero' | 'overview' | 'curriculum' | 'environment' | 'cta';

@Component({
  selector: 'app-nivel-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  templateUrl: './nivel-editor.html',
})
export class NivelEditor implements OnInit {

  @Input() nivelId!: string;
  @Input() titulo!: string;

  config!: NivelConfig;
  tabActiva: Tab = 'hero';
  cargando = true;
  guardado = false;
  guardando = false;
  private guardadoTimer: ReturnType<typeof setTimeout> | null = null;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',        label: 'Hero'        },
    { id: 'overview',    label: 'Descripción' },
    { id: 'curriculum',  label: 'Currículo'   },
    { id: 'environment', label: 'Ambiente'    },
    { id: 'cta',         label: 'CTA'         },
  ];

  constructor(private nivelService: NivelService) {}

  ngOnInit(): void {
    this.nivelService.get(this.nivelId).subscribe(config => {
      this.config = JSON.parse(JSON.stringify(config));
      this.cargando = false;
    });
  }

  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.guardando = true;
    this.nivelService.guardar(this.config).subscribe({
      next: () => {
        this.guardando = false;
        this.guardado = true;
        if (this.guardadoTimer) clearTimeout(this.guardadoTimer);
        this.guardadoTimer = setTimeout(() => this.guardado = false, 3000);
      },
      error: () => { this.guardando = false; },
    });
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  // ── Key Facts ──────────────────────────────────────────────────────────────
  agregarFact(): void {
    this.config.keyFacts.push({ id: this.nivelService.nextId(), icon: 'info', title: '', value: '' });
    this.onChange();
  }
  eliminarFact(id: number): void {
    this.config.keyFacts = this.config.keyFacts.filter(f => f.id !== id);
    this.onChange();
  }

  // ── Curriculum Highlights ──────────────────────────────────────────────────
  agregarHighlight(): void {
    this.config.curriculumHighlights.push({ id: this.nivelService.nextId(), icon: 'star', title: '', description: '' });
    this.onChange();
  }
  eliminarHighlight(id: number): void {
    this.config.curriculumHighlights = this.config.curriculumHighlights.filter(h => h.id !== id);
    this.onChange();
  }

  // ── Subjects ───────────────────────────────────────────────────────────────
  agregarSubject(): void {
    this.config.subjects.push({ id: this.nivelService.nextId(), name: '' });
    this.onChange();
  }
  eliminarSubject(id: number): void {
    this.config.subjects = this.config.subjects.filter(s => s.id !== id);
    this.onChange();
  }
}
