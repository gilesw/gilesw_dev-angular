import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { Subject } from 'rxjs'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ModalComponent } from '../../../modal/modal/modal.component'
import { PlatformInfo, PlatformInfoService } from '../../../platform-info'
import { RecordWebsitesService } from '../../../../core/record-websites/record-websites.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { VisibilityStrings } from '../../../../types/common.endpoint'
import { WINDOW } from '../../../window'
import { UserRecord } from '../../../../types/record.local'
import { first, takeUntil } from 'rxjs/operators'
import { WebsitesEndPoint } from '../../../../types/record-websites.endpoint'
import { Assertion } from '../../../../types'
import { UserSession } from '../../../../types/session.local'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { cloneDeep } from 'lodash'
import { UserService } from '../../../../core'
import { OrcidValidators } from '../../../../validators'
import { URL_REGEXP } from '../../../../constants'

@Component({
  selector: 'app-modal-websites',
  templateUrl: './modal-websites.component.html',
  styleUrls: ['./modal-websites.component.scss']
})
export class ModalWebsitesComponent implements OnInit, OnDestroy {
  $destroy: Subject<boolean> = new Subject<boolean>()

  websitesForm: FormGroup
  platform: PlatformInfo
  defaultVisibility: VisibilityStrings
  websites: Assertion[]
  originalBackendWebsites: WebsitesEndPoint
  userRecord: UserRecord
  userSession: UserSession
  isMobile: boolean
  addedWebsiteCount = 0
  loadingWebsites = true

  ngOrcidDescription = $localize`:@@topBar.description:Link Title`
  ngOrcidUrl = $localize`:@@topBar.url:Link URL`

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(MAT_DIALOG_DATA) public data: UserRecord,
    public dialogRef: MatDialogRef<ModalComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _platform: PlatformInfoService,
    private _userService: UserService,
    private _recordWebsitesService: RecordWebsitesService
  ) {
    this._platform
      .get()
      .pipe(takeUntil(this.$destroy))
      .subscribe((platform) => {
        this.platform = platform
        this.isMobile = platform.columns4 || platform.columns8
      })

    this._userService
      .getUserSession()
      .pipe(takeUntil(this.$destroy))
      .subscribe((userSession) => {
        this.userSession = userSession
      })
  }

  ngOnInit(): void {
    this.userRecord = this.data
    this._recordWebsitesService
      .getWebsites()
      .pipe(first())
      .subscribe((websites: WebsitesEndPoint) => {
        this.defaultVisibility = websites.visibility.visibility
        this.originalBackendWebsites = cloneDeep(websites)
        this.websites = websites.websites
        const websitesMap = {}
        this.originalBackendWebsites.websites.map(
          (value) => (websitesMap[value.putCode] = value),
        )
        this.backendJsonToForm(this.originalBackendWebsites)
        this.loadingWebsites = false
      })
  }

  onSubmit() {}

  backendJsonToForm(
    websitesEndPoint: WebsitesEndPoint
  ) {
    const websites = websitesEndPoint.websites
    const group: { [key: string]: FormGroup } = {}

    websites.forEach((website) => {
      group[website.putCode] = new FormGroup({
        description: new FormControl(website.urlName),
        url: new FormControl(website.url.value, {
          validators: [
            Validators.pattern(URL_REGEXP)
            ]
        }),
        visibility: new FormControl(website.visibility.visibility, {}),
      })
    })
    this.websitesForm = new FormGroup(group)
  }

  formToBackend(websitesForm: FormGroup): WebsitesEndPoint {
    const websites = {
      errors: [],
      websites: [],
      visibility: this.originalBackendWebsites.visibility,
    }
    this.websites.reverse()
    this.websites
      .map((value) => value.putCode)
      .filter((key) => websitesForm.value[key].url)
      .forEach((key, i) => {
        const urlName = websitesForm.value[key].description
        const url = websitesForm.value[key].url
        const visibility = websitesForm.value[key].visibility
        if (websitesForm.value[key]) {
          websites.websites.push({
            putCode: key.indexOf('new-') === 0 ? null : key,
            url: url,
            urlName: urlName,
            displayIndex: i + 1,
            source: this.userSession.userInfo.EFFECTIVE_USER_ORCID,
            visibility: {
              visibility,
            },
          } as Assertion)
        }
      })
    return websites
  }

  saveEvent() {
    if (this.websitesForm.valid) {
      this.loadingWebsites = true
      this._recordWebsitesService
        .postWebsites(this.formToBackend(this.websitesForm))
        .subscribe(
          (response) => {
            this.closeEvent()
          },
          (error) => {
            console.log(error)
          }
        )
    }
  }

  closeEvent() {
    this.dialogRef.close()
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.websites, event.previousIndex, event.currentIndex)
  }

  addWebsite() {
    this.websitesForm.addControl(
      'new-' + this.addedWebsiteCount,
      new FormGroup({
        description: new FormControl(),
        url: new FormControl('', {
          validators: [
            Validators.pattern(URL_REGEXP)
          ]
        }),
        visibility: new FormControl(this.defaultVisibility, {}),
      })
    )
    this.websites.push({
      putCode: 'new-' + this.addedWebsiteCount,
      visibility: { visibility: this.defaultVisibility },
    } as Assertion)
    this.addedWebsiteCount++

    this._changeDetectorRef.detectChanges()
  }

  deleteWebsite(putCode: string) {
    const i = this.websites.findIndex((value) => value.putCode === putCode)
    this.websites.splice(i, 1)
    this.websitesForm.removeControl(putCode)
  }

  getSource(website: Assertion) {
    if (website.source) {
      if (website.lastModified) {
        return (
          website.source +
          ' ' +
          website.lastModified.year +
          '-' +
          website.lastModified.month +
          '-' +
          website.lastModified.day
        )
      } else {
        return website.sourceName
      }
    }
  }

  toMyLinks() {
    this.window.document.getElementById('my-links').scrollIntoView()
  }

  ngOnDestroy() {
    this.$destroy.next(true)
    this.$destroy.unsubscribe()
  }
}
