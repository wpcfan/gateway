import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as screenfull from 'screenfull';

@Component({
  selector: 'ngx-fullscreen-toggle',
  templateUrl: './fullscreen-toggle.component.html',
  styleUrls: ['./fullscreen-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullscreenToggleComponent implements OnInit {
  isFullscreen: boolean;

  constructor() {}

  ngOnInit() {}

  toggleFullscreen() {
    if (screenfull.enabled) {
      screenfull.toggle();
      this.isFullscreen = !this.isFullscreen;
    }
  }
}