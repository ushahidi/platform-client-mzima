import { Injectable } from '@angular/core';
import { GtmTrackInterface } from '@models';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { EnumGtmGroup } from '@enums';

@Injectable({
  providedIn: 'root',
})
export class GtmTrackingService {
  constructor(private gtmService: GoogleTagManagerService) {}

  public registerEvent(track: GtmTrackInterface, extra?: any): void {
    let data = {
      event: track.event,
      ush_track: { source: track.source, ...extra },
    };
    this.gtmService.pushTag(data);
  }

  public static MapPath(path: string): any {
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
