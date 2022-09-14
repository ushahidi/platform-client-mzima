import { inject, ChangeDetectorRef, ViewRef } from '@angular/core';
import { UnaryFunction, Observable, ReplaySubject, takeUntil } from 'rxjs';

export function takeUntilDestroy$<T>(): UnaryFunction<Observable<T>, Observable<T>> {
  const viewRef = inject(ChangeDetectorRef) as ViewRef;
  const destroyer$ = new ReplaySubject<void>(1);

  viewRef.onDestroy(() => destroyer$.next());

  return (observable: Observable<T>) => observable.pipe(takeUntil(destroyer$));
}

export const validateFile = (file: File, type = 'image') => {
  switch (type) {
    case 'image':
      const mimeReg = /[\/.](gif|jpg|jpeg|png)$/i;
      return mimeReg.test(file.type) && file.size < 1048576;
    case 'csv':
    default:
      return true;
  }
};
