import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { MenuItem } from '../models/menuItem.model';
import { Order } from '../models/order.model';
import { Driver } from '../models/driver.model';
import { User } from '../models/user.model';

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
        subTotalPrice
        finished
        totalPrice
        collectionMethod
        createdAt
        updatedAt
        currentStep {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
        }
        currentStepIndex
        selectedItems {
          name
          price
          optionsText
          optionsText_fr
          menuItemId
          quantity
          notes
          totalPrice

         }
         deliveryAddress
         deliveryLocationGeo {
          lat
          lng
         }
         steps {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
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
        subTotalPrice
        finished
        totalPrice
        collectionMethod
        createdAt
        updatedAt
        currentStep {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
        }
        currentStepIndex
        selectedItems {
          name
          price
          optionsText
          optionsText_fr
          menuItemId
          quantity
          notes
          totalPrice

         }
         deliveryAddress
         deliveryLocationGeo {
          lat
          lng
         }
         steps {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
         }

      }
   }
      `} );
    }

    getDriverOrders(driverId: string): Observable<ApolloQueryResult<any>> {
      return this.apollo.query<any>({
      query: gql`
      query{
      getDriverOrders(
        driverId:"${driverId}"
        )
        {
          _id
        rawPrice
        status
        paymentMethod
        tipsPercentage
        subTotalPrice
        finished
        totalPrice
        collectionMethod
        createdAt
        updatedAt
        currentStep {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
        }
        currentStepIndex
        selectedItems {
          name
          price
          optionsText
          optionsText_fr
          menuItemId
          quantity
          notes
          totalPrice

         }
         deliveryAddress
         deliveryLocationGeo {
          lat
          lng
         }
         steps {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
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

      let cleanDeliveryLocationGeo = '{lat:'+ order.deliveryLocationGeo.lat + ',lng:'+order.deliveryLocationGeo.lng+'}';
      //cleanDeliveryLocationGeo.replace(/"([^"]+)":/g, "$1:");



      console.log('order deliverLocation', order.deliveryLocationGeo);
      console.log('order clean', cleanDeliveryLocationGeo);

      itemsCleanList = '[' + itemsCleanList.replace(/"([^"]+)":/g, "$1:") + ']';

      console.log('itemsCleanList', itemsCleanList);

      return this.apollo.mutate<any>({
        mutation: gql`
        mutation {
          createOrder(orderInput: {
            deliveryLocationGeo:${cleanDeliveryLocationGeo}
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
            deliveryAddress:"${order.deliveryAddress}"


          })
          {
            _id
        rawPrice
        status
        paymentMethod
        tipsPercentage
        subTotalPrice
        finished
        totalPrice
        collectionMethod
        createdAt
        updatedAt
        currentStep {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
        }
        currentStepIndex
        selectedItems {
          name
          price
          optionsText
          optionsText_fr
          menuItemId
          quantity
          notes
          totalPrice

         }
         deliveryAddress
         deliveryLocationGeo {
          lat
          lng
         }
         steps {
          code
          name
          name_fr
          startedAt
          targetTeam
          assignee
          inProgress
          completed
          completedDate
          completionAction
          completionAction_fr
          completedBy
          showMap
          canceled
          canceledDate
          canceledBy
          index
          btnOK
          btnKO
         }

          }
        }

        `});
    }

    completeOrderStep(orderId: string, index: number): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
      return this.apollo.mutate<any>({
        mutation: gql`
        mutation {
          completeOrderStep(orderId: "${orderId}",index: ${index})
          {
            _id
            rawPrice
            status
            paymentMethod
            tipsPercentage
            subTotalPrice
            finished
            totalPrice
            collectionMethod
            createdAt
            updatedAt
            currentStep {
              code
              name
              name_fr
              startedAt
              targetTeam
              assignee
              inProgress
              completed
              completedDate
              completionAction
              completionAction_fr
              completedBy
              showMap
              canceled
              canceledDate
              canceledBy
              index
              btnOK
              btnKO
            }
            currentStepIndex
            selectedItems {
              name
              price
              optionsText
              optionsText_fr
              menuItemId
              quantity
              notes
              totalPrice

            }
            deliveryAddress
            deliveryLocationGeo {
              lat
              lng
            }
            steps {
              code
              name
              name_fr
              startedAt
              targetTeam
              assignee
              inProgress
              completed
              completedDate
              completionAction
              completionAction_fr
              completedBy
              showMap
              canceled
              canceledDate
              canceledBy
              index
              btnOK
              btnKO
            }

          }
        }

        `});
    }

    assignDriverToOrder(driverId: string, orderId: string): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
      return this.apollo.mutate<any>({
        mutation: gql`
        mutation {
          assignDriverToOrder(driverId: "${driverId}", orderId: "${orderId}")
          {
            _id
            rawPrice
            status
            paymentMethod
            tipsPercentage
            subTotalPrice
            finished
            totalPrice
            collectionMethod
            createdAt
            updatedAt
            currentStep {
              code
              name
              name_fr
              startedAt
              targetTeam
              assignee
              inProgress
              completed
              completedDate
              completionAction
              completionAction_fr
              completedBy
              showMap
              canceled
              canceledDate
              canceledBy
              index
              btnOK
              btnKO
            }
            currentStepIndex
            selectedItems {
              name
              price
              optionsText
              optionsText_fr
              menuItemId
              quantity
              notes
              totalPrice

            }
            deliveryAddress
            deliveryLocationGeo {
              lat
              lng
            }
            steps {
              code
              name
              name_fr
              startedAt
              targetTeam
              assignee
              inProgress
              completed
              completedDate
              completionAction
              completionAction_fr
              completedBy
              showMap
              canceled
              canceledDate
              canceledBy
              index
              btnOK
              btnKO
            }

          }
        }

        `});
    }

    createDriver(userId: string): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
      return this.apollo.mutate<any>({
        mutation: gql`
        mutation {
          createDriver(userId: "${userId}")
          {
            _id
            status
            timeToRestaurant
            locationGeo{
              lat
              lng
            }
            distanceToRestaurant
            user
          }

        }
        `}
        );
        }

        updateDriver(driver: Driver): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
          return this.apollo.mutate<any>({
            mutation: gql`
            mutation {
              updateDriver(driverInput: {
                _id: "${driver._id}"
                locationGeo: {
                  lat: ${driver.locationGeo.lat}
                  lng: ${driver.locationGeo.lng}
                 }
                 locationTime: "${driver.locationTime}"
                 timeToRestaurant: ${driver.timeToRestaurant}
                 distanceToRestaurant: ${driver.distanceToRestaurant}
                 active: ${driver.active}
                }
              )
              {
                status
                  _id
                  user {
                    name
                    _id
                    role
                  }
                  timeToRestaurant
                  distanceToRestaurant
                  locationTime
                  available
                  active
                  locationGeo {
                    lat
                    lng
                  }
            }
            }
            `}
            );
            }
      
        getDriver(userId: string): Observable<ApolloQueryResult<any>> {
          console.log('apollo getDriver ');
            // tslint:disable-next-line: no-unused-expression
          return this.apollo.query<any>({
              query: gql`
              query {
                getDriver(userId: "${userId}"){
                  status
                  _id
                  user {
                    name
                    _id
                    role
                    deliveryAddress
                    collectionMethod
                    deliveryLocationGeo {
                      lat
                      lng
                    }
                  }
                  timeToRestaurant
                  distanceToRestaurant
                  available
                  active
                  locationTime
                  locationGeo {
                    lat
                    lng
                  }
                }
              }

              `});
            }

        getDrivers(filter: string): Observable<ApolloQueryResult<any>> {
          console.log('apollo getDrivers ', filter);
            // tslint:disable-next-line: no-unused-expression
          return this.apollo.query<any>({
              query: gql`
              query {
                getDrivers(filter: "${filter}"){
                  status
                  _id
                  user {
                  name
                    _id
                    role
                    deliveryAddress
                    collectionMethod
                    deliveryLocationGeo {
                      lat
                      lng
                    }
                  }
                  timeToRestaurant
                  distanceToRestaurant
                  locationTime
                  available
                  active
                  active
                  locationGeo {
                    lat
                    lng
                  }
                }
              }

              `});
            }

    cancelOrderStep(orderId: string, index: number): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
      return this.apollo.mutate<any>({
        mutation: gql`
        mutation {
          cancelOrderStep(orderId: "${orderId}",index: ${index})
          {
            _id
            rawPrice
            status
            paymentMethod
            tipsPercentage
            subTotalPrice
            finished
            totalPrice
            collectionMethod
            createdAt
            updatedAt
            currentStep {
              code
              name
              name_fr
              startedAt
              targetTeam
              assignee
              inProgress
              completed
              completedDate
              completionAction
              completionAction_fr
              completedBy
              showMap
              canceled
              canceledDate
              canceledBy
              index
              btnOK
              btnKO
            }
            currentStepIndex
            selectedItems {
              name
              price
              optionsText
              optionsText_fr
              menuItemId
              quantity
              notes
              totalPrice

            }
            deliveryAddress
            deliveryLocationGeo {
              lat
              lng
            }
            steps {
              code
              name
              name_fr
              startedAt
              targetTeam
              assignee
              inProgress
              completed
              completedDate
              completionAction
              completionAction_fr
              completedBy
              showMap
              canceled
              canceledDate
              canceledBy
              index
              btnOK
              btnKO
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

    getUser(email: string): Observable<ApolloQueryResult<any>> {
      console.log('apollo getUser ');
        // tslint:disable-next-line: no-unused-expression
      return this.apollo.query<any>({
          query: gql`
                  query {
                    getUser (
                      email:"${email}"
                    ) {
                      name
                      email
                      _id
                      role
                      deliveryAddress
                      collectionMethod
                      deliveryLocationGeo {
                        lat
                        lng
                      }
                    }
                  },
                `,
        });
    }

    getUsers(): Observable<ApolloQueryResult<any>> {
      console.log('apollo getUsers ');
        // tslint:disable-next-line: no-unused-expression
      return this.apollo.query<any>({
          query: gql`
                  query {
                    getUsers {
                      name
                      email
                      _id
                      role
                      deliveryAddress
                      collectionMethod
                      deliveryLocationGeo {
                        lat
                        lng
                      }
                    }
                  },
                `,
        });
    }

    updateUser(user: User): Observable<FetchResult<any, Record<string, any>, Record<string, any>>> {
      console.log('Graphql updateUser', user);
      return this.apollo.mutate<any>({
        mutation: gql`
        mutation {
          updateUser(userInput: {
            _id: "${user._id}"
            deliveryLocationGeo: {
              lat: ${user.deliveryLocationGeo.lat}
              lng: ${user.deliveryLocationGeo.lng}
             }
             name: "${user.name}"
             email: "${user.email}"
             deliveryAddress: "${user.deliveryAddress}"
             collectionMethod: "${user.collectionMethod}"
            }
          )
          {
            name
            email
            _id
            role
            deliveryAddress
            collectionMethod
            deliveryLocationGeo {
              lat
              lng
            }
          }
        }
        `}
        );
        }


    login(email: string, password: string): Observable<ApolloQueryResult<any>> {
        console.log('apollo login: ');
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
