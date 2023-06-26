import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, FactoryProvider, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { AuthInterceptor } from '@interceptors';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { ApiUrlLoader, EnvLoader, SdkModule } from '@mzima-client/sdk';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigService } from './core/services/config.service';
import { EnvService } from '@services';

function loadConfigFactory(envService: EnvService, configService: ConfigService) {
  return () =>
    envService.initEnv().then((item: any) => {
      return item.backend_url ? configService.initAllConfigurations() : null;
    });
}

export const loadConfigProvider: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadConfigFactory,
  deps: [EnvService, ConfigService],
  multi: true,
};

export function EnvLoaderFactory(env: EnvService): any {
  return new ApiUrlLoader(env);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md',
      innerHTMLTemplatesEnabled: true,
    }),
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    SdkModule.forRoot({
      loader: {
        provide: EnvLoader,
        useFactory: EnvLoaderFactory,
        deps: [EnvService],
      },
    }),
    IonicStorageModule.forRoot({
      name: '__ushdb',
      driverOrder: [Drivers.IndexedDB],
    }),
    LeafletModule,
    LeafletMarkerClusterModule,
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    loadConfigProvider,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
