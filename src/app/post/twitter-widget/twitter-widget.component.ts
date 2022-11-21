import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TwitterService } from '@services';

@Component({
  selector: 'app-twitter-widget',
  templateUrl: './twitter-widget.component.html',
  styleUrls: ['./twitter-widget.component.scss'],
})
export class TwitterWidgetComponent implements OnInit {
  @Input() public id: string;
  @Output() loadingFailed = new EventEmitter();
  isTwitterScriptLoading = true;
  isTwitterFailed = false;

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly twitterService: TwitterService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    this._loadTwitterScript();
  }

  private _loadTwitterScript(): void {
    this.twitterService.loadScript().subscribe((twitterData: any) => {
      this._updateTwitterScriptLoadingState();
      twitterData.widgets.createTweet(this.id, this._elementRef.nativeElement, {}).then(
        (tweet: any) => {
          this.isTwitterScriptLoading = false;
          if (!tweet) {
            this.isTwitterFailed = true;
            this.loadingFailed.emit('Tweet failed to load');
          }
          this._changeDetectorRef.detectChanges();
        },
        () => {
          this.isTwitterScriptLoading = false;
        },
      );
    });
  }

  private _updateTwitterScriptLoadingState(): void {
    this._changeDetectorRef.detectChanges();
  }
}
