import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { SearchRoutingModule } from './search-routing.module'
import { SearchComponent } from './pages/search/search.component'
import { ResultsComponent } from './components/results/results.component'
import {
  MatPaginatorModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
} from '@angular/material'
import { AdvanceSearchComponent } from './components/advance-search/advance-search.component'

@NgModule({
  declarations: [SearchComponent, ResultsComponent, AdvanceSearchComponent],
  imports: [
    CommonModule,
    SearchRoutingModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
  ],
  exports: [ResultsComponent],
})
export class SearchModule {}
