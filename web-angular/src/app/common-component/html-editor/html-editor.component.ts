import { EventEmitter } from '@angular/core';
import {Component, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import * as DOMPurify from "dompurify";

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss']
})
export class HtmlEditorComponent implements OnInit {
  @Input() title!: string;

  @Input() html!: string;
  @Output() htmlChange = new EventEmitter<string>();

  @Output() blur = new EventEmitter();

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  get safeHtml() {
    const config = {
      ALLOWED_TAGS: ['span', 'b', 'i', 's', 'hr', 'font', 'blink', 'marquee'],
    };
    const sanitized = DOMPurify.sanitize(this.html, config);
    return this.domSanitizer.bypassSecurityTrustHtml(sanitized);
  }

  get htmlProp() { return this.html; }
  set htmlProp(value: string) { this.htmlChange.emit(value); }
}
