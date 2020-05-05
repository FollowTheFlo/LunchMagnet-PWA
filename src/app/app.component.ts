import { Component, OnInit } from '@angular/core';
import { User } from './models/user.model';
import { UserService } from './services/user.service';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  currentUser: User;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userService: UserService
  ) {
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      //this.statusBar.overlaysWebView(true);
      this.statusBar.show();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.userService.fetchUser('florent.letendre@gmail.com')
    .subscribe(user => {
      this.currentUser = user;
    });
    // this.authSub = this.authService.getAuthStatusListener().subscribe((authData) => {
    //   console.log('MainNavComponent Listener isAuth: ', authData.isAuthenticated);

    //   if (this.authService.getIsAuth() && !authData.isAdmin) {
    //     this.role = 'user';
    //   } else if (this.authService.getIsAuth() && authData.isAdmin) {
    //     this.role = 'admin';
    //   } else {
    //     this.role = '';
    //   }
    // });

    // this.authService.autoAuthUser();
  }

}
