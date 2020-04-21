import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from './../services/menu.service';
import { NavigationService } from './../services/navigation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {

  selectedItemsCount = 0;
  selectedMenuItems: any;
  labelCode = '';
  private menSub: Subscription;
  private navSub: Subscription;

  constructor(
    private menuService: MenuService,
    private navigationService: NavigationService
    ) { }

  ngOnInit() {
    console.log('TabsPage');
    this.navSub = this.navigationService.getNavListener().subscribe((link) => {
      console.log('getNavListener', link);
      this.labelCode = link;
      // this.translationService.getTranslation(link).subscribe((label) => {
      //   this.topTitle = label;
      // });
    });

    this.menSub = this.menuService.selectedMenuItems$
      .subscribe( selectedItems => {
        console.log('Tabs selectedItems', selectedItems);
        this.selectedMenuItems = selectedItems;
      });
  }

  ngOnDestroy() {
    if (this.menSub) {
      this.menSub.unsubscribe();
    }
  }

}
