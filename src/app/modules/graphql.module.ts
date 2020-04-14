import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { environment } from '../../environments/environment';
//import { createUploadLink } from 'apollo-upload-client';
//import { createLink } from "apollo-absinthe-upload-link";

//const uri = 'http://localhost:3000/graphql'; // <-- add the URL of the GraphQL server here
const uri = environment.serverUrl;

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  // we assume `headers` as a defined instance of HttpHeaders
  // console.log('yoooooo authMiddleware');
  operation.setContext(({ headers }) => ({
    headers: {
      Accept: 'charset=utf-8',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }));

  return forward(operation);
});

//After the backend responds, we take the refreshToken from headers if it exists, and save it in the cookie.
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;

    if (headers) {
      const refreshToken = headers.get('refreshToken');
      if (refreshToken) {
        localStorage.setItem('token', refreshToken);
      }
    }

    return response;
  });
});

export function provideApollo(httpLink: HttpLink) {
  //console.log('miidleware provideApollo');
  const ErrorCapturelink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
      );
    }

    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  });


  const link = ApolloLink.from([
    authMiddleware,
    ErrorCapturelink,
    httpLink.create({ uri })
  ]);
  const cache = new InMemoryCache();

  return {
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  };
}

// export function createApollo(httpLink: HttpLink) {
//   return {
//     link: httpLink.create({uri}),
//     cache: new InMemoryCache(),
//     defaultOptions: {
//       watchQuery: {
//           fetchPolicy: 'network-only',
//           errorPolicy: 'all',
//       },
//       query: {
//           fetchPolicy: 'network-only',
//           errorPolicy: 'all',
//       },
//       mutate: {
//           fetchPolicy: 'network-only',
//           errorPolicy: 'all'
//       }
//   }
//   };
// }

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: provideApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
