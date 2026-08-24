/**
 * @file login.ts
 * @description Página de inicio de sesión del panel administrativo.
 */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  usuario  = '';
  password = '';
  error    = false;
  cargando = false;
  mostrarPassword = false;
  currentYear = new Date().getFullYear();
  sesionExpirada = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.sesionExpirada = this.route.snapshot.queryParamMap.get('expired') === '1';
    // Si hay token, primero confirma con el backend que siga siendo válido.
    if (this.auth.isAuthenticated()) {
      this.auth.refreshProfile().subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.auth.clearSession(),
      });
    }
  }

  submit(): void {
    if (!this.usuario || !this.password) return;
    this.error    = false;
    this.cargando = true;

    // login() devuelve Observable — hay que suscribirse
    this.auth.login(this.usuario.trim(), this.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.error    = true;
        this.cargando = false;
      },
    });
  }
}
