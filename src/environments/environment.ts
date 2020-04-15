// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  serverUrl: 'http://localhost:3000/graphql',
  FACEBOOK_APP_ID: '152934169474801',
  serverDomain: 'http://localhost:3000',
  mapbox: {
    accessToken: 'pk.eyJ1IjoiZmxldGVuZHJlIiwiYSI6ImNrMm1yazc5YTBreW8zYm05YW1rajhyNmUifQ.cjgG6XNX--iACz0-5sp1Jg'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
