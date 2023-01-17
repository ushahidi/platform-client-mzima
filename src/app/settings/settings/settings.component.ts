import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Roles } from '@enums';

interface SettingsItem {
  title: string;
  description: string;
  icon: string;
  router: string;
  visible: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {
  @Input() userRole: string;
  isAdmin = false;
  isManageUsers = false;
  isManageSettings = false;
  isManageImportExport = false;
  public settingsItems: SettingsItem[] = [];

  ngOnInit() {
    this.isAdmin = this.userRole === Roles.ADMIN;
    this.isManageUsers = this.userRole === Roles.MANAGE_USERS;
    this.isManageSettings = this.userRole === Roles.MANAGE_SETTINGS;
    this.isManageImportExport = this.userRole === Roles.MANAGE_IMPORT_EXPORT;
    this.initMenu();
  }

  initMenu() {
    this.settingsItems = [
      {
        title: 'settings.settings_list.general',
        description: 'settings.settings_list.general_desc',
        icon: 'general',
        router: 'general',
        visible: this.isAdmin || this.isManageSettings,
      },
      {
        title: 'settings.settings_list.surveys',
        description: 'settings.settings_list.surveys_desc',
        icon: 'surveys',
        router: 'surveys',
        visible: this.isAdmin || this.isManageSettings,
      },
      {
        title: 'settings.settings_list.data_sources',
        description: 'settings.settings_list.data_sources_desc',
        icon: 'data-source',
        router: 'data-sources',
        visible: this.isAdmin || this.isManageSettings,
      },
      {
        title: 'settings.settings_list.import',
        description: 'settings.settings_list.import_desc',
        icon: 'import',
        router: 'data-import',
        visible: this.isAdmin || this.isManageImportExport,
      },
      {
        title: 'settings.settings_list.donation',
        description: 'settings.settings_list.donation_desc',
        icon: 'donate',
        router: 'donation',
        visible: this.isAdmin || this.isManageSettings,
      },
      {
        title: 'settings.settings_list.user_settings',
        description: 'settings.settings_list.user_settings_desc',
        icon: 'configure',
        router: 'user-settings',
        visible:
          this.isAdmin || this.isManageUsers || this.isManageSettings || this.isManageImportExport,
      },
      {
        title: 'settings.settings_list.export_hxl',
        description: 'settings.settings_list.export_desc_hxl',
        icon: 'export',
        router: 'data-export',
        visible: this.isAdmin || this.isManageImportExport,
      },
      {
        title: 'settings.settings_list.users',
        description: 'settings.settings_list.users_desc',
        icon: 'users',
        router: 'users',
        visible: this.isAdmin || this.isManageUsers,
      },
      {
        title: 'settings.settings_list.roles',
        description: 'settings.settings_list.roles_desc',
        icon: 'roles',
        router: 'roles',
        visible: this.isAdmin,
      },
      {
        title: 'settings.settings_list.categories',
        description: 'settings.settings_list.categories_desc',
        icon: 'categories',
        router: 'categories',
        visible: this.isAdmin || this.isManageSettings,
      },
      {
        title: 'settings.settings_list.webhooks',
        description: 'settings.settings_list.webhooks_desc',
        icon: 'webhook',
        router: 'webhooks',
        visible: this.isAdmin || this.isManageSettings,
      },
    ];
  }
}
