/**
 * @file actividad.ts
 * @description Página de historial de actividad del sistema.
 * Muestra todas las acciones registradas agrupadas por fecha.
 * Permite eliminar entradas individuales y purga automáticamente las de más de 1 año.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { ActivityService } from '../../services/activity';
import { Actividad as ActividadModel, GrupoActividad } from '../../models';

@Component({
  selector: 'app-actividad',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './actividad.html',
  styleUrl: './actividad.css'
})
export class Actividad implements OnInit, OnDestroy {

  total = 0;
  purgados = 0;
  confirmandoEliminar: ActividadModel | null = null;
  private subs = new Subscription();

  constructor(public activityService: ActivityService) {}

  ngOnInit(): void {
    // Purga automática de actividades con más de 1 año
    this.purgados = this.activityService.limpiarAntiguos();
    this.refrescarTotal();

    // Refresca timestamps relativos cada minuto
    this.subs.add(
      interval(60000).subscribe(() => this.refrescarTotal())
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  refrescarTotal(): void {
    this.total = this.activityService.getTotalActividades();
  }

  getActividadesAgrupadas(): GrupoActividad[] {
    return this.activityService.getActividadesAgrupadas();
  }

  isNuevaActividad(a: ActividadModel): boolean {
    return this.activityService.isNuevaActividad(a);
  }

  // ─── Eliminar con confirmación hover ───────────────────────────────────────

  iniciarEliminar(a: ActividadModel): void {
    this.confirmandoEliminar = a;
  }

  cancelarEliminar(): void {
    this.confirmandoEliminar = null;
  }

  confirmarEliminar(a: ActividadModel): void {
    this.activityService.eliminarActividad(a);
    this.confirmandoEliminar = null;
    this.refrescarTotal();
  }
}
