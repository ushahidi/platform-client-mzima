import { Injectable } from '@angular/core';

import { generalHelpers, UserInterface } from '@mzima-client/sdk';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  DonationConfigInterface,
  FeaturesConfigInterface,
  MapConfigInterface,
  SessionConfigInterface,
  SessionTokenInterface,
  SiteConfigInterface,
} from '@models';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly _currentSessionData$ = new BehaviorSubject<SessionTokenInterface>({
    accessToken: '',
    accessTokenExpires: 0,
    grantType: '',
    tokenType: '',
  });

  private readonly _currentUserData$ = new BehaviorSubject<UserInterface>({});
  private readonly _isLogged = new BehaviorSubject<boolean>(false);
  private readonly _isFiltersVisible = new BehaviorSubject<boolean>(false);
  private readonly _isMainFiltersHidden = new BehaviorSubject<boolean>(false);
  private readonly _deploymentInfo = new BehaviorSubject<any>(false);
  private readonly _mapConfig = new BehaviorSubject<any>(false);

  readonly currentUserData$: Observable<UserInterface> = this._currentUserData$.asObservable();
  readonly isFiltersVisible$ = this._isFiltersVisible.asObservable();
  readonly isMainFiltersHidden$ = this._isMainFiltersHidden.asObservable();
  readonly deploymentInfo$ = this._deploymentInfo.asObservable();
  readonly mapConfig$ = this._mapConfig.asObservable();

  private currentSessionData: SessionTokenInterface = {
    accessToken: '',
    accessTokenExpires: 0,
    grantType: '',
    tokenType: '',
  };

  private currentUser: UserInterface = {
    userId: '',
    realname: '',
    email: '',
    role: '',
    permissions: [],
    gravatar: '',
    language: '',
    allowed_privileges: [],
  };

  private currentConfig: SessionConfigInterface = {
    features: {},
    site: {},
    map: {},
  };

  public siteConfig = new Subject<any>();
  readonly siteConfig$ = this.siteConfig.asObservable();

  constructor() {
    this.loadSessionDataFromLocalStorage();
    this.loadUserDataFromLocalStorage();
    this._isLogged.next(!!this.currentUser.userId);
  }

  isLogged(): boolean {
    return this._isLogged.value;
  }

  getCurrentUserData() {
    return this._currentUserData$.asObservable();
  }

  getLocalStorageNameMapper(key: string) {
    return `${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}${key}`;
  }

  getSiteConfigurations() {
    return this.currentConfig.site;
  }

  setSiteDonationConfigurations(donation: DonationConfigInterface) {
    this.currentConfig.site.donation = donation;
  }

  getFeatureConfigurations() {
    return this.currentConfig.features;
  }

  getMapConfigurations() {
    return this.currentConfig.map;
  }

  setConfigurations(
    type: keyof SessionConfigInterface,
    data: FeaturesConfigInterface | SiteConfigInterface | MapConfigInterface,
  ) {
    this.currentConfig[type] = data as any;
    this._deploymentInfo.next({
      title: this.currentConfig['site']?.name ?? '',
      description: this.currentConfig['site']?.description ?? '',
      logo: this.currentConfig['site']?.image_header ?? '',
    });
    if (type === 'map') {
      this._mapConfig.next(this.currentConfig[type]);
    }
    if (type === 'site') {
      console.log(this.currentConfig);
      this.siteConfig.next(this.currentConfig[type]);
    }
  }

  loadSessionDataFromLocalStorage() {
    const expires = localStorage.getItem(this.getLocalStorageNameMapper('accessTokenExpires')) ?? 0;

    this.currentSessionData.accessToken =
      localStorage.getItem(this.getLocalStorageNameMapper('accessToken')) || '';
    this.currentSessionData.accessTokenExpires = +expires;
    this.currentSessionData.grantType =
      localStorage.getItem(this.getLocalStorageNameMapper('grantType')) || '';
    this.currentSessionData.tokenType =
      localStorage.getItem(this.getLocalStorageNameMapper('tokenType')) || '';

    const isFiltersVisible = localStorage.getItem(
      this.getLocalStorageNameMapper('isFiltersVisible'),
    );
    this._isFiltersVisible.next(isFiltersVisible ? JSON.parse(isFiltersVisible) : false);

    const isMainFiltersHidden = localStorage.getItem(
      this.getLocalStorageNameMapper('main_filters_closed'),
    );
    this._isMainFiltersHidden.next(isMainFiltersHidden ? JSON.parse(isMainFiltersHidden) : false);

    this._currentSessionData$.next(this.currentSessionData);
  }

  get currentAuthToken() {
    return this.currentSessionData.accessToken;
  }

  get currentAuthTokenType() {
    return this.currentSessionData.tokenType;
  }

  loadUserDataFromLocalStorage() {
    Object.entries(this.currentUser).map(([key]) => {
      this.currentUser[key as keyof UserInterface] =
        localStorage.getItem(this.getLocalStorageNameMapper(key)) ?? '';
    });
    this._currentUserData$.next(this.currentUser);
  }

  setCurrentUser(user: Partial<UserInterface>) {
    Object.entries(user).map(([key]) => {
      localStorage.setItem(
        this.getLocalStorageNameMapper(key),
        user[key as keyof UserInterface] as string,
      );
    });
    this.currentUser = Object.assign({}, this.currentUser, user);
    this._currentUserData$.next(this.currentUser);
    this._isLogged.next(!!this.currentUser.userId);
  }

  setSessionData(session: SessionTokenInterface) {
    Object.entries(session).map(([key]) => {
      localStorage.setItem(
        this.getLocalStorageNameMapper(key),
        session[key as keyof SessionTokenInterface] as string,
      );
    });
    this.currentSessionData = session;
    this._currentSessionData$.next(this.currentSessionData);
  }

  clearSessionData() {
    Object.keys(this.currentSessionData).forEach((key) => {
      localStorage.removeItem(this.getLocalStorageNameMapper(key));
    });
    this.currentSessionData = {
      accessToken: '',
      accessTokenExpires: 0,
      grantType: '',
      tokenType: '',
    };
    this._currentSessionData$.next(this.currentSessionData);
  }

  clearUserData() {
    const cookies = sessionStorage.getItem(this.getLocalStorageNameMapper('cookies'));
    const filters = sessionStorage.getItem(this.getLocalStorageNameMapper('filters'));
    Object.keys(this.currentUser).forEach((key) => {
      localStorage.removeItem(this.getLocalStorageNameMapper(key));
    });
    localStorage.removeItem(this.getLocalStorageNameMapper('activeSavedSearch'));
    this.currentUser = {};
    if (cookies) sessionStorage.setItem(this.getLocalStorageNameMapper('cookies'), cookies);
    if (filters) sessionStorage.setItem(this.getLocalStorageNameMapper('filters'), filters);
    this._currentUserData$.next(this.currentUser);
    this._isLogged.next(!!this.currentUser.userId);
  }

  isFeatureEnabled(feature: keyof FeaturesConfigInterface) {
    return this.currentConfig.features[feature];
  }

  toggleFiltersVisibility(newValue: boolean) {
    localStorage.setItem(this.getLocalStorageNameMapper('isFiltersVisible'), newValue as any);
    this._isFiltersVisible.next(newValue);
  }

  toggleMainFiltersVisibility(newValue: boolean) {
    localStorage.setItem(this.getLocalStorageNameMapper('main_filters_closed'), newValue as any);
    this._isMainFiltersHidden.next(newValue);
  }
}
