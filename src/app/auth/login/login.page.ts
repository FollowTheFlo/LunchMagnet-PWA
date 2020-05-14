import { Component, OnInit } from '@angular/core';
import { User } from './../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from './../../services/navigation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  users: User[] = [];
  currentUserEmail = 'florent.letendre@gmail.com';

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.fetchUsers()
    .subscribe(users => {
      this.users = users;
    });
  }

  onUserSelect(event) {
    console.log('onUserSelect', event.target.value);
    this.currentUserEmail = event.target.value;
    this.authService.fetchUser(this.currentUserEmail)
    .subscribe(u => {
      console.log('succesfully login');
    },
    error => console.log(error)
    );
  }

  onClickLogin() {
    this.authService.fetchUser(this.currentUserEmail)
    .subscribe(u => {
      console.log('succesfully login');
    },
    error => console.log(error)
    );
  }

}
