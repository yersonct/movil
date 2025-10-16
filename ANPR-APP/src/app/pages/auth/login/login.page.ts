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
import { ApiResponse, Client } from 'src/app/generic/models/IEntitys';
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
  // ✅ Guardar sesión básica
  await this.general.setAuthToken(data.token);
  await this.general.setUserRoles(data.roles || []);
  await this.general.setUsername(this.LoginDto.username);
  await this.general.setUserId(data.userId);

   try {
        const clientResp = await firstValueFrom(
          this.general.get<ApiResponse<Client>>(`Client/by-user/${data.userId}`)
        );

        // console.log('📦 Respuesta del endpoint Client/by-user:', clientResp);

        if (clientResp?.success && clientResp.data?.id) {
          await this.general.setClientId(clientResp.data.id);
          // console.log('🧠 Client ID guardado correctamente:', clientResp.data.id);
        } else {
          console.warn('⚠️ Este usuario no tiene cliente asociado.');
        }
      } catch (error) {
        // console.error('❌ Error obteniendo clientId:', error);
      }

      // 🔹 3. Continuar solo después de guardar todo
      await this.helper.showToast(res.message || 'Bienvenido 👋');
      await loader.dismiss();
      this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    } else {
      await loader.dismiss();
      this.helper.showAlert(res?.message || 'Credenciales incorrectas');
    }

  } catch (err: any) {
    await loader.dismiss();
    this.helper.showAlert(err.message || 'Error inesperado');
    console.error('Error en login:', err);
  } finally {
    this.loading = false;
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
