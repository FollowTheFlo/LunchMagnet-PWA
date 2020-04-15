import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';

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
            category
            toppings {
              name
              price
            }
            

          }
          }
        
        `} );
    }


    getConfigItems(code: string, sortMethod: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
        query: gql`
          query{
            getConfigItems(
              name:"${code}"
              sortMethod:"${sortMethod}"
            ){
            _id
            name
            value
            index
            field1
            field2
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
