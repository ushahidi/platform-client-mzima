import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class FormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}

export const mapRoleToVisible = (role: any, disabled = false) => {
  let value = '';
  if (role) {
    if (role?.length === 1) {
      value = 'only_me';
    }
    if (role?.length > 1) {
      value = 'specific';
    }
  } else {
    value = 'everyone';
  }
  return {
    value,
    options: role,
    disabled,
  };
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const roleTransform = (data: any) => {
  const { roles, userRole, onlyMe, everyone, specificRoles, isShowIcons } = data;
  return [
    {
      name: onlyMe,
      value: 'only_me',
      icon: isShowIcons ? 'person' : '',
      options: [
        {
          name: capitalize(userRole),
          value: userRole,
          checked: true,
        },
      ],
    },
    {
      name: everyone,
      value: 'everyone',
      icon: isShowIcons ? 'person' : '',
    },
    {
      name: specificRoles,
      value: 'specific',
      icon: isShowIcons ? 'group' : '',
      options: roles.map((role: { display_name: any; name: string }) => {
        return {
          name: role.display_name,
          value: role.name,
          checked: role.name === 'admin',
          disabled: role.name === 'admin',
        };
      }),
    },
  ];
};
