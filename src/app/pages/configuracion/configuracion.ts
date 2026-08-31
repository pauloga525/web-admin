/**
 * @file configuracion.ts
 * @description Página de configuración del perfil y cuenta del administrador.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { AvatarComponent, AVATARES } from '../../components/avatar/avatar.component';
import { UsersApiService, ROLES, CreateUserDto } from '../../services/users-api.service';
import { AppUser, UserRole } from '../../models/api.models';

type Tab = 'perfil' | 'cuenta' | 'seguridad' | 'apariencia' | 'usuarios';

export interface Avatar {
  id: string;
  label: string;
  bg: string;
  svg: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AvatarComponent],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {

  tabActiva: Tab = 'perfil';
  selectorAvatarAbierto = false;

  tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'perfil',     label: 'Perfil',     icon: 'user'    },
    { id: 'cuenta',     label: 'Cuenta',     icon: 'at'      },
    { id: 'seguridad',  label: 'Seguridad',  icon: 'lock'    },
    { id: 'apariencia', label: 'Apariencia', icon: 'palette' },
    { id: 'usuarios',   label: 'Usuarios',   icon: 'users'   },
  ];

  // ─── Catálogo de avatares ──────────────────────────────────────────────────
  avatares: Avatar[] = [
    // Profesionales
    { id: 'profe-1', label: 'Director',    bg: 'bg-blue-600',   svg: AVATARES.find(a=>a.id==='profe-1')!.svg },
    { id: 'profe-2', label: 'Docente',     bg: 'bg-indigo-600', svg: AVATARES.find(a=>a.id==='profe-2')!.svg },
    { id: 'profe-3', label: 'Analista',    bg: 'bg-violet-600', svg: AVATARES.find(a=>a.id==='profe-3')!.svg },
    { id: 'profe-4', label: 'Coordinador', bg: 'bg-sky-600',    svg: AVATARES.find(a=>a.id==='profe-4')!.svg },
    // Cool
    { id: 'cool-1',  label: 'Ninja',       bg: 'bg-slate-800',  svg: AVATARES.find(a=>a.id==='cool-1')!.svg  },
    { id: 'cool-2',  label: 'Astronauta',  bg: 'bg-slate-700',  svg: AVATARES.find(a=>a.id==='cool-2')!.svg  },
    { id: 'cool-3',  label: 'Hacker',      bg: 'bg-green-900',  svg: AVATARES.find(a=>a.id==='cool-3')!.svg  },
    { id: 'cool-4',  label: 'Artista',     bg: 'bg-pink-600',   svg: AVATARES.find(a=>a.id==='cool-4')!.svg  },
    // Divertidos
    { id: 'fun-1',   label: 'Robot',       bg: 'bg-cyan-600',   svg: AVATARES.find(a=>a.id==='fun-1')!.svg   },
    { id: 'fun-2',   label: 'Alien',       bg: 'bg-lime-600',   svg: AVATARES.find(a=>a.id==='fun-2')!.svg   },
    { id: 'fun-3',   label: 'Pirata',      bg: 'bg-amber-700',  svg: AVATARES.find(a=>a.id==='fun-3')!.svg   },
    { id: 'fun-4',   label: 'Mago',        bg: 'bg-purple-700', svg: AVATARES.find(a=>a.id==='fun-4')!.svg   },
    // Graciosos
    { id: 'silly-1', label: 'Café ☕',     bg: 'bg-amber-800',  svg: AVATARES.find(a=>a.id==='silly-1')!.svg },
    { id: 'silly-2', label: 'Gato 🐱',    bg: 'bg-orange-500', svg: AVATARES.find(a=>a.id==='silly-2')!.svg },
    { id: 'silly-3', label: 'Dino 🦕',    bg: 'bg-green-600',  svg: AVATARES.find(a=>a.id==='silly-3')!.svg },
    { id: 'silly-4', label: 'Fantasma 👻', bg: 'bg-slate-500',  svg: AVATARES.find(a=>a.id==='silly-4')!.svg },
  ];

  // Copia de trabajo del perfil
  perfil!: UserProfile;
  avatarSeleccionado = '';

  // Seguridad
  passActual    = '';
  passNueva     = '';
  passConfirmar = '';
  mostrarPassActual    = false;
  mostrarPassNueva     = false;
  mostrarPassConfirmar = false;

  // Estados de guardado
  guardadoPerfil   = false;
  guardadoCuenta   = false;
  guardadoPassword = false;
  errorPassword    = '';

  // ─── Usuarios ──────────────────────────────────────────────────────────────
  usuarios: AppUser[] = [];
  usuarioSeleccionado: AppUser | null = null;
  modalUsuario = false;
  editandoUsuario: Partial<CreateUserDto> & { _id?: string; password?: string } = {};
  confirmarEliminarUsuario: AppUser | null = null;
  errorUsuario = '';
  readonly roles = ROLES;

  constructor(
    private userService: UserService,
    private sanitizer: DomSanitizer,
    public  authService: AuthService,
    public  themeService: ThemeService,
    public  usersService: UsersApiService,
  ) {}

  ngOnInit(): void {
    this.perfil = this.userService.getCopia();
    this.avatarSeleccionado = this.perfil.avatar;
    this.cargarUsuarios();
  }

  private cargarUsuarios(): void {
    this.usersService.list().subscribe({
      next: list => this.usuarios = list,
      error: () => { this.usuarios = []; },
    });
  }

  getIniciales(): string { return this.userService.getIniciales(); }

  // ─── Avatar ────────────────────────────────────────────────────────────────

  getAvatarActual(): Avatar | undefined {
    return this.avatares.find(a => a.id === this.avatarSeleccionado);
  }

  seleccionarAvatar(av: Avatar): void {
    this.avatarSeleccionado = av.id;
    this.selectorAvatarAbierto = false;
  }

  getSafeHtml(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // ─── Perfil ────────────────────────────────────────────────────────────────

  guardarPerfil(): void {
    this.userService.guardar({ ...this.perfil, avatar: this.avatarSeleccionado });
    this.perfil = this.userService.getCopia(); // sync local copy with saved state
    this.guardadoPerfil = true;
    setTimeout(() => this.guardadoPerfil = false, 3000);
  }

  // ─── Cuenta ────────────────────────────────────────────────────────────────

  guardarCuenta(): void {
    this.userService.guardar({ ...this.userService.get(), username: this.perfil.username, email: this.perfil.email, cargo: this.perfil.cargo });
    this.perfil = this.userService.getCopia();
    this.guardadoCuenta = true;
    setTimeout(() => this.guardadoCuenta = false, 3000);
  }

  // ─── Seguridad ─────────────────────────────────────────────────────────────

  guardarPassword(): void {
    this.errorPassword = '';
    if (this.passNueva.length < 6)  { this.errorPassword = 'La nueva contraseña debe tener al menos 6 caracteres.'; return; }
    if (this.passNueva !== this.passConfirmar) { this.errorPassword = 'Las contraseñas nuevas no coinciden.'; return; }
    this.userService.cambiarPassword(this.passActual, this.passNueva).subscribe({
      next: () => {
        this.passActual = this.passNueva = this.passConfirmar = '';
        this.guardadoPassword = true;
        setTimeout(() => this.guardadoPassword = false, 3000);
      },
      error: (err) => {
        this.errorPassword = err?.error?.detail ?? 'No se pudo cambiar la contraseña. Intenta de nuevo.';
      },
    });
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' {
    const p = this.passNueva;
    if (!p) return 'weak';
    const score = [p.length >= 8, /[A-Z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
    return score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong';
  }
  get passwordStrengthLabel(): string  { return { weak: 'Débil', medium: 'Media', strong: 'Fuerte' }[this.passwordStrength]; }
  get passwordStrengthColor(): string  { return { weak: 'bg-red-500', medium: 'bg-yellow-400', strong: 'bg-green-500' }[this.passwordStrength]; }
  get passwordStrengthWidth(): string  { return { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' }[this.passwordStrength]; }

  // ─── Gestión de usuarios ───────────────────────────────────────────────────

  readonly modulosPermiso = [
    { id: 'dashboard',    label: 'Panel Principal',  minRol: 'viewer'      },
    { id: 'noticias',     label: 'Noticias',         minRol: 'editor'      },
    { id: 'eventos',      label: 'Eventos',          minRol: 'editor'      },
    { id: 'especialidades',label: 'Especialidades',  minRol: 'editor'      },
    { id: 'admisiones',   label: 'Admisiones',       minRol: 'editor'      },
    { id: 'configuracion',label: 'Configuración',    minRol: 'admin'       },
    { id: 'usuarios',     label: 'Gestión Usuarios', minRol: 'super_admin' },
  ] as const;

  private readonly rolOrder: UserRole[] = ['viewer', 'editor', 'admin', 'super_admin'];

  tieneAcceso(rol: UserRole, minRol: string): boolean {
    return this.rolOrder.indexOf(rol) >= this.rolOrder.indexOf(minRol as UserRole);
  }

  abrirNuevoUsuario(): void {
    this.errorUsuario = '';
    this.editandoUsuario = { nombre: '', apellido: '', username: '', email: '', password: '', rol: 'viewer', status: 'active' };
    this.modalUsuario = true;
  }

  abrirEditarUsuario(u: AppUser): void {
    this.errorUsuario = '';
    this.editandoUsuario = { _id: u._id, nombre: u.nombre, apellido: u.apellido, username: u.username, email: u.email, rol: u.rol, status: u.status, password: '' };
    this.modalUsuario = true;
  }

  guardarUsuario(): void {
    const u = this.editandoUsuario;
    if (!u.nombre || !u.email || !u.rol) return;
    this.errorUsuario = '';

    if (u._id) {
      // editar — solo envía password si se escribió una nueva
      const { _id, password, ...resto } = u;
      const dto = password ? { ...resto, password } : resto;
      this.usersService.update(_id!, dto).subscribe({
        next: () => { this.cargarUsuarios(); this.modalUsuario = false; this.editandoUsuario = {}; },
        error: (err) => { this.errorUsuario = err?.error?.detail ?? 'No se pudo actualizar el usuario.'; },
      });
    } else {
      if (!u.username || !u.password) { this.errorUsuario = 'Usuario y contraseña son obligatorios.'; return; }
      this.usersService.create(u as CreateUserDto).subscribe({
        next: () => { this.cargarUsuarios(); this.modalUsuario = false; this.editandoUsuario = {}; },
        error: (err) => { this.errorUsuario = err?.error?.detail ?? 'No se pudo crear el usuario.'; },
      });
    }
  }

  pedirEliminarUsuario(u: AppUser): void { this.confirmarEliminarUsuario = u; }

  confirmarEliminar(): void {
    if (!this.confirmarEliminarUsuario) return;
    const id = this.confirmarEliminarUsuario._id;
    this.usersService.delete(id).subscribe({
      next: () => {
        if (this.usuarioSeleccionado?._id === id) this.usuarioSeleccionado = null;
        this.cargarUsuarios();
        this.confirmarEliminarUsuario = null;
      },
      error: () => { this.confirmarEliminarUsuario = null; },
    });
  }

  toggleStatus(u: AppUser): void {
    const nuevoStatus = u.status === 'active' ? 'inactive' : 'active';
    this.usersService.update(u._id, { status: nuevoStatus }).subscribe({
      next: () => this.cargarUsuarios(),
    });
  }
}
