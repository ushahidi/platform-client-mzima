import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, FactoryProvider, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorsHandler } from './core/handlers/errors-handler';
import { HttpsInterceptor } from './core/interceptors/https-interceptor';
import { SharedModule } from './shared';
import { AuthModule } from './auth/auth.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ConfigService } from './core/services/config.service';
import { catchError, of } from 'rxjs';

function loadConfigFactory(configService: ConfigService) {
  return () =>
    configService.initAllConfigurations().pipe(
      catchError((err) => {
        console.log('Handle 401 in error handler, ', err);
        return of({});
      }),
    );
}

export const loadConfigProvider: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadConfigFactory,
  deps: [ConfigService],
  multi: true,
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AuthModule,
    HttpClientModule,
    SharedModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    loadConfigProvider,
    { provide: ErrorHandler, useClass: ErrorsHandler },
    { provide: HTTP_INTERCEPTORS, useClass: HttpsInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
