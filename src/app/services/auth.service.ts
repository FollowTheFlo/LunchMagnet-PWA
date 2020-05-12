import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { GraphqlService } from './graphql.service';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private user: User = {
        _id: '5eb5c58f6e1880a473daf050',
        username: '',
        email: '',
        password: '',
        collectionMethod: 'DELIVERY',
        deliveryAddress: '',
        role: 'visitor',
        deliveryLocationGeo: null,
        name: 'Visitor'

    };
    users: User[] = [];
    private _user = new BehaviorSubject<User>(this.user);

    constructor( private graphqlService: GraphqlService) {}

    get user$() {
        return this._user.asObservable();
    }

    get currentUser() {
        return {...this.user};
    }

    getIsAuth() {
        return true;
      }

    fetchUser(email: string) {
        return this.graphqlService.getUser(email).pipe(
            map(response => response.data.getUser),
            tap(user => {
                this.user = user;
                this._user.next({...this.user});
            })
        );
    }

    fetchUsers() {
        return this.graphqlService.getUsers().pipe(
            map(response => response.data.getUsers),
           
        );
    }

    updateUser(user: User) {
        console.log('updateUser', user);
        return this.graphqlService.updateUser(JSON.parse(JSON.stringify(user))).pipe(
            map(response => response.data.updateUser),
            tap(updatedUser => {
                console.log('success');
                this.user = updatedUser;
                this._user.next(JSON.parse(JSON.stringify(updatedUser)));
            })
        );

       // this.user = JSON.parse(JSON.stringify(user));
       // this._user.next(JSON.parse(JSON.stringify(user)));
    }

}