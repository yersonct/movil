import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, carOutline, personOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule],
})
export class TabsPage {
  selectedTab = 'home';

  constructor(private router: Router) {
    addIcons({ homeOutline, carOutline, personOutline });
  }

  ngOnInit() {
    this.detectCurrentTab();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.detectCurrentTab();
    });
  }

  detectCurrentTab() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('home')) this.selectedTab = 'home';
    else if (currentUrl.includes('ordenar')) this.selectedTab = 'ordenar';
    else if (currentUrl.includes('user')) this.selectedTab = 'user';
  }

  goTo(tab: string) {
    this.selectedTab = tab;
    this.router.navigate([`/tabs/${tab}`]);
  }
}
