import { Injectable } from '@angular/core';
import { SiteConfigInterface, GtmTrackInterface } from '@models';
import { EnumGtmEvent, EnumGtmGroup } from '@enums';

declare let dataLayer: any[];

@Injectable({
  providedIn: 'root',
})
export class GtmTrackingService {
  private userProps: any = {};
  private push(data: any) {
    // @ts-ignore
    if (window && window['dataLayer']) {
      dataLayer.push(data);
    }
  }

  public setConfigLayer(config: SiteConfigInterface) {
    const deploymentId =
      config.analytics?.prefix && config.analytics?.id
        ? `${config.analytics.prefix}-${config.analytics.id}`
        : 'local';
    this.userProps.deployment_url = config.multisite?.site_fqdn || window.location.host;
    this.userProps.deployment_id = deploymentId;
    this.userProps.deployment_name = config.name;
    this.userProps.browser_language = navigator.languages
      ? navigator.languages[0]
      : navigator.language;
  }

  public setUserLayer(user: any) {
    this.userProps.user_role = user.role === 'admin' ? 'admin' : 'member';
    this.userProps.user_id = `${String(user.id)},${this.userProps.deployment_id}`;
  }

  public clearUserLayer() {
    delete this.userProps.user_role;
    delete this.userProps.user_id;
  }

  private pathToPageType(path: any) {
    // i.e. '/settings/general' -> ['settings', 'general']
    const tokens = path.split('/').filter(Boolean);

    if (tokens[0] == 'settings') {
      return 'deployment-settings';
    } else if (tokens[0] == 'activity') {
      return 'deployment-activity';
    } else {
      return 'deployment-other';
    }
  }

  public registerEvent(track: GtmTrackInterface, extra?: any): void {
    const data: any = {
      event: track.event,
      ush_track: { source: track.source, ...extra },
      user_properties: this.userProps,
    };
    if (track.event === EnumGtmEvent.PageView) {
      data.page_type = this.pathToPageType(extra.url);
    }
    this.push({ ecommerce: null });
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

  public static MapProfile(profile: any) {
    return {
      language: profile.language,
      country: profile.country,
    };
  }
}
