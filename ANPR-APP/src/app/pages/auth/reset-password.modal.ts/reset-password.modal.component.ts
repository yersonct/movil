import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { GeneralService } from 'src/app/generic/services/general.service';
import { HelperService } from 'src/app/generic/services/helper-service.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-reset-password-modal',
  templateUrl: './reset-password.modal.html',
  styleUrls: ['./reset-password.modal.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ResetPasswordModalComponent {
  step: 'email' | 'verify' | 'reset' = 'email';
  email = '';
  code = '';
  newPassword = '';
  loading = false;

  constructor(
    private general: GeneralService,
    private helper: HelperService,
    private modalCtrl: ModalController
  ) {}

  close() {
    this.modalCtrl.dismiss();
  }

  async sendCode() {
    if (!this.email) {
      this.helper.showAlert('Por favor ingresa tu correo');
      return;
    }
    this.loading = true;
    try {
      const res = await firstValueFrom(this.general.requestPasswordReset(this.email));
      this.helper.showToast(res.message || 'Código enviado a tu correo 📩');
      this.step = 'verify';
    } catch (err: any) {
      this.helper.showAlert(err.message || 'No se pudo enviar el código');
    } finally {
      this.loading = false;
    }
  }

  async verifyCode() {
    if (!this.code) {
      this.helper.showAlert('Ingresa el código recibido');
      return;
    }
    this.loading = true;
    try {
      const res = await firstValueFrom(this.general.verifyCode(this.email, this.code));
      if (res.success) {
        this.helper.showToast('Código verificado ✅');
        this.step = 'reset';
      } else {
        this.helper.showAlert('Código inválido');
      }
    } catch (err: any) {
      this.helper.showAlert(err.message || 'Error verificando el código');
    } finally {
      this.loading = false;
    }
  }

  async resetPassword() {
    if (!this.newPassword) {
      this.helper.showAlert('Ingresa tu nueva contraseña');
      return;
    }
    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.general.resetPassword(this.email, this.code, this.newPassword)
      );
      this.helper.showToast(res.message || 'Contraseña actualizada ✅');
      this.modalCtrl.dismiss();
    } catch (err: any) {
      this.helper.showAlert(err.message || 'No se pudo restablecer la contraseña');
    } finally {
      this.loading = false;
    }
  }
}
