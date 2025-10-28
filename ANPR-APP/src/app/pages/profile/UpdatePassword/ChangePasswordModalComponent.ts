import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { GeneralService } from 'src/app/generic/services/general.service';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ChangePasswordModalComponent {
  step: number = 1; // 👈 control del paso actual

  email: string = '';
  code: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private modalCtrl: ModalController,
    private generalService: GeneralService,
    private toastController: ToastController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async nextStep() {
    if (this.step === 1) {
      // Paso 1 → solicitar reset
      this.generalService.post('User/request-password-reset', { email: this.email }).subscribe({
        next: async () => {
          this.showToast('Código enviado a tu correo 📩', 'success');
          this.step = 2;
        },
        error: async (err) => this.showToast('Error: ' + err.message, 'danger')
      });
    } else if (this.step === 2) {
      // Paso 2 → verificar código
      this.generalService.post('User/verify-code', { email: this.email, code: this.code }).subscribe({
        next: async () => {
          this.showToast('Código verificado ✅', 'success');
          this.step = 3;
        },
        error: async (err) => this.showToast('Código inválido ❌ ' + err.message, 'danger')
      });
    } else if (this.step === 3) {
      // Paso 3 → reset password
      if (!this.newPassword || this.newPassword !== this.confirmPassword) {
        return this.showToast('Las contraseñas no coinciden', 'danger');
      }

      this.generalService.post('User/reset-password', {
        email: this.email,
        code: this.code,
        newPassword: this.newPassword
      }).subscribe({
        next: async () => {
          this.showToast('Contraseña cambiada con éxito 🎉', 'success');
          this.modalCtrl.dismiss(true);
        },
        error: async (err) => this.showToast('Error: ' + err.message, 'danger')
      });
    }
  }
    showNew = false;
    showConfirm = false;

    toggle(field: 'new' | 'confirm') {
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'confirm') this.showConfirm = !this.showConfirm;
    }
  private async showToast(msg: string, color: string) {
    const toast = await this.toastController.create({ message: msg, duration: 2000, color });
    toast.present();
  }
}
