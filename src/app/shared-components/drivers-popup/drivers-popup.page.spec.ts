import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DriversPopupPage } from './drivers-popup.page';

describe('DriversPopupPage', () => {
  let component: DriversPopupPage;
  let fixture: ComponentFixture<DriversPopupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriversPopupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DriversPopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
