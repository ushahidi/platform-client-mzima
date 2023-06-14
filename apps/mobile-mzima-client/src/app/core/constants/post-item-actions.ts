import { ActionSheetButton } from '@ionic/angular';

export enum PostItemActionType {
  SHARE = 'SHARE',
  EDIT = 'EDIT',
  ADD_TO_COLLECTION = 'ADD_TO_COLLECTION',
  PUBLISH = 'PUBLISH',
  PUT_UNDER_REVIEW = 'PUT_UNDER_REVIEW',
  ARCHIVE = 'ARCHIVE',
  DELETE = 'DELETE',
}

export enum PostItemActionTypeUserRole {
  ADMIN = 'ADMIN',
  AUTHOR = 'AUTHOR',
  USER = 'USER',
}

export const postItemActions: PostItemAction[] = [
  {
    role: 'share',
    text: 'Share post',
    icon: '/assets/icon/share.svg',
    data: {
      action: PostItemActionType.SHARE,
    },
    guard: [],
  },
  {
    cssClass: 'separator',
    guard: [
      PostItemActionTypeUserRole.USER,
      PostItemActionTypeUserRole.ADMIN,
      PostItemActionTypeUserRole.AUTHOR,
    ],
  },
  {
    role: 'action',
    text: 'Edit post',
    icon: '/assets/icon/edit.svg',
    data: {
      action: PostItemActionType.EDIT,
    },
    guard: [PostItemActionTypeUserRole.ADMIN, PostItemActionTypeUserRole.AUTHOR],
  },
  {
    role: 'action',
    text: 'Add to collection',
    icon: '/assets/icon/add-to-collection.svg',
    data: {
      action: PostItemActionType.ADD_TO_COLLECTION,
    },
    guard: [
      PostItemActionTypeUserRole.USER,
      PostItemActionTypeUserRole.ADMIN,
      PostItemActionTypeUserRole.AUTHOR,
    ],
  },
  {
    cssClass: 'separator',
    guard: [PostItemActionTypeUserRole.ADMIN, PostItemActionTypeUserRole.AUTHOR],
  },
  {
    role: 'status',
    text: 'Publish',
    icon: '/assets/icon/publish.svg',
    data: {
      action: PostItemActionType.PUBLISH,
    },
    guard: [PostItemActionTypeUserRole.ADMIN],
  },
  {
    role: 'status',
    text: 'Put under review',
    icon: '/assets/icon/put-under-review.svg',
    data: {
      action: PostItemActionType.PUT_UNDER_REVIEW,
    },
    guard: [PostItemActionTypeUserRole.ADMIN],
  },
  {
    role: 'status',
    text: 'Archive',
    icon: '/assets/icon/archive.svg',
    data: {
      action: PostItemActionType.ARCHIVE,
    },
    guard: [PostItemActionTypeUserRole.ADMIN],
  },
  {
    cssClass: 'separator',
    guard: [PostItemActionTypeUserRole.ADMIN],
  },
  {
    text: 'Delete post',
    role: 'destructive',
    icon: '/assets/icon/delete.svg',
    data: {
      action: PostItemActionType.DELETE,
    },
    guard: [PostItemActionTypeUserRole.ADMIN, PostItemActionTypeUserRole.AUTHOR],
  },
  {
    text: 'Cancel',
    role: 'cancel',
    guard: [],
  },
];

export const getPostItemActions = (role?: PostItemActionTypeUserRole): ActionSheetButton[] => {
  return postItemActions.filter((postItemAction) =>
    role
      ? !postItemAction.guard.length || postItemAction.guard.indexOf(role) > -1
      : !postItemAction.guard.length,
  );
};

interface PostItemAction extends ActionSheetButton {
  guard: PostItemActionTypeUserRole[];
}
