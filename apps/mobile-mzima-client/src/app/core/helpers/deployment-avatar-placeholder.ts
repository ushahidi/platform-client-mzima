import { deploymentAvatarColors } from '../constants/deployment-avatar-colors';

export function getDeploymentAvatarPlaceholder(name: string) {
  let hash = 0;

  for (let i = 0; i < name?.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }

  return deploymentAvatarColors[Math.abs(hash) % 9];
}
