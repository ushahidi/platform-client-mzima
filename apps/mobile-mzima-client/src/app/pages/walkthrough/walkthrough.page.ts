import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonicSlides } from '@ionic/angular';
import { WalkthroughSlider } from '../../core/constants';
import { StorageService } from '../../core/services/storage.service';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.page.html',
  styleUrls: ['./walkthrough.page.scss'],
})
export class WalkthroughPage {
  @ViewChild('swiperContainer') swiperEl: any;
  swiperModules = [IonicSlides];
  public currentIndex = 0;
  public sliderData = WalkthroughSlider;
  public swiperParams = {
    touchReleaseOnEdges: true,
    pagination: {
      clickable: true,
      dynamicBullets: true,
    },
  };

  constructor(private storageService: StorageService, private router: Router) {
    // Object.assign(this.swiperEl, this.swiperParams);
    // this.swiperEl.initialize();
  }

  public slidePrev() {
    this.currentIndex--;
    // this.slidesEl.slidePrev();
    this.swiperEl.swiper.slidePrev();
  }

  public slideNext() {
    this.currentIndex++;
    this.swiperEl.swiper.slideNext();
    // this.slidesEl.slideNext();
  }

  async slideChanged() {
    this.currentIndex = await this.swiperEl?.nativeElement.swiper.activeIndex;
    console.log(this.currentIndex);
  }

  public finish() {
    this.storageService.setStorage('isIntroDone', 'yes');
    this.router.navigate(['/']);
  }

  skip() {}
}
