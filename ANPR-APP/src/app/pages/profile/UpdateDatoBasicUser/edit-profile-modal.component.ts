import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { User } from 'src/app/generic/models/IEntitys';
import { GeneralService } from 'src/app/generic/services/general.service';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
//   styleUrls: ['./edit-profile-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditProfileModalComponent {
  @Input() userProfile!: User;

  constructor(
    private modalCtrl: ModalController,
    private generalService: GeneralService,
    private toastController: ToastController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  saveProfile() {
    const userToUpdate = {
      ...this.userProfile,
      password: '' // 👈 no queremos actualizar contraseña
    };

    this.generalService.updateUser(userToUpdate).subscribe({
    next: async (res: any) => {
        const updatedUser = res.data ?? res; // 👈 tomar data si viene envuelto
        this.modalCtrl.dismiss(updatedUser); // 👈 dev // 👈 devolvemos datos actualizados
        const toast = await this.toastController.create({
          message: 'Perfil actualizado con éxito',
          duration: 2000,
          color: 'success'
        });
        toast.present();
      },
      error: async (err) => {
        const toast = await this.toastController.create({
          message: 'Error al actualizar: ' + err.message,
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
