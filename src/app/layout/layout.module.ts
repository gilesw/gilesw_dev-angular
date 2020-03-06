import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  MatButtonModule,
  MatMenuModule,
  MatIconModule,
  MatRippleModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'

import { FooterComponent } from './footer/footer.component'
import { HeaderComponent } from './header/header.component'
import { SearchComponent } from './search/search.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MenuIconComponent } from './menu-icon/menu-icon.component'
import { LanguageComponent } from './language/language.component'
import { CoreModule } from '../core/core.module'
import { UserMenuComponent } from './user-menu/user-menu.component'
import { StatisticsComponent } from './statistics/statistics.component'
import { SkipMainNavComponent } from './skip-main-nav/skip-main-nav.component'
import { BannersComponent } from './banners/banners.component'
import { BannerComponent } from '../cdk/banner/banner.component'

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    MatMenuModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatIconModule,
    BannerComponent,
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    SearchComponent,
    MenuIconComponent,
    LanguageComponent,
    UserMenuComponent,
    StatisticsComponent,
    SkipMainNavComponent,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SkipMainNavComponent,
    BannersComponent,
  ],
})
export class LayoutModule {}
