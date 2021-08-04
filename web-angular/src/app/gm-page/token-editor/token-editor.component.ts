import {Component, Input, OnInit} from '@angular/core';
import {Token} from "../../model";

@Component({
  selector: 'app-token-editor',
  templateUrl: './token-editor.component.html',
  styleUrls: ['./token-editor.component.scss']
})
export class TokenEditorComponent implements OnInit {
  @Input()
  token!: Token;

  constructor() { }

  ngOnInit(): void {
  }

}
