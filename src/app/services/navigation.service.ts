import { Injectable } from '@angular/core';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private link;
  private navListener = new Subject<string>();

  constructor() { }

  getNavListener() {
    return this.navListener.asObservable();
  }

  setNavLink(link: string) {
    this.link = link;
    this.navListener.next(link);
  }

  getLink(): string {
    return this.link;
  }

}
