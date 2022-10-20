import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  public settingsItems = [
    {
      title: 'settings.settings_list.general',
      description: 'settings.settings_list.general_desc',
      icon: 'home',
      router: 'general',
    },
    {
      title: 'settings.settings_list.surveys',
      description: 'settings.settings_list.surveys_desc',
      icon: 'home',
      router: 'surveys',
    },
    {
      title: 'settings.settings_list.data_sources',
      description: 'settings.settings_list.data_sources_desc',
      icon: 'home',
      router: 'data-sources',
    },
    {
      title: 'settings.settings_list.import',
      description: 'settings.settings_list.import_desc',
      icon: 'home',
      router: 'data-import',
    },
    {
      title: 'settings.settings_list.donation',
      description: 'settings.settings_list.donation_desc',
      icon: 'home',
      router: 'donation',
    },
    {
      title: 'settings.settings_list.user_settings',
      description: 'settings.settings_list.user_settings_desc',
      icon: 'home',
      router: 'user-settings',
    },
    {
      title: 'Export and tag data',
      description:
        'Export your data as a CSV file or assign tags and attributes to your data and upload directly to a Humanitarian Data Exchange (HDX) account or export as a tagged CSV file.',
      icon: 'home',
      router: 'data-export',
    },
    {
      title: 'settings.settings_list.users',
      description: 'settings.settings_list.users_desc',
      icon: 'home',
      router: 'users',
    },
    {
      title: 'settings.settings_list.roles',
      description: 'settings.settings_list.roles_desc',
      icon: 'home',
      router: 'roles',
    },
    {
      title: 'settings.settings_list.categories',
      description: 'settings.settings_list.categories_desc',
      icon: 'home',
      router: 'categories',
    },
    {
      title: 'settings.settings_list.webhooks',
      description: 'settings.settings_list.webhooks_desc',
      icon: 'home',
      router: 'webhooks',
    },
  ];
}
