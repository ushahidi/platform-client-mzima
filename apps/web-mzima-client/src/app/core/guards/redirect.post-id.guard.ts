import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PostsService } from '@mzima-client/sdk';
import { Observable } from 'rxjs';
import { BaseComponent } from '../../base.component';
import { BreakpointService, SessionService } from '@services';
import { Permissions } from '@enums';

type QueryParams = { mode?: string; page?: string };

@Injectable({
  providedIn: 'root',
})
export class RedirectByPostIdGuard extends BaseComponent implements CanActivate {
  public notAllowed: boolean = false;
  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private router: Router,
    private postsService: PostsService,
  ) {
    super(sessionService, breakpointService);
    this.getUserData();
    // console.log(this.user);
    // console.log(this.user.permissions?.includes(Permissions.ManagePosts) as boolean);
  }

  loadData(): void {}

  /* ---------------------------------------------------
    Guard for handling ID mode child routes in data view
  ----------------------------------------------------*/
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const isMangePosts = this.user.permissions?.includes(Permissions.ManagePosts) as boolean;
    console.log({ isMangePosts });
    // const urlEnd = isMangePosts ? 'not-allowed' : 'not-found';

    const id = route.paramMap.get('id');
    const postId = parseInt(id as string);

    console.log(this.user);
    // console.log(this.user.permissions?.includes(Permissions.ManagePosts) as boolean);

    const userId = this.user.userId && !isNaN(this.user.userId as number);
    const isLoggedIn = this.user.userId !== '' && userId; // || this.user.userId; //!isNaN(this.user.userId as number);
    console.log({ isLoggedIn });

    let queryParams: QueryParams = {};

    /* -------------------------------------------------------
      Include page params (if supplied in the browser url)
      This way, we can help user still see posts on that exact
      page though post not found component/route shows up
    --------------------------------------------------------*/
    const page = route.queryParams['page'];
    const mode = route.queryParams['mode'];
    if (page) queryParams = { ...queryParams, page };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (mode) queryParams = { ...queryParams, mode };

    /* --------------------------------------------
      Workaround for getting collections url and ID
    ----------------------------------------------*/
    const browserURL = window.location.pathname;
    const cutURL = browserURL.replace('/feed/collection/', '');
    const charAfterCollectionId = cutURL.indexOf('/');
    const collectionRoute = browserURL.includes('/collection');
    const collectionId = cutURL.slice(0, charAfterCollectionId);

    const urlEnd: '/not-found' | '/not-allowed' | '' = '';
    console.log({ urlEnd });

    // const editRoute = browserURL.includes('/edit');
    // if ((!isLoggedIn || !isMangePosts) && editRoute) {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   urlEnd = '/not-allowed';
    // }

    const pageURL = collectionRoute
      ? [`/feed/collection/${collectionId}/${id}${urlEnd}`]
      : [`/feed/${id}${urlEnd}`];

    console.log(pageURL);

    // const isMangePosts = this.user.permissions?.includes(Permissions.ManagePosts) as boolean;
    // const urlEnd = isMangePosts ? 'not-allowed' : 'not-found';

    // const pageURL = collectionRoute
    //   ? [`/feed/collection/${collectionId}/${id}/not-found`]
    //   : [`/feed/${id}/not-found`];

    // this.postsService.update(`${postId}/lock`, null).subscribe((data) => {
    //   console.log({ data });
    // });

    this.postsService.update(postId, '').subscribe({
      error: (err) => {
        console.log({ err });
      },
    });

    // this.postsService.getById(postId).subscribe({
    //   next: (post: any) => {
    //     const canReadPost = post.allowed_privileges.includes('read');
    //     post.allowed_privileges.includes('update');
    //     // console.log(post.id, post.id === postId);
    //     console.log({ post });
    //     console.log({ priv: post.allowed_privileges });
    //     // console.log(
    //     //   'permission: ',
    //     //   this.user.permissions?.includes(Permissions.ManagePosts) as boolean,
    //     // );
    //   },

    //   // On error...
    //   error: (err) => {
    //     // Currently,
    //     console.log(err);
    //     if (err.status === 401) {
    //       console.log('UNAUTHORIZED to access this post!');
    //     }

    //     if (err.status === 404) {
    //       console.log('NOT FOUND - yes, this post is not found!');
    //     }
    //     // if (err.status === 404) {
    //     //   // let queryParams: QueryParams = {};

    //     //   // /* -------------------------------------------------------
    //     //   //   Include page params (if supplied in the browser url)
    //     //   //   This way, we can help user still see posts on that exact
    //     //   //   page though post not found component/route shows up
    //     //   // --------------------------------------------------------*/
    //     //   // const page = route.queryParams['page'];
    //     //   // const mode = route.queryParams['mode'];
    //     //   // if (page) queryParams = { ...queryParams, page };
    //     //   // if (mode) queryParams = { ...queryParams, mode };

    //     //   // /* --------------------------------------------
    //     //   //   Workaround for getting collections url and ID
    //     //   // ----------------------------------------------*/
    //     //   // const browserURL = window.location.pathname;
    //     //   // const cutURL = browserURL.replace('/feed/collection/', '');
    //     //   // const charAfterCollectionId = cutURL.indexOf('/');
    //     //   // const collectionRoute = browserURL.includes('/collection');
    //     //   // const collectionId = cutURL.slice(0, charAfterCollectionId);

    //     //   // // const isMangePosts = this.user.permissions?.includes(Permissions.ManagePosts) as boolean;
    //     //   // // const urlEnd = isMangePosts ? 'not-allowed' : 'not-found';

    //     //   /* --------------------------------
    //     //     Redirect happens at router level!
    //     //   ----------------------------------*/
    //     //   this.router.navigate(pageURL, {
    //     //     queryParams,
    //     //     queryParamsHandling: 'merge',
    //     //   });
    //     // }
    //   },
    // });

    /* --------------------------------------------------
      Always return true so that routing is not prevented
      on PostCard click or on "Swith Mode" button click
    ---------------------------------------------------*/
    return true;
  }
}
