import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { GeneralService } from 'src/app/generic/services/general.service';
import { VehicleDto } from 'src/app/generic/models/IEntitys';
import { FormatDatePipe } from "../../shared/formatDate/format-date-pipe";

type FilterKey = 'all' | 'car' | 'moto' | 'bike';

// interface VehicleDto {
//   id: number;
//   plate: string;
//   color: string;
//   typeVehicleId: number;
//   typeVehicle?: string | null; // "Auto" | "Moto" | "Bicicletas"
//   clientId: number;
//   client?: string | null;
//   asset: boolean;
//   isDeleted: boolean;
// }
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  details?: any;
}

/** Mapa de imágenes por tipo */
const TYPE_IMAGE_MAP_ID: Record<number, string> = {
  1: 'assets/images/vehiculos/auto.png',
  4: 'assets/images/vehiculos/moto.png',
  5: 'assets/images/vehiculos/bici.png',
  // agrega otros ids si corresponde
};
const TYPE_IMAGE_MAP_NAME: Record<string, string> = {
  'auto': 'assets/images/vehiculos/auto.png',
  'carro': 'assets/images/vehiculos/auto.png',
  'moto': 'assets/images/vehiculos/moto.png',
  'bicicletas': 'assets/images/vehiculos/bici.png',
  'bicicleta': 'assets/images/vehiculos/bici.png',
};

const DEFAULT_VEHICLE_IMG = 'assets/images/vehiculos/default.png';
const OTHER_VEHICLE_IMG = 'assets/images/vehiculos/otros.png';

function normalizeTypeName(name?: string | null) {
  return (name || '').trim().toLowerCase();
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, FormatDatePipe]
})
export class HomePageC implements OnInit, OnDestroy {
  username: string | null = null;

  // Vehículos
  selectedFilter: FilterKey = 'all';
  allVehicles: VehicleDto[] = [];
  selectedVehicle: VehicleDto | null = null;
  loadingVehicles = true;

  // (Si aún usas tu slider, puedes mantenerlo)
  private slideInterval: any;
  currentSlideIndex = 0;
  totalSlides = 3;

  constructor(private general: GeneralService) {}

  async ngOnInit() {
    await this.loadUserInfo();
    await this.loadVehiclesFromApi();
    this.initializeSlider();
  }

  ngOnDestroy() {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  private async loadUserInfo() {
    this.username = await this.general.getUsername();
  }

 private mapFilterToType(filter: FilterKey): string | null {
  if (filter === 'car') return 'Carro';
  if (filter === 'moto') return 'Moto';
  if (filter === 'bike') return 'Bicicleta';
  return null;
}


  async loadVehiclesFromApi() {
  this.loadingVehicles = true;
  try {
    const clientId = await this.general.getClientId();
    console.log('🧠 CLIENT ID guardado en Preferences:', clientId);

    if (!clientId) {
      console.warn('⚠️ No se encontró clientId en Preferences');
      this.allVehicles = [];
      this.selectedVehicle = null;
      this.loadingVehicles = false;
      return;
    }

    const resp = await firstValueFrom(
      this.general.get<ApiResponse<VehicleDto[]>>(`Vehicle/byClient/${clientId}`)
    );

    if (!resp || !resp.success) {
      console.error('❌ Respuesta inválida del backend', resp);
      this.allVehicles = [];
      this.selectedVehicle = null;
      return;
    }

    this.allVehicles = resp.data ?? [];

    if (this.allVehicles.length === 0) {
      console.info('ℹ️ Cliente sin vehículos registrados');
    } else {
      console.log(`✅ Vehículos cargados: ${this.allVehicles.length}`);
      console.table(this.allVehicles);
    }

    this.autoPickFirst();
  } catch (e: any) {
    console.error('❌ Error cargando vehículos:', e);
    this.allVehicles = [];
    this.selectedVehicle = null;
  } finally {
    this.loadingVehicles = false;
  }
}

  get filteredVehicles(): VehicleDto[] {
    const type = this.mapFilterToType(this.selectedFilter);
    if (!type) return this.allVehicles;
    return this.allVehicles.filter(v => (v.typeVehicle ?? '').toLowerCase() === type.toLowerCase());
  }

  onChangeFilter(f: FilterKey) {
    this.selectedFilter = f;
    this.autoPickFirst();
  }

 autoPickFirst() {
  const list = this.filteredVehicles;
  if (list.length > 0) {
    this.selectedVehicle = list[0];
  } else if (this.allVehicles.length > 0) {
    this.selectedVehicle = this.allVehicles[0];
  } else {
    this.selectedVehicle = null;
  }
}


  onPick(v: VehicleDto) {
    this.selectedVehicle = v;
  }

  getVehicleImg(v: VehicleDto | null): string {
    if (!v) return DEFAULT_VEHICLE_IMG;

    // 1) por ID
    if (v.typeVehicleId != null && TYPE_IMAGE_MAP_ID[v.typeVehicleId]) {
      return TYPE_IMAGE_MAP_ID[v.typeVehicleId];
    }
    // 2) por nombre
    const key = normalizeTypeName(v.typeVehicle);
    if (key && TYPE_IMAGE_MAP_NAME[key]) {
      return TYPE_IMAGE_MAP_NAME[key];
    }
    // 3) fallback
    return OTHER_VEHICLE_IMG;
  }

  // Slider demo (si lo usas)
  private initializeSlider(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 4000);
  }
  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.totalSlides;
  }
}
