import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonicSlides } from '@ionic/angular';
import { WalkthroughSlider } from '@constants';
import { StorageService } from '@services';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.page.html',
  styleUrls: ['./walkthrough.page.scss'],
})
export class WalkthroughPage {
  @ViewChild('swiperContainer') swiperEl: any;
  public swiperModules = [IonicSlides];
  public sliderData = WalkthroughSlider;
  public isLastSlide = false;

  constructor(private storageService: StorageService, private router: Router) {}

  public slideNext() {
    this.swiperEl?.nativeElement.swiper.slideNext();
  }

  async slideChanged() {
    this.isLastSlide = this.swiperEl?.nativeElement.swiper.isEnd;
  }

  public finish() {
    this.storageService.setStorage('isIntroDone', 'yes');
    this.storageService.getStorage('deployment')
      ? this.router.navigate(['/'])
      : this.router.navigate(['/deployment']);
  }
}
