import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lottie-animation',
  templateUrl: './lottie-animation.component.html',
  styleUrls: ['./lottie-animation.component.scss'],
})
export class LottieAnimationComponent {
  @Input() path: string;
}
