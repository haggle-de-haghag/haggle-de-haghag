import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RuleEditorComponent} from "./rule-editor/rule-editor.component";
import {TokenEditorComponent} from "./token-editor/token-editor.component";
import {DBService} from "./db.service";
import {DBServiceStub} from "./db-stub.service";
import {GmPageComponent} from "./gm-page.component";
import {MatListModule} from "@angular/material/list";
import {CommonComponentModule} from "../common-component/common-component.module";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatChipsModule} from "@angular/material/chips";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import { AssignmentChipComponent } from './rule-editor/assignment-chip.component';
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import { ItemListComponent } from './item-list/item-list.component';

@NgModule({
  declarations: [
      GmPageComponent,
      RuleEditorComponent,
      TokenEditorComponent,
      AssignmentChipComponent,
      ItemListComponent,
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        MatListModule,
        CommonComponentModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatChipsModule,
        MatIconModule,
        MatTableModule,
    ],
  providers: [
    {provide: DBService, useClass: DBServiceStub}
  ]
})
export class GmPageModule { }
