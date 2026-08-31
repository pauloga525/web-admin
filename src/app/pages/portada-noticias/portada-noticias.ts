import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiasPageService, NoticiasPageConfig } from '../../services/noticias-page.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

@Component({
  selector: 'app-portada-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  templateUrl: './portada-noticias.html',
})
export class PortadaNoticias implements OnInit {
  config!: NoticiasPageConfig;
  guardado = false;
  nuevaCategoria = '';

  constructor(private svc: NoticiasPageService) {}

  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.svc.config$.subscribe(c => this.config = JSON.parse(JSON.stringify(c)));
  }

  agregarCategoria(): void {
    const cat = this.nuevaCategoria.trim();
    if (cat && !this.config.categorias.includes(cat)) {
      this.config.categorias.push(cat);
    }
    this.nuevaCategoria = '';
  }

  quitarCategoria(cat: string): void {
    this.config.categorias = this.config.categorias.filter(c => c !== cat);
  }

  guardar(): void {
    this.svc.guardar(this.config).subscribe({
      next: () => { this.guardado = true; setTimeout(() => this.guardado = false, 3000); },
      error: () => alert('Error al guardar'),
    });
  }
}
