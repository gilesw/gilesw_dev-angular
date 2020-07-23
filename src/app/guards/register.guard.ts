import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { PlatformInfoService } from '../cdk/platform-info'
import { OauthService } from '../core/oauth/oauth.service'
import { OauthParameters } from '../types'
import { oauthSessionHasError, oauthSessionUserIsLoggedIn } from './constants'
import { UserService } from '../core'

@Injectable({
  providedIn: 'root',
})
export class RegisterGuard implements CanActivateChild {
  constructor(
    private _user: UserService,
    private _router: Router,
    private _platform: PlatformInfoService
  ) {}

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | UrlTree | boolean {
    const queryParams = next.queryParams

    return this._platform.get().pipe(
      switchMap((value) => {
        if (value.oauthMode) {
          return this.handleOauthSession(queryParams as OauthParameters)
        } else {
          return of(true)
        }
      })
    )
  }

  handleOauthSession(queryParams: OauthParameters) {
    // check if the user is already login or there are errors
    return this._user.getUserSession(queryParams).pipe(
      map((x) => x.oauthSession),
      map((session) => {
        if (
          !session.forceLogin &&
          oauthSessionUserIsLoggedIn(session) &&
          !oauthSessionHasError(session)
        ) {
          return this._router.createUrlTree(['/oauth/authorize'], {
            queryParams: queryParams,
          })
        } else if (oauthSessionHasError(session)) {
          // errors are handle on the signin guard
          return this._router.createUrlTree(['/signin'], {
            queryParams: queryParams,
          })
        }
        return true
      })
    )
  }
}
