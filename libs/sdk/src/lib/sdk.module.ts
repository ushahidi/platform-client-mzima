import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkConfig, API_CONFIG_TOKEN } from './config';

@NgModule({
  imports: [CommonModule],
})
export class SdkModule {
  static forRoot(config: SdkConfig): ModuleWithProviders<SdkModule> {
    return {
      ngModule: SdkModule,
      providers: [{ provide: API_CONFIG_TOKEN, useValue: config }],
    };
  }
}
