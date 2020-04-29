import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { MenuItem } from '../models/menuItem.model';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
    constructor(private apollo: Apollo) {}






    resetStore() {
      console.log('apollo resetStore');
      return this.apollo.getClient().resetStore();
    }

    getRestaurant(restaurantId: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
        query: gql`
          query{
            getRestaurant (
            restaurantId:"${restaurantId}"
          ) {
            _id
            name
            address
            locationGeo {
              lat
              lng
            }
            openingHours {
              day
              openTime
              closeTime
            }
            mainImageUrl

          }
          }

        `} );
    }

    getOneMenuItem(menuItemId: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
        query: gql`
          query{
            getMenuItem (
              menuItemId:"${menuItemId}"
          ) {
            _id
            name
            name_fr
            description
            description_fr
            price
            quantity
            category
            options {
              name
              name_fr
              required
              min
              max
              exactNumber
              toppings {
                name
                name_fr
                price
                quantity
                default
                selected
            }
            }
          }
          }

        `} );
    }

    getMenuItems(): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
        query: gql`
          query{
            getMenuItems {
            _id
            name
            name_fr
            description
            description_fr
            price
            quantity
            category
            options {
              name
              name_fr
              required
              min
              max
              exactNumber
              toppings {
                name
                name_fr
                price
                quantity
                default
                selected
            }
            }
            


          }
          }

        `} );
    }

    getMenuCategories(sortMethod: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
        query: gql`
          query{
            getMenuCategories(
              sortMethod:"${sortMethod}"
            ) {
              _id
              name
              name_fr
              index
              description
              description_fr
              code
              active
              imageUrl


           }
          }

        `} );
    }

    getOrder(orderId: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
      query: gql`
      query{
      getOrder(
        orderId:"${orderId}"
        )
      {
        _id
        rawPrice
        status
        paymentMethod
        tipsPercentage
        totalPrice
        selectedItems {
          price
          optionsText
          optionsText_fr
          menuItemId
          quantity
          notes
          totalPrice
      
         }
  
      }
   }
      `} );
    }

    getOrders(userId: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
      query: gql`
      query{
      getOrders(
        userId:"${userId}"
        )
      {
        _id
        rawPrice
        status
        paymentMethod
        tipsPercentage
        totalPrice
        selectedItems {
          price
          optionsText
          optionsText_fr
          menuItemId
          quantity
          notes
          totalPrice
      
         }
  
      }
   }
      `} );
    }

    createOrder(order: Order): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {

      console.log('Graphql createOrder', order);
      // clean the index, concatenate the item objects to get a string [{key:"vakue",key:"value"}{}{}]
      let itemsCleanList = '';
      order.selectedItems.forEach( item => {
        itemsCleanList += JSON.stringify(item);
      });

      itemsCleanList = '[' + itemsCleanList.replace(/"([^"]+)":/g, "$1:") + ']';
     
      return this.apollo.mutate<any>({
        mutation: gql`
        mutation {
          createOrder(orderInput: {
            restaurant:"5e9627c5c516c2794b861961"
            customer:"${order.customer._id}"
            collectionMethod:"${order.collectionMethod}"
            selectedItems:${itemsCleanList}
            selectedItemsString:"${order.selectedMenuItemsString}"
            status:"${order.status}"
            paymentMethod:"${order.paymentMethod}"
            rawPrice:${order.rawPrice}
            totalPrice:${order.totalPrice}
            subTotalPrice:${order.subTotalPrice}
            tipsPercentage:${order.tips.intValue}

          })
          {
            _id
            rawPrice
            status
            paymentMethod
            tipsPercentage
            totalPrice
            subTotalPrice
            selectedItems {
              name
              name_fr
              price
              optionsText
              optionsText_fr
              menuItemId
              quantity
              totalPrice
              }
          }
        }

        `});
    }


    getConfigItems(name: string, sortMethod: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
        query: gql`
          query{
            getConfigItems(
              name:"${name}"
              sortMethod:"${sortMethod}"
            ){
            _id
            name
            code
            value
            value_fr
            intValue
            floatValue
            index
            active
            selected
            field1
            field2
            field3
           }
          }
        `} );
    }


    login(email: string, password: string): Observable<ApolloQueryResult<any>> {
        console.log('apollo getplayers: ');
        // tslint:disable-next-line: no-unused-expression
        return this.apollo.query<any>({
          query: gql`
                  query {
                    login (
                      email:"${email}"
                      password: "${password}"

                    ) {
                      userId
                      token
                      username
                      expiresIn
                    }
                  },
                `,
        });
      }

      signup(
        userName: string,
        email: string,
        password: string,
      ): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
        return this.apollo.mutate<any>({
          mutation: gql`
          mutation {
            createUser(userInput:
            {
              email: "${email}",
              password:"${password}",
              name:"${userName}"
            }
              ) {
                name
                email
                _id

              }
            }

          `,
        });
      }

      resetPassword(email: string): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
        return this.apollo.mutate<any>({
          mutation: gql`
          mutation {
            resetPassword(
               email: "${email}"
              )
            }
          `,
        });
      }

      facebookSignIn(code: string): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
        return this.apollo.mutate<any>({
          mutation: gql`
        mutation {
          facebookSignIn(code: "${code}")
        }
      `,
        });
      }

      updatePassword(
        token: string,
        userId: string,
        password: string,
      ): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
        console.log('apollo updatePassword ');
        // tslint:disable-next-line: no-unused-expression
        return this.apollo.mutate<any>({
          mutation: gql`
                    mutation {
                      updatePassword (
                        token:"${token}",
                        userId:"${userId}",
                        password:"${password}"
                      )
                    },
                  `,
        });
      }

      payWithCard(amount: number, token: string): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
        return this.apollo.mutate<any>({
          mutation: gql`
            mutation {
              payWithCard(
                amount:${amount}
                token: "${token}"
                )
                {
                  success
                  message
                }
              }
            `,
        });
      }
      uploadFile(file: File): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
        return this.apollo.mutate<any>({
          mutation: gql`
          mutation {
            uploadFile(
               file: "${file}"
              )
            }
          `,
        });
      }

}
