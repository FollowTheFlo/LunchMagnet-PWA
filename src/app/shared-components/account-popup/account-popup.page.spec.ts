import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AccountPopupPage } from './account-popup.page';

describe('AccountPopupPage', () => {
  let component: AccountPopupPage;
  let fixture: ComponentFixture<AccountPopupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPopupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
