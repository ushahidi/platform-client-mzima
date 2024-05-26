import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PostsService } from '@mzima-client/sdk';
import { Observable } from 'rxjs';

type QueryParams = { mode?: string; page?: string };

@Injectable({
  providedIn: 'root',
})
export class RedirectByPostIdGuard implements CanActivate {
  constructor(private router: Router, private postsService: PostsService) {}

  /* ---------------------------------------------------
    Guard for handling ID mode child routes in data view
  ----------------------------------------------------*/
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const id = route.paramMap.get('id');
    const postId = parseInt(id as string);

    this.postsService.getById(postId).subscribe({
      // next: (post: any) => { console.log(post.id, post.id === postId); },

      // On error...
      error: (err) => {
        if (err.status === 404) {
          let queryParams: QueryParams = {};

          /* -------------------------------------------------------
            Include page params (if supplied in the browser url)
            This way, we can help user still see posts on that exact
            page though post not found component/route shows up
          --------------------------------------------------------*/
          const page = route.queryParams['page'];
          const mode = route.queryParams['mode'];
          if (page) queryParams = { ...queryParams, page };
          if (mode) queryParams = { ...queryParams, mode };

          /* --------------------------------------------
            Workaround for getting collections url and ID
          ----------------------------------------------*/
          const browserURL = window.location.pathname;
          const cutURL = browserURL.replace('/feed/collection/', '');
          const charAfterCollectionId = cutURL.indexOf('/');
          const collectionRoute = browserURL.includes('/collection');
          const collectionId = cutURL.slice(0, charAfterCollectionId);
          const pageURL = collectionRoute
            ? [`/feed/collection/${collectionId}/${id}/not-found`]
            : [`/feed/${id}/not-found`];

          /* --------------------------------
            Redirect happens at router level!
          ----------------------------------*/
          this.router.navigate(pageURL, {
            queryParams,
            queryParamsHandling: 'merge',
          });
        }
      },
    });

    /* --------------------------------------------------
      Always return true so that routing is not prevented
      on PostCard click or on "Swith Mode" button click
    ---------------------------------------------------*/
    return true;
  }
}
