export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const roleTransform = (data: any) => {
  const { roles, userRole, onlyMe, everyone, specificRoles } = data;
  return [
    {
      name: onlyMe,
      value: 'only_me',
      checked: false,
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
      checked: false,
    },
    {
      name: specificRoles,
      value: 'specific',
      checked: false,
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
