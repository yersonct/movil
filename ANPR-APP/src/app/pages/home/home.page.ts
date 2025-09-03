import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { GeneralService } from 'src/app/generic/services/general.service';

interface ParkingZone {
  id: string;
  name: string;
  occupied: number;
  total: number;
  color: string;
  percentage: number;
  status: 'available' | 'moderate' | 'busy' | 'full';
}

interface ActivityItem {
  plate: string;
  type: 'entrada' | 'salida';
  time: string;
  isRecent: boolean;
}

interface SlideData {
  id: number;
  icon: string;
  value: string;
  label: string;
  trend: string;
  trendDirection: 'up' | 'down';
  gradientClass: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit {
   username: string | null = null;
    currentSlideIndex: number = 0;
  totalSlides: number = 3;
  private slideInterval: any;

  // Datos del slider
  slides: SlideData[] = [
    {
      id: 1,
      icon: 'car-sport-outline',
      value: '45',
      label: 'Espacios Disponibles',
      trend: '+5 en la última hora',
      trendDirection: 'up',
      gradientClass: 'gradient-primary'
    },
    {
      id: 2,
      icon: 'speedometer-outline',
      value: '2.3min',
      label: 'Tiempo Promedio Entrada',
      trend: '-30s vs ayer',
      trendDirection: 'down',
      gradientClass: 'gradient-success'
    },
    {
      id: 3,
      icon: 'analytics-outline',
      value: '92%',
      label: 'Precisión ANPR',
      trend: 'Excelente rendimiento',
      trendDirection: 'up',
      gradientClass: 'gradient-warning'
    }
  ];

  // Datos de las zonas
  parkingZones: ParkingZone[] = [
    {
      id: 'A',
      name: 'Zona A',
      occupied: 15,
      total: 20,
      color: '#3b82f6',
      percentage: 75,
      status: 'busy'
    },
    {
      id: 'B',
      name: 'Zona B',
      occupied: 8,
      total: 15,
      color: '#22c55e',
      percentage: 53,
      status: 'moderate'
    },
    {
      id: 'C',
      name: 'Zona C',
      occupied: 22,
      total: 25,
      color: '#f59e0b',
      percentage: 88,
      status: 'full'
    },
    {
      id: 'D',
      name: 'Zona VIP',
      occupied: 3,
      total: 10,
      color: '#8b5cf6',
      percentage: 30,
      status: 'available'
    }
  ];

  // Actividad reciente
  recentActivity: ActivityItem[] = [
    {
      plate: 'ABC-123',
      type: 'entrada',
      time: 'Hace 2min',
      isRecent: true
    },
    {
      plate: 'XYZ-789',
      type: 'salida',
      time: 'Hace 5min',
      isRecent: false
    }
  ];

  // Estadísticas generales
  totalSpaces: number = 200;
  occupiedSpaces: number = 155;
  availableSpaces: number = 45;
  occupancyPercentage: number = 77.5;

  // Estadísticas de flujo
  todayEntries: number = 24;
  todayExits: number = 18;

  // Métricas de rendimiento
  anprAccuracy: number = 92;
  systemUptime: number = 98;
  responseTime: string = '2.1s';

  // Ingresos
  dailyRevenue: string = '$1,245,000';
  monthlyRevenue: string = '$28,890,000';
  revenueGrowth: number = 12;

  constructor(private general: GeneralService) { }

   async ngOnInit() {
    await this.loadUserInfo();
    this.initializeSlider();
  }

     private async loadUserInfo() {
    this.username = await this.general.getUsername();   // <- obtiene de Preferences
  }

   private initializeSlider(): void {
    // Auto-play del slider cada 4 segundos
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  // Métodos del slider
  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.totalSlides;
    this.updateSlideDisplay();
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.updateSlideDisplay();
  }

  private updateSlideDisplay(): void {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    // Remover clases activas
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index === this.currentSlideIndex) {
        slide.classList.add('active');
      }
    });

    // Actualizar dots
    dots.forEach((dot, index) => {
      dot.classList.remove('active');
      if (index === this.currentSlideIndex) {
        dot.classList.add('active');
      }
    });
  }

  // Métodos utilitarios
  getZoneStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'available': 'success',
      'moderate': 'primary',
      'busy': 'warning',
      'full': 'danger'
    };
    return statusColors[status] || 'medium';
  }

  getActivityIcon(type: 'entrada' | 'salida'): string {
    return type === 'entrada' ? 'arrow-down-circle' : 'arrow-up-circle';
  }

  getActivityColor(type: 'entrada' | 'salida'): string {
    return type === 'entrada' ? 'success' : 'primary';
  }

  // Métodos para acciones
  onNotificationClick(): void {
    console.log('Notificaciones clicked');
    // Implementar navegación a notificaciones
  }

  onZoneClick(zone: ParkingZone): void {
    console.log('Zone clicked:', zone);
    // Implementar navegación a detalle de zona
  }

  refreshData(): void {
    console.log('Refreshing data...');
    // Implementar refresh de datos desde el servidor
    this.loadParkingData();
  }

  private loadParkingData(): void {
    // Aquí conectarías con tu servicio para obtener datos actualizados
    // Por ejemplo:
    // this.parkingService.getCurrentStatus().subscribe(data => {
    //   this.availableSpaces = data.available;
    //   this.occupiedSpaces = data.occupied;
    //   // etc...
    // });
  }

  // Método para formatear números
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Método para obtener el tiempo transcurrido
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace menos de 1min';
    if (diffMins < 60) return `Hace ${diffMins}min`;

    const diffHours = Math.floor(diffMins / 60);
    return `Hace ${diffHours}h`;
  }

  // Método para obtener el color del indicador de capacidad
  getCapacityColor(percentage: number): string {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'danger';
  }

  // Simular datos en tiempo real (opcional)
  private simulateRealTimeData(): void {
    setInterval(() => {
      // Simular cambios pequeños en los datos
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, o 1
      this.availableSpaces = Math.max(0, Math.min(this.totalSpaces, this.availableSpaces + variation));
      this.occupiedSpaces = this.totalSpaces - this.availableSpaces;
      this.occupancyPercentage = Math.round((this.occupiedSpaces / this.totalSpaces) * 100 * 10) / 10;
    }, 30000); // Cada 30 segundos
  }

ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

}
