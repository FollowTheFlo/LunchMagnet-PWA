import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { MenuItem } from './../models/menuItem.model';
import { MenuCategory } from './../models/menuCategory.model';
import { OpeningSlot } from './../models/openingSlot.model';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { take, map, tap, delay, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuService {

    
    private menuCategories: MenuCategory[] = [];
   
    private menuItems: MenuItem[] = [];
    private _menuItems = new BehaviorSubject<MenuItem[]>([]);

    private selectedMenuItems: MenuItem[] = [];
    private _selectedMenuItems = new BehaviorSubject<MenuItem[]>([]);
    
    private category: string[] = [];
    
    constructor(
        public graphqlService: GraphqlService,
        private httpClient: HttpClient
        ) {}

    get selectedMenuItems$() {
        return this._selectedMenuItems.asObservable();
    }

    addSelectedMenuItem(menuItem: MenuItem) {
        console.log( 'MenuService addSelectedMenuItem')
        this.selectedMenuItems.push(menuItem);
        this._selectedMenuItems.next(this.selectedMenuItems);
        
    }

    removeSelectedMenuItem(menuItem: MenuItem) {
        this.selectedMenuItems.filter(item => item._id !== menuItem._id);
        this._selectedMenuItems.next(this.selectedMenuItems);
    }

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

    fetchMenuCategories(sortMethod: string) {
        console.log('fetchMenuCategories');
        return this.graphqlService.getMenuCategories(sortMethod).pipe(
            map(response => response.data.getMenuCategories),
            map( categories => {
                console.log('categories', categories);
                return categories.map(category => {
                    console.log('category', category);
                    category.imageUrl = environment.IMAGE_SERVER_DOMAIN + '/images/' + category.imageUrl;
                    return category;
                });
            }),
            tap(menuCategories => {
                this.menuCategories = menuCategories;
                console.log('in Tap', this.menuCategories);
            })
        );
    }

    getOneMenuItem(menuItemId) {
        console.log('getOneMenuItem', menuItemId);
        // return from(
        //     new Promise<MenuItem>( (resolve, reject) => {
        //         const menuItem = this.menuItems.find(item => item._id === menuItemId );
        //         if (menuItem !== undefined) {
        //             console.log('resolve', menuItem);
        //             resolve(menuItem);
        //         } else {
        //             reject('menuItem not found locally');
        //         }
        //      }

        //     )
        // );

        return this.graphqlService.getOneMenuItem(menuItemId).pipe(
            map(response => response.data.getMenuItem)
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
                    category.field1 = environment.IMAGE_SERVER_DOMAIN + '/images/' + category.field1;
                    return category;
                });
            })
        );
    }

    getMenuCategories(sortMethod: string) {

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
