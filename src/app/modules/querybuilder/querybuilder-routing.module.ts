import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuerybuilderEditorComponent } from './components/querybuilder-editor/querybuilder-editor.component';
import { MyQueriesComponent } from './components/my-queries/my-queries.component';
const routes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
  { path: 'editor', component: QuerybuilderEditorComponent },
  { path: 'my-queries', component: MyQueriesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuerybuilderRoutingModule {}
