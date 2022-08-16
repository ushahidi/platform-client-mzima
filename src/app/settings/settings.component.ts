import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  public settingsItems = [
    {
      title: 'General',
      description: "Change your deployment's name, description, logo, and other details.",
      icon: 'home',
      router: 'general',
    },
    {
      title: 'Surveys',
      description: 'Create and configure the surveys your deployment collects.',
      icon: 'home',
      router: 'surveys',
    },
    {
      title: 'Data Sources',
      description:
        'Configure email, SMS, and social media channels that help your deployment collect survey data.',
      icon: 'home',
      router: 'data-sources',
    },
    {
      title: 'Import',
      description: 'Upload survey data to your deployment from a CSV file.',
      icon: 'home',
      router: 'data-data-import',
    },
    {
      title: 'Donation',
      description: 'Create and manage the donations people can make towards your organisation.',
      icon: 'home',
      router: 'donation',
    },
    {
      title: 'Configure HDX API',
      description:
        'Configure your API so that your tagged Ushahidi data can be uploaded to your Humanitarian Data Exchange (HDX) account.',
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
      title: 'Users',
      description: 'Create and manage the people that contribute to your deployment.',
      icon: 'home',
      router: 'users',
    },
    {
      title: 'Roles',
      description: 'Create and manage the type of permissions your users have on your deployment.',
      icon: 'home',
      router: 'roles',
    },
    {
      title: 'Categories',
      description:
        'Create and manage the categories people can put posts into for improved organization.',
      icon: 'home',
      router: 'categories',
    },
    {
      title: 'Webhooks',
      description:
        'Create webhooks that send Ushahidi Platform data to external applications when specific events are triggered.',
      icon: 'home',
      router: 'webhooks',
    },
  ];
}
