import {Component, OnInit} from '@angular/core';
import {UIService} from "./ui.service";

@Component({
  selector: 'app-gm-page',
  templateUrl: './gm-page.component.html',
  styleUrls: ['./gm-page.component.scss'],
})
export class GmPageComponent implements OnInit {

  constructor(private uiService: UIService) { }

  ngOnInit(): void {
  }

  get selectedRule() { return this.uiService.selectedRule; }
  get selectedToken() { return this.uiService.selectedToken; }
}
