import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { Observable, of } from 'rxjs'

import { OauthService } from '../core/oauth/oauth.service'
import { OauthParameters } from '../types'
import { PlatformInfoService } from '../cdk/platform-info'
import { switchMap, map } from 'rxjs/operators'
import { oauthSectionUserIsLoggedIn, oauthSectionHasError } from './constants'

@Injectable({
  providedIn: 'root',
})
export class SignInGuard implements CanActivateChild {
  constructor(
    private _oauth: OauthService,
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
          return this.handleOauthSection(queryParams as OauthParameters)
        } else {
          return of(true)
        }
      })
    )
  }

  handleOauthSection(queryParams: OauthParameters) {
    // If the show login parameters is present redirect the user to the register
    if (queryParams.show_login === 'false') {
      return of(
        this._router.createUrlTree(['/register'], {
          queryParams: queryParams,
        })
      )
    }
    // check if the user is already login or there are errors
    return this._oauth.declareOauthSession(queryParams).pipe(
      map((section) => {
        if (
          // !section.forceLogin && TODO @leomendoza123 https://trello.com/c/xapTqK4F/6875-support-openid-query-parameters
          oauthSectionUserIsLoggedIn(section) &&
          !oauthSectionHasError(section)
        ) {
          return this._router.createUrlTree(['/oauth/authorize'], {
            queryParams: queryParams,
          })
        }
        return true
      })
    )
  }
}
