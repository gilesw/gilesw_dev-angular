import { Inject, Injectable, LOCALE_ID } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { NEVER, Observable, of } from 'rxjs'
import { catchError, first, switchMap, tap } from 'rxjs/operators'

import { PlatformInfoService } from '../cdk/platform-info'
import { WINDOW } from '../cdk/window'
import { UserService } from '../core'
import { ErrorHandlerService } from '../core/error-handler/error-handler.service'
import { LanguageContext } from '../types/language.locale'

@Injectable({
  providedIn: 'root',
})
export class LanguageGuard implements CanActivateChild {
  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private _platform: PlatformInfoService,
    private _cookies: CookieService,

    private _user: UserService,
    @Inject(WINDOW) private window: Window,
    private _router: Router,
    private _errorHandler: ErrorHandlerService
  ) {}
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    let langContext: LanguageContext
    return this._platform.get().pipe(
      first(),
      switchMap((platform) => {
        langContext = this.getLanguageContext(next.queryParams)
        if (
          platform.hasOauthParameters &&
          this.requireLanguageCookieUpdate(langContext)
        ) {
          // do initialize the user session to change the language
          // this will trigger the oauth init.json, which will update the language cookie
          return this._user.getUserSession().pipe(
            tap(() => {
              // refresh language context if the language cookie have changed
              langContext = this.getLanguageContext(next.queryParams)
            }),
            switchMap(() => {
              // The browser might be already loading the right language thanks to the query parameter and local cache
              // so a reload is not require
              if (this.currentAppLanguageMatchTheCookieLanguage(langContext)) {
                return of(true)
              } else {
                // the browser needs to be reloaded to load the correct language
                return of(this.window.location.reload()).pipe(
                  switchMap(() => NEVER)
                )
              }
            }),
            catchError((value) => of(true)) // If the language change endpoint fail ignore and continue
          )
        } else if (
          !this.currentAppLanguageMatchTheCookieLanguage(langContext)
        ) {
          /**
           * If on the application load the language cookie (set by the backend) and the real app language differ
           * it is highly likely an issue with cloudflare
           */
          return this._errorHandler
            .handleError(new Error('cloudflareIssueDetected/'))
            .pipe(catchError((error) => of(true)))
        } else {
          return of(true)
        }
      })
    )
  }

  getLanguageContext(queryParams): LanguageContext {
    return {
      param: this.normalizeLanguageCode(
        queryParams['lang'] || queryParams['LANG']
      ),
      app: this.normalizeLanguageCode(this.locale),
      cookie: this.normalizeLanguageCode(this._cookies.get('locale_v3')),
    }
  }

  /**
   *
   * @param languageCode Any Language code set by the Orcid Source backend
   *
   * Transform backend codes to ISO 639-1 Code to be compatible with Angular codes
   */
  normalizeLanguageCode(languageCode: string): string {
    if (languageCode) {
      return languageCode.toLocaleLowerCase().replace('_', '-')
    }
    return languageCode
  }

  currentAppLanguageMatchTheCookieLanguage(langContext: LanguageContext) {
    if (
      langContext.cookie &&
      langContext.app &&
      langContext.app.indexOf(langContext.cookie) === -1
    ) {
      return false
    }
    return true
  }

  requireLanguageCookieUpdate(lang: LanguageContext): boolean {
    return lang.param && lang.cookie && lang.cookie.indexOf(lang.param) === -1
  }
}
