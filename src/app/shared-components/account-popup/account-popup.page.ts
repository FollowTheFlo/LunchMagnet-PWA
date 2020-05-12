import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-popup',
  templateUrl: './account-popup.page.html',
  styleUrls: ['./account-popup.page.scss'],
})
export class AccountPopupPage implements OnInit {
  selectedLanguage = 'en';
  isAuth = true;
  constructor(
    public router: Router,
    public popoverCtrl: PopoverController,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    console.log('popup ngOnInit');
    this.isAuth = this.authService.getIsAuth();
  }

  async onPress(url) {
    console.log(url);
    await this.popoverCtrl.dismiss();
    this.router.navigate([url]);
  }

  onLocalSelect(selectedlocal) {
    console.log('value', selectedlocal);
    this.selectedLanguage = selectedlocal;
    //this.translationService.setLocal(selectedlocal);
  }

}
