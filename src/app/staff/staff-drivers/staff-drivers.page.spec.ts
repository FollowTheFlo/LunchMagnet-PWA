import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffDriversPage } from './staff-drivers.page';

describe('StaffDriversPage', () => {
  let component: StaffDriversPage;
  let fixture: ComponentFixture<StaffDriversPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffDriversPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffDriversPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
