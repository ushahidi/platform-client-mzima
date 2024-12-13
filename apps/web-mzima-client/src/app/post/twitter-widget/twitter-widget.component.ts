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
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-twitter-widget',
  templateUrl: './twitter-widget.component.html',
  styleUrls: ['./twitter-widget.component.scss'],
})
export class TwitterWidgetComponent implements OnInit, OnChanges {
  @Input() public id: string;
  public tweet: object;

  @Output() loadingFailed = new EventEmitter();
  isTwitterScriptLoading = true;
  isTwitterFailed = false;

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly twitterService: TwitterService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    /* ------------------------------------------------------------------------------------
      For onInit: Ensure to only create/load tweet embeds if there are no tweet embeds yet
    ------------------------------------------------------------------------------------*/
    const twitterTweetEmbeds = Array.from(document.querySelectorAll('.twitter-tweet'));
    const postDetailsTweetEmbed = twitterTweetEmbeds.length - 1;
    if (!twitterTweetEmbeds.length && postDetailsTweetEmbed === -1) this._loadTwitterScript();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      /* --------------------------------------------------------------------------
        Tweet embeds: Left-side preview cards tweet embeds are initially created,
        the tweet embed for the postDetails on the right is the last to be created.
        ---------------------------------------------------------------------------
        Anytime route to ID MODE happens (i.e. anytime app detects change in the id
        of a unique post), remove existing tweet embed for postDetails on the right
        of data view and recreate the tweet embed.
      ---------------------------------------------------------------------------*/
      const twitterTweetEmbeds = Array.from(document.querySelectorAll('.twitter-tweet'));
      const postDetailsTweetEmbed = twitterTweetEmbeds.length - 1;
      twitterTweetEmbeds.map((tweet, index) => {
        if (index === postDetailsTweetEmbed) {
          tweet.remove();
          this._loadTwitterScript();
        }
      });
    }
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
          this.loadingFailed.emit(this.translate.instant('app.tweet_failed_to_load'));
        }
      }, 30000);
    });
  }

  private _updateTwitterScriptLoadingState(): void {
    this._changeDetectorRef.detectChanges();
  }
}
