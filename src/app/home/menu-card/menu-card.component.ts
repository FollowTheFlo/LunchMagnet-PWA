import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MenuByCategory } from "src/app/models/menuCategory.model";

@Component({
  selector: "app-menu-card",
  templateUrl: "./menu-card.component.html",
  styleUrls: ["./menu-card.component.scss"],
  //  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCardComponent implements OnInit, OnChanges {
  @Input() menuCategory: MenuByCategory;
  @Output() onSelectItemHandle = new EventEmitter<string>();
  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log("menu onChanges", changes);
  }

  onSelectItem(menuItemId: string) {
    this.onSelectItemHandle.next(menuItemId);
  }
}
