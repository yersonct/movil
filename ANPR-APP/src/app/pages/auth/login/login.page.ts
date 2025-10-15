import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ResetPasswordModalComponent } from '../reset-password.modal.ts/reset-password.modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { GeneralService } from 'src/app/generic/services/general.service';
import { HelperService } from 'src/app/generic/services/helper-service.service';
import { LoginResponse } from 'src/app/generic/models/IEntitys';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

// interface LoginResponse {
//   success: boolean;
//   message?: string;
//   data?: {
//     userId: number;
//     token: string;
//     roles: string[];
//   };
//   errors?: string[];
// }
  addIcons({
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline
});
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
 showPassword = false;
  constructor(
    private general: GeneralService,
    private router: Router,
    private helper: HelperService, // 👈 usar helper
    private modalCtrl: ModalController // 👈 nuevo
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    console.log("Método login() disparado", this.LoginDto);
  if (!this.LoginDto.username || !this.LoginDto.password) {
    this.helper.showAlert('Por favor ingresa usuario y contraseña', 'Validación');
    return;
  }

  const loader = await this.helper.presentLoading('Ingresando...');
  this.loading = true;

  try {
    const res = await firstValueFrom(
      this.general.post<LoginResponse>('User/login', this.LoginDto)
    );

    const data = res?.data;
    if (res?.success && data?.token) {
      // Guardar sesión
      await this.general.setAuthToken(data.token);
      await this.general.setUserRoles(data.roles || []);
      await this.general.setUsername(this.LoginDto.username);
      await this.general.setUserId(data.userId);

      // 👇 NUEVO: guardar clientId
      if (data.client?.id != null) {
        await this.general.setClientId(data.client.id);
      }

      await this.helper.showToast(res.message || 'Bienvenido 👋');
      this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    } else {
      this.helper.showAlert(res?.message || 'Credenciales incorrectas');
    }
  } catch (err: any) {
    this.helper.showAlert(err.message || 'Error inesperado');
    console.error('Error en login:', err);
  } finally {
    this.loading = false;
    loader.dismiss();
  }
}

async restablecerContrasena() {
  const modal = await this.modalCtrl.create({
    component: ResetPasswordModalComponent,
    breakpoints: [0, 0.6, 0.9],
    initialBreakpoint: 0.6,
    cssClass: 'reset-modal'
  });
  await modal.present();
}

}
