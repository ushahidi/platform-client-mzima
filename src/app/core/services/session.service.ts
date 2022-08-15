import { Injectable } from '@angular/core';

export interface SessionData {
  userId: string | null;
  realname: string | null;
  email: string | null;
  accessToken: string | null;
  accessTokenExpires: string | null;
  grantType: string | null;
  role: string | null;
  permissions: string | null;
  gravatar: string | null;
  language: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionData: SessionData = {
    userId: null,
    realname: null,
    email: null,
    accessToken: null,
    accessTokenExpires: null,
    grantType: null,
    role: null,
    permissions: null,
    gravatar: null,
    language: null,
  };

  constructor() {
    this.loadSessionData();
  }

  loadSessionData() {
    var newSessionData: any = {};
    Object.keys(this.sessionData).forEach((key) => {
      newSessionData[key] = localStorage.getItem(key);
    });
    this.sessionData = newSessionData;
  }

  setSessionDataEntries(entries: any) {
    Object.keys(entries).forEach((key) => {
      localStorage.setItem(key, entries[key]);
    });
    var newSessionData = Object.assign({}, this.sessionData, entries);
    this.sessionData = newSessionData;
  }

  setSessionDataEntry(key: keyof SessionData, value: any) {
    this.sessionData[key] = value;
    localStorage.setItem(key, value);
  }

  getSessionDataEntry(key: keyof SessionData) {
    return this.sessionData[key];
  }

  getSessionData() {
    return this.sessionData;
  }

  clearSessionData() {
    Object.keys(this.sessionData).forEach((key) => {
      localStorage.removeItem(key);
    });
    this.sessionData = {
      userId: null,
      realname: null,
      email: null,
      accessToken: null,
      accessTokenExpires: null,
      grantType: null,
      role: null,
      permissions: null,
      gravatar: null,
      language: null,
    };
  }
}
