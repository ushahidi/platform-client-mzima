import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, FactoryProvider, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ApiUrlLoader, EnvLoader, SdkModule } from '@mzima-client/sdk';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigService } from './core/services/config.service';
import { EnvService } from './core/services/env.service';

function loadConfigFactory(envService: EnvService, configService: ConfigService) {
  return () =>
    envService.initEnv().then(() => {
      return configService.initAllConfigurations();
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
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    SdkModule.forRoot({
      loader: {
        provide: EnvLoader,
        useFactory: EnvLoaderFactory,
        deps: [EnvService],
      },
    }),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, loadConfigProvider],
  bootstrap: [AppComponent],
})
export class AppModule {}
