import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AccessType, Player} from "../../model";
import {ThemePalette} from "@angular/material/core";

@Component({
  selector: 'app-assignment-chip',
  templateUrl: './assignment-chip.component.html',
  styleUrls: ['./assignment-chip.component.scss']
})
export class AssignmentChipComponent implements OnInit {
  @Input() player!: Player;

  @Input() accessType: AccessType | undefined = undefined;
  @Output() accessTypeChange = new EventEmitter<AccessType | undefined>();

  constructor() { }

  ngOnInit(): void {
  }

  get color(): ThemePalette | undefined {
    if (this.accessType == 'ASSIGNED') {
      return 'primary';
    } else if (this.accessType == 'SHARED') {
      return 'accent';
    } else {
      return undefined;
    }
  }
}
