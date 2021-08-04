import { Component, OnInit } from '@angular/core';
import {PlayerService} from "./player.service";
import {PlayerListService} from "./player-list/player-list.service";
import {RuleListService} from "./rule-list/rule-list.service";
import {DBService} from "../db.service";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  providers: [
      PlayerListService,
      RuleListService,
      PlayerService,
  ]
})
export class PlayerComponent implements OnInit {

  constructor(private playerService: PlayerService, private dbService: DBService) { }

  ngOnInit(): void {
  }

  get player() { return this.playerService.player; }
  get playerName() { return this.playerService.player.displayName + 'aa'; }
get gameTitle() { return this.dbService.gameTitle; }
}
