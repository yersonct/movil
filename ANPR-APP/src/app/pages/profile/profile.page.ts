import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ActionSheetController, AlertController, ModalController, ToastController, PopoverController } from '@ionic/angular';
import { GeneralService } from 'src/app/generic/services/general.service';
import { User, Vehicle } from 'src/app/generic/models/IEntitys';
import { EditProfileModalComponent } from './UpdateDatoBasicUser/edit-profile-modal.component'; // 👈 Importamos el modal
import { ChangePasswordModalComponent } from './UpdatePassword/ChangePasswordModalComponent';

interface UserStats {
  totalVisits: number;
  totalHours: number;
  totalSpent: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ProfilePage implements OnInit {
  userProfile: User = {
    id: 0,
    username: '',
    email: '',
    personName: '',
    personId: 0,
    asset: true,
    isDeleted: false,
    password: ''
  };

  Vehicles: Vehicle[] = [];

  userStats: UserStats = {
    totalVisits: 42,
    totalHours: 156,
    totalSpent: 89500
  };

  appVersion: string = '1.2.3';

  constructor(
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private router: Router,
    private generalService: GeneralService
  ) { }

  ngOnInit() {
    this.loadUserData();
  }

  // ==========================
  // Carga de datos
  // ==========================
  async loadUserData() {
    const userIdStr = await this.generalService.getUserId();
    const clientId = await this.generalService.getClientId();

    if (userIdStr) {
      this.generalService.getUserById(Number(userIdStr)).subscribe({
        next: (res: any) => {
          this.userProfile = res.data;
          console.log("✅ Perfil cargado:", this.userProfile);

          if (clientId) {
            this.loadVehicles(clientId);
          }
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
        }
      });
    } else {
      console.warn("⚠️ No se encontró userId en storage");
    }
  }

  loadVehicles(clientId: number) {
    this.generalService.getVehiclesByClientId(clientId).subscribe({
      next: (res: any) => {
        this.Vehicles = res.data ?? res;
        console.log("🚗 Vehículos cargados:", this.Vehicles);
      },
      error: (err) => console.error("❌ Error cargando vehículos:", err)
    });
  }

  // ==========================
  // Header
  // ==========================
  async refreshProfile() {
    const toast = await this.toastController.create({
      message: 'Actualizando perfil...',
      duration: 2000,
      position: 'top'
    });
    await toast.present();

    await this.loadUserData();
  }

  showSettings() {
    console.log('Mostrar configuración');
  }

  // ==========================
  // Perfil
  // ==========================
async changeAvatar() {
  const actionSheet = await this.actionSheetController.create({
    header: 'Opciones',
    buttons: [
      {
        text: 'Editar Perfil',
        icon: 'create-outline',
        handler: () => this.editProfile()
      },
      {
        text: 'Cambiar Contraseña',
        icon: 'lock-closed-outline',
        handler: () => this.changePassword() // aquí abres modal o llamas directo
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel'
      }
    ]
  });

  await actionSheet.present();
}

  // Cambiar contraseña
  async changePassword() {
    const modal = await this.modalController.create({
      component: ChangePasswordModalComponent
    });
    await modal.present();
  }
  // 🚀 Modal para editar perfil
  async editProfile() {
    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: {
        userProfile: { ...this.userProfile } // 👈 pasamos copia editable
      }
    });

    await modal.present();

    // obtener datos al cerrar
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.userProfile = data; // 👈 actualizar vista principal
    }
  }

  // ==========================
  // Vehículos
  // ==========================
  addVehicle() {
    console.log('Agregar vehículo');
  }

  editVehicle(vehicle: Vehicle) {
    console.log('Editar vehículo:', vehicle);
  }

  // ==========================
  // Otros
  // ==========================
  showHelp() {
    console.log('Mostrar ayuda');
  }

  showPrivacyPolicy() {
    console.log('Mostrar política de privacidad');
  }

  showTerms() {
    console.log('Mostrar términos y condiciones');
  }

  async rateApp() {
    const alert = await this.alertController.create({
      header: 'Calificar App',
      message: '¿Te gusta nuestra aplicación?',
      buttons: [
        {
          text: 'Más tarde',
          role: 'cancel'
        },
        {
          text: 'Calificar',
          handler: () => {
            console.log('Abrir store para calificar');
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: async () => {
            try {
              await this.generalService.clearAuth();

              const toast = await this.toastController.create({
                message: 'Sesión cerrada exitosamente',
                duration: 2000,
                position: 'bottom'
              });
              await toast.present();

              this.router.navigate(['/splash']);
            } catch (error) {
              console.error('Error durante el logout:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
