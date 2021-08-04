import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import * as DOMPurify from "dompurify";

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss']
})
export class HtmlEditorComponent implements OnInit {
  @Input()
  title!: string;

  @Input()
  html!: string;

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
}
