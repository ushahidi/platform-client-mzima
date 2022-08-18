import { Injectable } from '@angular/core';
import {
  FeaturesConfigInterface,
  SessionConfigInterface,
  SessionTokenInterface,
  SiteConfigInterface,
  UserInterface,
} from '@models';
import { BehaviorSubject } from 'rxjs';
import { CONST } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly _currentSessionData$ = new BehaviorSubject<SessionTokenInterface>({
    accessToken: '',
    accessTokenExpires: 0,
    grantType: '',
  });

  private readonly _currentUserData$ = new BehaviorSubject<UserInterface>({});
  private readonly _isLogged = new BehaviorSubject<boolean>(false);

  readonly currentSessionData$ = this._currentSessionData$.asObservable();
  readonly currentUserData$ = this._currentUserData$.asObservable();
  readonly isLogged$ = this._isLogged.asObservable();

  private currentSessionData: SessionTokenInterface = {
    accessToken: '',
    accessTokenExpires: 0,
    grantType: '',
  };

  private currentUser: UserInterface = {
    userId: '',
    realname: '',
    email: '',
    role: '',
    permissions: '',
    gravatar: '',
    language: '',
  };

  private currentConfig: SessionConfigInterface = {
    features: {},
    site: {},
  };

  constructor() {
    this.loadSessionDataFromLocalStorage();
    this.loadUserDataFromLocalStorage();
    this._isLogged.next(!!this.currentUser.userId);
  }

  localStorageNameMapper(key: string) {
    return `${CONST.LOCAL_STORAGE_PREFIX}${key}`;
  }

  getConfigurations(type: keyof SessionConfigInterface) {
    return this.currentConfig[type];
  }

  setConfigurations(
    type: keyof SessionConfigInterface,
    data: FeaturesConfigInterface | SiteConfigInterface,
  ) {
    this.currentConfig[type] = data;
  }

  loadSessionDataFromLocalStorage() {
    const expires = localStorage.getItem(this.localStorageNameMapper('accessTokenExpires')) ?? 0;

    this.currentSessionData.accessToken =
      localStorage.getItem(this.localStorageNameMapper('accessToken')) || '';
    this.currentSessionData.accessTokenExpires = +expires;
    this.currentSessionData.grantType =
      localStorage.getItem(this.localStorageNameMapper('grantType')) || '';

    this._currentSessionData$.next(this.currentSessionData);
  }

  get currentAuthToken() {
    return this.currentSessionData.accessToken;
  }

  loadUserDataFromLocalStorage() {
    Object.entries(this.currentUser).map(([key]) => {
      this.currentUser[key as keyof UserInterface] =
        localStorage.getItem(this.localStorageNameMapper(key)) ?? '';
    });
    this._currentUserData$.next(this.currentUser);
  }

  setCurrentUser(user: Partial<UserInterface>) {
    Object.entries(user).map(([key]) => {
      localStorage.setItem(
        this.localStorageNameMapper(key),
        user[key as keyof UserInterface] as string,
      );
    });
    this.currentUser = Object.assign({}, this.currentUser, user);
    this._currentUserData$.next(this.currentUser);
  }

  setSessionData(session: SessionTokenInterface) {
    Object.entries(session).map(([key]) => {
      localStorage.setItem(
        this.localStorageNameMapper(key),
        session[key as keyof SessionTokenInterface] as string,
      );
    });
    this.currentSessionData = session;
    this._currentSessionData$.next(this.currentSessionData);
  }

  clearSessionData() {
    Object.keys(this.currentSessionData).forEach((key) => {
      localStorage.removeItem(this.localStorageNameMapper(key));
    });
    this.currentSessionData = {
      accessToken: '',
      accessTokenExpires: 0,
      grantType: '',
    };
    this._currentSessionData$.next(this.currentSessionData);
  }

  clearUserData() {
    Object.keys(this.currentUser).forEach((key) => {
      localStorage.removeItem(this.localStorageNameMapper(key));
    });
    this.currentUser = {};
    this._currentUserData$.next(this.currentUser);
  }
}
