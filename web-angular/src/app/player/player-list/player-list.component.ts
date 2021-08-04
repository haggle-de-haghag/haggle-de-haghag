import {Component, Input, OnInit} from '@angular/core';
import {PlayerListService} from "./player-list.service";
import {Rule} from "../../model";

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {
  @Input()
  rule!: Rule;

  constructor(public playerListService: PlayerListService) { }

  ngOnInit(): void {
  }

  get players() { return this.playerListService.players; }
}
