/**
 * event are added here, prefixed with ush to clear head
 * left side is internal, right side is GTM
 */
export enum EnumGtmEvent {
  Login = 'ush_login',
  Search = 'ush_search',
  PageView = 'ush_page_view',
  Click = 'ush_click',
  Upload = 'ush_upload',
  Reveal = 'ush_reveal',
  List = 'ush_view_list',
  GroupClick = 'ush_group_click',
  Error = 'ush_error',
}

export enum EnumGtmGroup {
  Login = 'login',
  Upload = 'upload',
  Navigation = 'nav',
  General = 'general',
}

/**
 * any source in web is added here
 * left side is internal, right side is GTM
 */
export enum EnumGtmSource {
  Maps = 'map',
  Feed = 'feed',
  Data = 'data',
  Activity = 'activity',
  Settings = 'settings',
  Anywhere = 'anywhere',
}
