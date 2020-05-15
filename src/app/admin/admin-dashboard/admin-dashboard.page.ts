import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  user: User;
  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.user$
    .subscribe( user => this.user = user);
  }

  onSelectView(event) {
    console.log('view', event.target.value);

    this.user.view = event.target.value;
    this.authService.updateUserLocally({...this.user});
  }

}
