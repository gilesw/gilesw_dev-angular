import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { ProfileBiographyComponent } from './components/profile-biography/profile-biography.component'
import { ProfileGeneralDataComponent } from './components/profile-general-data/profile-general-data.component'
import { ProfileRecordsComponent } from './components/profile-records/profile-records.component'
import { ProfilePageComponent } from './pages/profile-page/profile-page.component'
import { ProfileRoutingModule } from './profile-routing.module'
import { SharedModule } from '../shared/shared.module'
import { ProfileGeneralDataDetailComponent } from './components/profile-general-data-detail/profile-general-data-detail.component'

@NgModule({
  imports: [CommonModule, ProfileRoutingModule, SharedModule],
  declarations: [
    ProfileGeneralDataComponent,
    ProfileBiographyComponent,
    ProfileRecordsComponent,
    ProfilePageComponent,
    ProfileGeneralDataDetailComponent,
  ],
})
export class ProfileModule {}
