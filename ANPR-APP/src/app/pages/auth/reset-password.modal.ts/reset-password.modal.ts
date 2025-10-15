import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { GeneralService } from 'src/app/generic/services/general.service';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  keyOutline,
  lockClosedOutline,
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

addIcons({
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'mail-outline': mailOutline,
  'key-outline': keyOutline,
  'lock-closed-outline': lockClosedOutline,
  'alert-circle-outline': alertCircleOutline,
  'checkmark-circle-outline': checkmarkCircleOutline
});

@Component({
  standalone: true,
  selector: 'app-reset-password-modal',
  templateUrl: './reset-password.modal.html',
  styleUrls: ['./reset-password.modal.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0, transform: 'translateY(-25px)' }))
      ])
    ])
  ]
})
export class ResetPasswordModalComponent {
  step: 'email' | 'verify' | 'reset' = 'email';
  form: FormGroup;
  showPassword = false;
  loading = false;

  // mensaje flotante
  showInlineAlert = false;
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private general: GeneralService,
    private modalCtrl: ModalController
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        ]
      ]
    });
  }

  // mensaje centrado con color
  showInlineMessage(message: string, type: 'success' | 'error' = 'error') {
    this.alertMessage = message;
    this.alertType = type;
    this.showInlineAlert = true;
    setTimeout(() => (this.showInlineAlert = false), 2500);
  }

  close() {
    this.modalCtrl.dismiss();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get emailCtrl() { return this.form.get('email')!; }
  get codeCtrl() { return this.form.get('code')!; }
  get passwordCtrl() { return this.form.get('password')!; }

  async sendCode() {
    if (this.emailCtrl.invalid) {
      this.showInlineMessage('Por favor ingresa un correo válido (ejemplo@dominio.com)', 'error');
      return;
    }
    this.loading = true;
    try {
      const res = await firstValueFrom(this.general.requestPasswordReset(this.emailCtrl.value));
      this.showInlineMessage(res.message || 'Código enviado a tu correo 📩', 'success');
      this.step = 'verify';
    } catch (err: any) {
      this.showInlineMessage(err.message || 'Error enviando el código', 'error');
    } finally {
      this.loading = false;
    }
  }

  async verifyCode() {
    if (this.codeCtrl.invalid) {
      this.showInlineMessage('El código debe ser numérico.', 'error');
      return;
    }
    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.general.verifyCode(this.emailCtrl.value, this.codeCtrl.value)
      );
      if (res.success) {
        this.showInlineMessage('Código verificado ✅', 'success');
        this.step = 'reset';
      } else {
        this.showInlineMessage('Código inválido', 'error');
      }
    } catch (err: any) {
      this.showInlineMessage(err.message || 'Error verificando el código', 'error');
    } finally {
      this.loading = false;
    }
  }

  async resetPassword() {
    if (this.passwordCtrl.invalid) {
      this.showInlineMessage(
        'Contraseña inválida. Debe tener entre 8 y 20 caracteres, una mayúscula, número y símbolo.',
        'error'
      );
      return;
    }

    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.general.resetPassword(
          this.emailCtrl.value,
          this.codeCtrl.value,
          this.passwordCtrl.value
        )
      );
      this.showInlineMessage(res.message || 'Contraseña actualizada ✅', 'success');
      setTimeout(() => this.modalCtrl.dismiss(), 2000);
    } catch (err: any) {
      this.showInlineMessage(err.message || 'Error restableciendo contraseña', 'error');
    } finally {
      this.loading = false;
    }
  }
}
