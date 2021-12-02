import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  MenuByCategory,
  MenuCategory,
} from "src/app/models/menuCategory.model";

@Component({
  selector: "app-menu-card",
  templateUrl: "./menu-card.component.html",
  styleUrls: ["./menu-card.component.scss"],
})
export class MenuCardComponent implements OnInit {
  @Input() menuCategory: MenuByCategory;
  @Output() onSelectItemHandle = new EventEmitter<string>();
  constructor() {}

  ngOnInit() {}

  onSelectItem(menuItemId: string) {
    this.onSelectItemHandle.next(menuItemId);
  }
}
