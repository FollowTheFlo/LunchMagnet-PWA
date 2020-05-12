import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, BehaviorSubject, Observable, of, from } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private local = 'en';
  private _local = new BehaviorSubject<string>('en');

  constructor(private translateService: TranslateService) {}

  getTranslation(word: string) {
    return this.translateService.get([word]).pipe(
      map((resArray) => {
        return resArray[word];
      }),
    );
  }

  localChanged$() {
    return this._local.asObservable();
  }

  getLocal() {
    return this.local;
  }

  setLocal(local) {
    this.translateService.use(local);
    this.local = local;
    this._local.next(local);
  }
}
