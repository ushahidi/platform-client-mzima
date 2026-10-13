import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigService } from './core/services/config.service';
import { EnvService } from '@services';
import { SharedModule } from '@shared';

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

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/locales/', '.json');
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
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      useDefaultLang: true,
    }),
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
