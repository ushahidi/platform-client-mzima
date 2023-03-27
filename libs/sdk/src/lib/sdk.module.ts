import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SdkConfig } from './config';
import { EnvFakeLoader, EnvLoader } from './loader';

@NgModule({
  imports: [CommonModule],
})
export class SdkModule {
  static forRoot(config: SdkConfig = {}): ModuleWithProviders<SdkModule> {
    return {
      ngModule: SdkModule,
      providers: [config.loader || { provide: EnvLoader, useClass: EnvFakeLoader }],
    };
  }
}
