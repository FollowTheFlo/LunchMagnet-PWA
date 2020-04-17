import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddressSearchPage } from './address-search.page';

describe('AddressSearchPage', () => {
  let component: AddressSearchPage;
  let fixture: ComponentFixture<AddressSearchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressSearchPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
