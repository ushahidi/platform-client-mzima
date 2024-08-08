import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TwitterService } from '../../core/services/twitter.service';

@Component({
  selector: 'app-twitter-widget',
  templateUrl: './twitter-widget.component.html',
  styleUrls: ['./twitter-widget.component.scss'],
})
export class TwitterWidgetComponent implements OnInit, OnChanges {
  @Input() public id: string;
  public postDetailsId = '';
  public tweet: object;

  @Output() loadingFailed = new EventEmitter();
  @Output() twitter_postDetailsId = new EventEmitter<string>();

  isTwitterScriptLoading = true;
  isTwitterFailed = false;

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly twitterService: TwitterService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {
    // console.log('constuctor: ', this.id);
    // this._loadTwitterScript();
    // this.isTwitterScriptLoading = true;
    // this._updateTwitterScriptLoadingState();
    // this.isTwitterScriptLoading = true;
  }

  public ngOnInit(): void {
    console.log('Husky pre-commit hook - Let my people go...');
    // this._loadTwitterScript();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('testing...');
    if (changes['id']) {
      console.log('onChanges: ', this.id);
      // document.querySelectorAll('.twitter-tweet').forEach((prevTweet) => {
      //   prevTweet.remove();
      // });
      this._loadTwitterScript();
      // document.querySelectorAll('.twitter-tweet').forEach((twi) => {
      //   prevTweet.remove();
      // });
    }
  }

  private _loadTwitterScript(): void {
    this.twitterService.loadScript().subscribe((twitterData: any) => {
      this._updateTwitterScriptLoadingState();
      twitterData.widgets.createTweet(this.id, this._elementRef.nativeElement, {}).then(
        (tweet: any) => {
          this.tweet = tweet;
          console.log(this.tweet);
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
