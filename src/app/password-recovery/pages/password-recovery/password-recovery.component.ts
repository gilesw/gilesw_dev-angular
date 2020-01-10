import { Component, OnInit, AfterViewInit, Inject } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { PasswordRecoveryService } from 'src/app/core/password-recovery/password-recovery.service'
import { matFormFieldAnimations } from '@angular/material'
import { WINDOW } from 'src/app/cdk/window'

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: [
    './password-recovery.component.scss-theme.scss',
    './password-recovery.component.scss',
  ],
  animations: [matFormFieldAnimations.transitionMessages],
  preserveWhitespaces: true,
})
export class PasswordRecoveryComponent implements OnInit, AfterViewInit {
  status = false
  value = false
  email = 'test'
  _subscriptAnimationState = ''
  loading = false
  submitted = false

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ])
  typeFormControl = new FormControl('', [Validators.required])

  recoveryForm = new FormGroup({
    type: this.typeFormControl,
    email: this.emailFormControl,
  })

  constructor(
    private _passwordRecovery: PasswordRecoveryService,
    @Inject(WINDOW) private window: Window
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Avoid animations on load.
    this._subscriptAnimationState = 'enter'
  }

  onSubmit() {
    const value = this.recoveryForm.getRawValue()
    // Mark all elements as touch to display untouched FormControl errors
    this.recoveryForm.markAllAsTouched()
    // If the local validations pass, call the backend
    if (this.recoveryForm.valid) {
      this.loading = true
      let $recovery
      if (this.typeFormControl.value === 'remindOrcidId') {
        $recovery = this._passwordRecovery.remindOrcidId(value)
      } else {
        $recovery = this._passwordRecovery.resetPassword(value)
      }
      $recovery.subscribe(data => {
        this.loading = false
        // Sets the list of backend errors to the control
        if (data.errors && data.errors.length) {
          this.recoveryForm.controls['email'].setErrors({
            backendErrors: data.errors || null,
          })
        } else if (data.successMessage.length) {
          this.submitted = true
        }
      })
    }
  }

  navigateTo(val) {
    this.window.location.href = val
  }
}
