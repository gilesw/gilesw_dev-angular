import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { ErrorHandlerService } from '../error-handler/error-handler.service'
import { environment } from '../../../environments/environment'
import { catchError, retry, tap, switchMap } from 'rxjs/operators'
import { SignIn } from '../../types/sign-in.endpoint'
import { Reactivation } from '../../types/reactivation.endpoint'
import { CustomEncoder } from '../custom-encoder/custom.encoder'
import { getOrcidNumber } from '../../constants'
import { SignInLocal, TypeSignIn } from '../../types/sign-in.local'
import { UserService } from '../user/user.service'

@Injectable({
  providedIn: 'root',
})
export class SignInService {
  private headers: HttpHeaders

  constructor(
    private _http: HttpClient,
    private _errorHandler: ErrorHandlerService,
    private _userService: UserService
  ) {
    this.headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded;charset=utf-8'
    )
  }

  signIn(signInLocal: SignInLocal, updateUserService = false) {
    let loginUrl = 'signin/auth.json'

    if (signInLocal.type && signInLocal.type === TypeSignIn.institutional) {
      loginUrl = 'shibboleth/signin/auth.json'
    }

    if (signInLocal.type && signInLocal.type === TypeSignIn.social) {
      loginUrl = 'social/signin/auth.json'
    }

    let body = new HttpParams({ encoder: new CustomEncoder() })
      .set('userId', getOrcidNumber(signInLocal.data.username))
      .set('password', signInLocal.data.password)
    if (signInLocal.data.verificationCode) {
      body = body.set('verificationCode', signInLocal.data.verificationCode)
    }
    if (signInLocal.data.recoveryCode) {
      body = body.set('recoveryCode', signInLocal.data.recoveryCode)
    }
    body = body.set(
      'oauthRequest',
      signInLocal.type === TypeSignIn.oauth ? 'true' : 'false'
    )
    return this._http
      .post<SignIn>(environment.API_WEB + loginUrl, body, {
        headers: this.headers,
        withCredentials: true,
      })
      .pipe(
        retry(3),
        catchError((error) => this._errorHandler.handleError(error)),
        tap(() => {
          // At the moment by default the userService wont be refreshed, only on the oauth login
          // other logins that go outside this application, wont require to refresh the user service
          if (updateUserService) {
            this._userService.refreshUserStatus()
          }
        })
      )
  }

  reactivation(data) {
    let body = new HttpParams({ encoder: new CustomEncoder() })
    body = body.set('email', data.email)
    return this._http
      .post<Reactivation>(environment.API_WEB + `sendReactivation.json`, body, {
        headers: this.headers,
        withCredentials: true,
      })
      .pipe(
        retry(3),
        catchError((error) => this._errorHandler.handleError(error))
      )
  }

  singOut() {
    return this._http
      .get<SignIn>(environment.API_WEB + 'userStatus.json?logUserOut=true', {
        headers: this.headers,
        withCredentials: true,
      })
      .pipe(
        retry(3),
        catchError((error) => this._errorHandler.handleError(error)),
        switchMap(() => this._userService.refreshUserStatus())
      )
  }
}
