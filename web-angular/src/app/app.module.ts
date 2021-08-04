import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PlayerComponent} from './player/player.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterModule} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {RuleListComponent} from './player/rule-list/rule-list.component';
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {RuleViewComponent} from './player/rule-view/rule-view.component';
import {PlayerListComponent} from './player/player-list/player-list.component';
import {DBService} from "./db.service";
import {DBServiceStub} from "./db-stub.service";
import {GmPageComponent} from './gm-page/gm-page.component';
import {CommonComponentModule} from "./common-component/common-component.module";
import {GmPageModule} from "./gm-page/gm-page.module";

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    RuleListComponent,
    RuleViewComponent,
    PlayerListComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    RouterModule.forRoot([
      {path: '', component: AppComponent},
      {path: 'game_master', component: GmPageComponent},
      {path: 'player', component: PlayerComponent}
    ]),
    MatCardModule,
    MatListModule,
    MatButtonModule,
    CommonComponentModule,
    GmPageModule,
  ],
  providers: [
    {provide: DBService, useClass: DBServiceStub},
  ],
  exports: [
    RuleViewComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
