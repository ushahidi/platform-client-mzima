import { Injectable } from '@angular/core';
import { GtmTrackInterface } from '@models';
import { EnumGtmGroup } from '@enums';

declare let dataLayer: any[];

@Injectable({
  providedIn: 'root',
})
export class GtmTrackingService {
  private push(data: any) {
    // @ts-ignore
    if (window && window['dataLayer']) {
      dataLayer.push(data);
    }
  }

  public registerEvent(track: GtmTrackInterface, extra?: any): void {
    const data = {
      event: track.event,
      ush_track: { source: track.source, ...extra },
    };
    this.push(data);
  }

  public static MapPath(path: string) {
    return { page_location: path };
  }

  public static MapGroup(group: EnumGtmGroup, label?: string) {
    return {
      group,
      label,
    };
  }

  public static MapUser(user: any) {
    return {
      user: user.name,
      email: user.email,
    };
  }

  public static MapProfile(profile: any) {
    return {
      language: profile.language,
      country: profile.country,
    };
  }
}
