import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TwitterService } from '../../core/services/twitter.service';

@Component({
  selector: 'app-twitter-widget',
  templateUrl: './twitter-widget.component.html',
  styleUrls: ['./twitter-widget.component.scss'],
})
export class TwitterWidgetComponent implements OnInit {
  @Input() public id: string;
  public tweet: object;

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
          this.tweet = tweet;
          this.isTwitterScriptLoading = false;
        },
        () => {
          this.isTwitterScriptLoading = false;
        },
      );

      /* The Twitter-widget does not resolve the promise if 
      the Tweet is deleted, so need to check it with a timeout */
      setTimeout(() => {
        this.isTwitterScriptLoading = false;
        if (!this.tweet) {
          this.isTwitterFailed = true;
          this.loadingFailed.emit('Tweet failed to load');
        }
      }, 30000);
    });
  }

  private _updateTwitterScriptLoadingState(): void {
    this._changeDetectorRef.detectChanges();
  }
}
