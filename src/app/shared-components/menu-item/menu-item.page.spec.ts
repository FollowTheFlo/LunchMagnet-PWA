import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MenuItemPage } from './menu-item.page';

describe('MenuItemPage', () => {
  let component: MenuItemPage;
  let fixture: ComponentFixture<MenuItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuItemPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
