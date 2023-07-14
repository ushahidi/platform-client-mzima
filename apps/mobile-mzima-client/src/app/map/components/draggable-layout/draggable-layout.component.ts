import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable, fromEvent } from 'rxjs';

@Component({
  selector: 'app-draggable-layout',
  templateUrl: './draggable-layout.component.html',
  styleUrls: ['./draggable-layout.component.scss'],
})
export class DraggableLayoutComponent implements AfterViewInit {
  @ViewChild('content') content: IonContent;
  @ViewChild('fixedContent') fixedContent: ElementRef;
  @Input() public breakpoints: number[] = [];
  @Input() public offsetTop = 0;
  @Input() public draggableBackground = '';
  @Input() public draggable = false;
  @Input() public mode: number | 'fullscreen' = 0;
  @Output() public toggleMode = new EventEmitter<number | 'fullscreen'>();

  private isDraggableTouched = false;
  private breakpoint = 0;
  private isOnMove = false;
  private isOnAutoScroll = false;
  private safeArea = {
    top: parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-top'),
    ),
    bottom: parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-bottom'),
    ),
  };
  private scrollTop = 0;
  private isDirectionTop = true;
  public isFullscreenView = false;
  private resizeObservable$: Observable<Event>;
  public fixedContentHeight: number;

  constructor() {
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeObservable$.subscribe(() => {
      this.getOffsetHeight();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.mode) {
        this.content.scrollToPoint(
          0,
          this.mode === 'fullscreen' ? window.innerHeight : this.breakpoints[this.mode],
          350,
        );
      }
    }, 350);
  }

  public updateOffsetHeight(): void {
    const checkHeight = setInterval(() => {
      this.getOffsetHeight();
      if (this.fixedContentHeight) clearInterval(checkHeight);
    }, 50);
  }

  private getOffsetHeight(): void {
    this.fixedContentHeight = this.fixedContent.nativeElement.offsetHeight;
  }

  public onContentScroll(event: any) {
    this.isDirectionTop = this.scrollTop < event.detail.scrollTop + this.offsetTop;
    this.scrollTop = event.detail.scrollTop + this.offsetTop;
    this.breakpoint = this.getClosestBreakpoint(this.scrollTop);
    this.updateMode();
    this.checkIsFullscreen();
  }

  private updateMode(): void {
    this.mode =
      this.breakpoints.indexOf(this.breakpoint) > -1
        ? this.breakpoints.indexOf(this.breakpoint)
        : this.breakpoints.length;
    this.toggleMode.emit(this.scrollTop + 1 > window.innerHeight ? 'fullscreen' : this.mode);
  }

  public onContentScrollEnd() {
    this.isOnMove = false;
    if (!this.isDraggableTouched && !this.isOnAutoScroll) {
      this.alignDraggableContent();
    }
  }

  public onContentScrollStart() {
    this.isOnMove = true;
  }

  public async alignDraggableContent() {
    const isInViewport = this.scrollTop > this.offsetTop && this.scrollTop < window.innerHeight;
    if (
      (!this.isDirectionTop && this.scrollTop < window.innerHeight) ||
      (this.isDirectionTop && isInViewport)
    ) {
      this.isOnAutoScroll = true;
      await this.content.scrollToPoint(0, this.breakpoint, 350);
      setTimeout(() => {
        this.isOnAutoScroll = false;
      }, 200);
    }

    this.checkIsFullscreen();
  }

  private getClosestBreakpoint(x: number): number {
    if (x - window.innerHeight / 5 > this.breakpoints[this.breakpoints.length - 1]) {
      return window.innerHeight - this.offsetTop;
    }
    let left = 0;
    let right = this.breakpoints.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (this.breakpoints[mid] === x) {
        return this.breakpoints[mid];
      } else if (this.breakpoints[mid] < x) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (right < 0) {
      return this.breakpoints[left];
    } else if (left >= this.breakpoints.length) {
      return this.breakpoints[right];
    } else {
      const leftDifference = x - this.breakpoints[right];
      const rightDifference = this.breakpoints[left] - x;
      return leftDifference <= rightDifference ? this.breakpoints[right] : this.breakpoints[left];
    }
  }

  private checkIsFullscreen() {
    this.isFullscreenView = this.scrollTop + 2 + this.safeArea.top >= window.innerHeight;
  }

  public onContentTouchEnd() {
    this.isDraggableTouched = false;
    if (!this.isOnMove) {
      this.alignDraggableContent();
    }
  }

  public onContentTouchStart() {
    this.isDraggableTouched = true;
  }
}
