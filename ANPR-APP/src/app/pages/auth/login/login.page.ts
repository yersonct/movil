import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment.prod';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController, IonicModule } from '@ionic/angular';

declare const SecureStoragePlugin: any;

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: number;
    token: string;
    roles: string[];
  };
  errors?: string[];
}
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage {

   LoginDto = { username: '', password: '' };
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  // ---------- Helpers UI ----------
  private async showToast(message: string, duration = 2000) {
    const t = await this.toastCtrl.create({ message, duration });
    await t.present();
  }

  private async presentLoading(message = 'Ingresando...') {
    const loader = await this.loadingCtrl.create({ message, spinner: 'crescent' });
    await loader.present();
    return loader;
  }

  // ---------- Helpers Storage ----------
  private isSecureAvailable() {
    return typeof (window as any).SecureStoragePlugin !== 'undefined';
  }

  private async setSecure(key: string, value: string) {
    if (this.isSecureAvailable()) {
      await SecureStoragePlugin.set({ key, value });
    } else {
      await Preferences.set({ key, value });
    }
  }

  // ---------- Método de Login ----------
async login() {
  if (!this.LoginDto.username || !this.LoginDto.password) {
    this.showToast('Ingresa usuario y contraseña');
    return;
  }

  const loader = await this.presentLoading();
  this.loading = true;

  try {
    const url = `${environment.apiURL}/User/login`; // o apiUrl, según tu env
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(url, this.LoginDto)
    );

    if (res?.success && res.data?.token) {
      // ✅ SOLO Preferences
      await Preferences.set({ key: 'authToken', value: res.data.token });
      await Preferences.set({ key: 'userRoles', value: JSON.stringify(res.data.roles || []) });
      await Preferences.set({ key: 'username', value: this.LoginDto.username });
      await Preferences.set({ key: 'userId', value: String(res.data.userId) });

      await this.showToast(res.message || 'Bienvenido 👋');
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      this.showToast(res?.message || 'Credenciales incorrectas');
    }
  } catch (err: any) {
    const msg = err?.error?.message || 'Error desconocido. Intenta más tarde.';
    this.showToast(`Error: ${msg}`);
    console.error('Error en login:', err);
  } finally {
    this.loading = false;
    loader.dismiss();
  }
}

  restablecerContrasena() {
    this.router.navigate(['/reset-password']);
  }
}
