import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TwitterService {
  private readonly TWITTER_OBJECT = 'twttr';
  private readonly TWITTER_SCRIPT_ID = 'twitter-wjs';
  private readonly TWITTER_WIDGET_URL = 'https://platform.twitter.com/widgets.js';

  constructor(@Inject(DOCUMENT) private readonly _document: any) {}

  public loadScript(): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      this._startScriptLoad();
      this._document.defaultView[this.TWITTER_OBJECT].ready(
        this._onTwitterScriptLoadedFactory(observer),
      );
    });
  }

  private _startScriptLoad(): void {
    const twitterData = this._document.defaultView[this.TWITTER_OBJECT] || {};

    if (this._twitterScriptAlreadyExists()) {
      this._document.defaultView[this.TWITTER_OBJECT] = twitterData;
      return;
    }

    this._appendTwitterScriptToDOM();

    twitterData._e = [];

    twitterData.ready = (callback: () => void) => {
      twitterData._e.push(callback);
    };

    this._document.defaultView[this.TWITTER_OBJECT] = twitterData;
  }

  private _twitterScriptAlreadyExists(): boolean {
    const twitterScript = this._document.getElementById(this.TWITTER_SCRIPT_ID);
    return twitterScript !== null || typeof twitterScript !== 'object';
  }

  private _appendTwitterScriptToDOM(): void {
    const firstJSScript = this._document.getElementsByTagName('script')[0];
    const js = this._document.createElement('script');
    js.id = this.TWITTER_SCRIPT_ID;
    js.src = this.TWITTER_WIDGET_URL;
    firstJSScript.parentNode.insertBefore(js, firstJSScript);
  }

  private _onTwitterScriptLoadedFactory(observer: Observer<any>): (twitterData: any) => void {
    return (twitterData: any) => {
      observer.next(twitterData);
      observer.complete();
    };
  }
}
