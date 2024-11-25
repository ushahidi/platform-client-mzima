import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PostsService } from '@mzima-client/sdk';
type QueryParams = { mode?: string; page?: string };

@Injectable({
  providedIn: 'root',
})
export class PostResolver implements Resolve<any> {
  constructor(private router: Router, private postsService: PostsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    const postId = parseInt(id as string);

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
    const collection = 'collection';
    const cutURL = browserURL.replace(`/feed/${collection}/`, '');
    const charAfterCollectionId = cutURL.indexOf('/');
    const collectionRoute = browserURL.includes(`/${collection}`);
    const collectionId = cutURL.slice(0, charAfterCollectionId);
    /* -------------------------------------
      Check if url is for collections or not
    ---------------------------------------*/
    const url = collectionRoute ? `/feed/${collection}/${collectionId}/${id}` : `/feed/${id}`;
    //--------------------------------------
    return this.postsService.getById(postId).pipe(
      catchError((error) => {
        if (Number(error.status) === 404) {
          //---------------------------------
          const pageURL = [`${url}/not-found`];
          /* --------------------------------
              Redirect happens at router level!
            ----------------------------------*/
          this.router.navigate(pageURL, {
            queryParams,
            queryParamsHandling: 'merge',
          });
        }
        console.error('Error fetching post', error);
        return of(null);
      }),
      // Posts exists (& user has access to view it)...
      map((post: any) => {
        /* ------------------------------------------------
          Prevent accessible post from showing not-found UI
        // --------------------------------------------------*/
        if (route.routeConfig?.path?.includes('/not-found')) {
          //---------------------------------
          const pageURL = [`${url}/view`];
          /* --------------------------------
              Redirect happens at router level!
            ----------------------------------*/
          this.router.navigate(pageURL, {
            queryParams,
            queryParamsHandling: 'merge',
          });
        }

        if (
          route.routeConfig?.path?.includes('/edit') &&
          !post.allowed_privileges.includes('update')
        ) {
          //---------------------------------
          const pageURL = [`${url}/not-allowed`];
          /* --------------------------------
              Redirect happens at router level!
            ----------------------------------*/
          this.router.navigate(pageURL, {
            queryParams,
            queryParamsHandling: 'merge',
          });
        }
        // Saving for the modal-window
        localStorage.setItem('feedview_postObj', JSON.stringify(post));
        return post;
      }),
    );
  }
}
