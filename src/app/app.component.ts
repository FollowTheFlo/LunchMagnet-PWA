import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from './models/user.model';
import { AuthService } from './services/auth.service';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private pltSub: Subscription;
  private userSub: Subscription;
  currentUser: User;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private location: Location,
    private statusBar: StatusBar,
    private authService: AuthService
  ) {
    this.initializeApp();
    this.backButtonEvent();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      //this.statusBar.overlaysWebView(true);
      this.statusBar.show();
      this.splashScreen.hide();
    });
  }

  backButtonEvent() {
    this.pltSub = this.platform.backButton.subscribe(() => {
      console.log('backButtonEvent', this.location.path);

      this.location.back();
    });
  }

  ngOnInit() {
 
  }

  ngOnDestroy() {
    if (this.pltSub) {
      this.pltSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}
