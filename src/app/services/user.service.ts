import { Injectable } from '@angular/core';
import { User } from './../models/user.model';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

    private user: User = {
        _id: '5e8f3fd01986990acb872db9',
        username: '',
        email: '',
        password: '',
        collectionMethod: 'DELIVERY',
        address: ''

    };
    private _user = new BehaviorSubject<User>(this.user);

    constructor() {}

    get user$() {
        return this._user.asObservable();
    }

    updateUser(user: User) {
        console.log('updateUser', user);
        this.user = user;
        this._user.next(user);
    }

}