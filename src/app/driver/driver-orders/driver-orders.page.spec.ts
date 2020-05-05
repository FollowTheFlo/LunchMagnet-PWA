import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DriverOrdersPage } from './driver-orders.page';

describe('DriverOrdersPage', () => {
  let component: DriverOrdersPage;
  let fixture: ComponentFixture<DriverOrdersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverOrdersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DriverOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
