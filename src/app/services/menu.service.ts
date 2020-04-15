import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { MenuItem } from './../models/menuItem.model';
import { OpeningSlot } from './../models/openingSlot.model';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { take, map, tap, delay, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuService {

    private menuItems: MenuItem[] = [];
    private _menuItems = new BehaviorSubject<MenuItem[]>([]);
    private category: string[] = [];
    
    constructor(
        public graphqlService: GraphqlService,
        private httpClient: HttpClient
        ) {}

    fetchMenuItems() {
        console.log('fetchMenuItems');
        return this.graphqlService.getMenuItems().pipe(
            map(response => response.data.getMenuItems),
            tap(menuItems => {
                this._menuItems.next(menuItems);
                this.menuItems = menuItems;
                console.log('in Tap', this.menuItems);
            })
        );
    }

    getConfigItems(name: string, sortMethod: string) {
        return this.graphqlService.getConfigItems(name, sortMethod)
        .pipe(
            map(response => response.data.getConfigItems),
            map( categories => {
                console.log('categories', categories);
                return categories.map(category => {
                    console.log('category', category);
                    category.field1 = environment.serverDomain + '/images/' + category.field1;
                    return category;
                });
            })
        );
    }

    getCategories() {
        //const uniqueCategories = this.menuItems.filter((x, i, a) => a.indexOf(x) === i)
        //const uniqueAges = ages.filter((x, i, a) => a.indexOf(x) == i)

        //const uniqueCategories = this.menuItems.filter((x, i, a) => a.indexOf(x) === i)
        const uniqueCategories = this.menuItems.filter(
            (item, i, arr) => arr.findIndex(t => t.category === item.category) === i
          );
        console.log('uniqueCategories', uniqueCategories);

    }

    uploadFile(file: File) {
        console.log('MenuService uploadFile');
        return this.graphqlService.uploadFile(file);
    }
    uploadImage(files: FileList) {
        console.log('postMethod');
        const fileToUpload = files.item(0);
        const  formData = new FormData();
        formData.append('image', fileToUpload, fileToUpload.name);
        return this.httpClient.put('http://localhost:3000/post-image', formData);
    
    }
}
