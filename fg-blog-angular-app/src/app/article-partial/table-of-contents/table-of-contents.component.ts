import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-table-of-contents',
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.css']
})
export class TableOfContentsComponent implements OnInit {

  @Input() toc: any;
  @Input() url: any;

  constructor() { }

  ngOnInit() {
  }

}