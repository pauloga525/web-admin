import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

interface NotifBackend {
  _id: string;
  titulo: string;
  descripcion: string;
  usuario: string;
  leido: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
})
export class Notificaciones implements OnInit {
  private api = `${environment.apiUrl}/notificaciones`;
  lista: NotifBackend[] = [];
  cargando = false;
  guardado = false;
  esAdmin = false;
  mostrarForm = false;
  nueva = { titulo: '', descripcion: '', usuario: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.esAdmin = !!user && ['super_admin', 'admin'].includes(user.rol);
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.http.get<NotifBackend[]>(this.api).subscribe({
      next: lista => { this.lista = lista; this.cargando = false; },
      error: ()   => { this.cargando = false; },
    });
  }

  marcarLeida(n: NotifBackend): void {
    this.http.patch(`${this.api}/${n._id}/leer`, {}).subscribe(() => { n.leido = true; });
  }

  marcarTodasLeidas(): void {
    this.http.patch(`${this.api}/leer-todas`, {}).subscribe(() => this.lista.forEach(n => n.leido = true));
  }

  eliminar(n: NotifBackend): void {
    if (!confirm('¿Eliminar esta notificación?')) return;
    this.http.delete(`${this.api}/${n._id}`).subscribe(() => {
      this.lista = this.lista.filter(x => x._id !== n._id);
    });
  }

  guardar(): void {
    if (!this.nueva.titulo.trim()) return;
    this.http.post<NotifBackend>(this.api, this.nueva).subscribe(n => {
      this.lista.unshift(n);
      this.nueva = { titulo: '', descripcion: '', usuario: '' };
      this.mostrarForm = false;
      this.guardado = true;
      setTimeout(() => this.guardado = false, 3000);
    });
  }

  get noLeidas(): number { return this.lista.filter(n => !n.leido).length; }
}
