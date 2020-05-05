import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffOrdersPage } from './staff-orders.page';

describe('StaffOrdersPage', () => {
  let component: StaffOrdersPage;
  let fixture: ComponentFixture<StaffOrdersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffOrdersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
