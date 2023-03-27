import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, FactoryProvider, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule, Meta } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ConfigService, EnvService } from '@services';
import { SharedModule, SpinnerModule } from '@shared';
import { CookieService } from 'ngx-cookie-service';
import { LottieModule } from 'ngx-lottie';
import { QuillModule } from 'ngx-quill';
import { ApiUrlLoader, EnvLoader, SdkModule } from '@mzima-client/sdk';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { ErrorsHandlerService } from './core/handlers/errors-handler.service';
import { AuthInterceptor } from './core/interceptors';

import { RouterModule } from '@angular/router';
import * as Sentry from '@sentry/angular-ivy';
import { BrowserTracing } from '@sentry/angular-ivy';

declare let window: any;
window.getEnvService = function getEnvService() {
  const newEnvService = new EnvService();
  return newEnvService.initEnv();
};

async function sentryInit() {
  const env = await window.getEnvService();
  Sentry.init({
    dsn: env.sentry_dsn,
    debug: env.sentry_debug_mode,
    integrations: [
      new BrowserTracing({
        tracePropagationTargets: [],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

sentryInit();

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

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/locales/', '.json');
}

export function EnvLoaderFactory(env: EnvService): any {
  return new ApiUrlLoader(env);
}

export function googleTagManagerFactory(config: EnvService) {
  return config.environment.gtm_key;
}

export const loadGoogleTagManagerProvider: FactoryProvider = {
  provide: 'googleTagManagerId',
  useFactory: googleTagManagerFactory,
  deps: [EnvService],
};

export function playerFactory(): any {
  return import('lottie-web');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LeafletModule,
    LeafletMarkerClusterModule,
    AuthModule,
    SharedModule,
    HttpClientModule,
    SdkModule.forRoot({
      loader: {
        provide: EnvLoader,
        useFactory: EnvLoaderFactory,
        deps: [EnvService],
      },
    }),
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['link'],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    FormsModule,
    LottieModule.forRoot({ player: playerFactory }),
    MatSidenavModule,
    SpinnerModule,
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [RouterModule],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    loadConfigProvider,
    { provide: ErrorHandler, useClass: ErrorsHandlerService },
    loadGoogleTagManagerProvider,
    Meta,
    CookieService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
