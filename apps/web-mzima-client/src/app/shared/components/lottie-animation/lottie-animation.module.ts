import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent } from 'ngx-lottie';
import { LottieAnimationComponent } from './lottie-animation.component';

@NgModule({
  declarations: [LottieAnimationComponent],
  imports: [CommonModule, LottieComponent],
  exports: [LottieAnimationComponent],
})
export class LottieAnimationModule {}
