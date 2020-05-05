import { Injectable } from '@angular/core';
import { User } from './../models/user.model';
import { GraphqlService } from './graphql.service';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {

    private user: User = {
        _id: '5e8f3fd01986990acb872db9',
        username: '',
        email: '',
        password: '',
        collectionMethod: 'DELIVERY',
        deliveryAddress: 'nope',
        role: 'nothing',
        deliveryLocationGeo: null

    };
    private _user = new BehaviorSubject<User>(this.user);

    constructor( private graphqlService: GraphqlService) {}

    get user$() {
        return this._user.asObservable();
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

    updateUser(user: User) {
        console.log('updateUser', user);
        this.user = JSON.parse(JSON.stringify(user));
        this._user.next(JSON.parse(JSON.stringify(user)));
    }

}