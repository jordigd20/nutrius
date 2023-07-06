// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export interface environment {
  production: boolean;
  base_url: string;
  ruta_motor_assets: string;
  registrosPorPagina: number;
  client_id: string;
  PAYPAL_CLIENT_ID: string;
  PLAN_1MES_ID: string;
  PLAN_3MESES_ID: string;
  PLAN_6MESES_ID: string;
  PLAN_1AÑO_ID: string;
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
