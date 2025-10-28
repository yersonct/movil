import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { GeneralService } from 'src/app/generic/services/general.service';
import { VehicleDto } from 'src/app/generic/models/IEntitys';
import { FormatDatePipe } from "../../shared/formatDate/format-date-pipe";

type FilterKey = 'all' | 'car' | 'moto' | 'bike';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  details?: any;
}

/** 🖼️ Mapa de imágenes por tipo de vehículo */
const TYPE_IMAGE_MAP_ID: Record<number, string> = {
  1: 'assets/images/vehiculos/auto.png',
  4: 'assets/images/vehiculos/moto.png',
  5: 'assets/images/vehiculos/bici.png',
};

const TYPE_IMAGE_MAP_NAME: Record<string, string> = {
  'auto': 'assets/images/vehiculos/auto.png',
  'carro': 'assets/images/vehiculos/auto.png',
  'car': 'assets/images/vehiculos/auto.png',
  'moto': 'assets/images/vehiculos/moto.png',
  'bicicletas': 'assets/images/vehiculos/bici.png',
  'bicicleta': 'assets/images/vehiculos/bici.png',
};

const DEFAULT_VEHICLE_IMG = 'assets/images/vehiculos/default.png';
const OTHER_VEHICLE_IMG = 'assets/images/vehiculos/otros.png';

function normalizeTypeName(name?: string | null): string {
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

  // 🚗 Vehículos
  selectedFilter: FilterKey = 'all';
  allVehicles: VehicleDto[] = [];
  selectedVehicle: VehicleDto | null = null;
  loadingVehicles = true;

  // 🖼️ Slider
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
    switch (filter) {
      case 'car': return 'Carro';
      case 'moto': return 'Moto';
      case 'bike': return 'Bicicleta';
      default: return null;
    }
  }

  /** 🚗 Carga los vehículos del cliente desde el endpoint Client/by-client */
  async loadVehiclesFromApi() {
    this.loadingVehicles = true;
    try {
      const clientId = await this.general.getClientId();

      if (!clientId) {
        this.allVehicles = [];
        this.selectedVehicle = null;
        return;
      }

      // ✅ Nueva llamada al endpoint Client/by-client
      const resp = await firstValueFrom(this.general.getClientWithVehicles(clientId));
      console.log('📦 Cliente con vehículos:', resp);

      if (!resp?.success || !resp.data?.vehicles) {
        this.allVehicles = [];
        return;
      }

      // 🔥 Normaliza los campos
      this.allVehicles = resp.data.vehicles.map((v: any) => ({
        ...v,
        typeVehicle: typeof v.typeVehicle === 'object'
          ? v.typeVehicle?.name ?? 'Desconocido'
          : v.typeVehicle ?? 'Desconocido',
        plate: v.plate?.toUpperCase() ?? 'SIN PLACA',
        color: v.color ?? '—',
        isInside: !!v.isInside
      }));

      this.autoPickFirst();

    } catch (error) {
      console.error('❌ Error al cargar vehículos:', error);
      this.allVehicles = [];
      this.selectedVehicle = null;
    } finally {
      this.loadingVehicles = false;
    }
  }

  get filteredVehicles(): VehicleDto[] {
    const type = this.mapFilterToType(this.selectedFilter);
    if (!type) return this.allVehicles;
    return this.allVehicles.filter(v => normalizeTypeName(v.typeVehicle) === normalizeTypeName(type));
  }

  onChangeFilter(f: FilterKey) {
    this.selectedFilter = f;
    this.autoPickFirst();
  }

  autoPickFirst() {
    const list = this.filteredVehicles;
    this.selectedVehicle = list.length > 0
      ? list[0]
      : (this.allVehicles.length > 0 ? this.allVehicles[0] : null);
  }

  onPick(v: VehicleDto) {
    this.selectedVehicle = v;
  }

  getVehicleImg(v: VehicleDto | null): string {
    if (!v) return DEFAULT_VEHICLE_IMG;

    if (v.typeVehicleId != null && TYPE_IMAGE_MAP_ID[v.typeVehicleId]) {
      return TYPE_IMAGE_MAP_ID[v.typeVehicleId];
    }

    const key = normalizeTypeName(v.typeVehicle);
    if (TYPE_IMAGE_MAP_NAME[key]) {
      return TYPE_IMAGE_MAP_NAME[key];
    }

    return OTHER_VEHICLE_IMG;
  }

  // 🎞️ Slider automático
  private initializeSlider(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 4000);
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.totalSlides;
  }
}
