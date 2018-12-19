import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsContainerComponent } from './settings';
import { AuthGuardService } from './core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'about',
    pathMatch: 'full'
  },
  {
    path: 'settings',
    component: SettingsContainerComponent,
    canActivate: [AuthGuardService],
    data: { title: 'tgkpi.menu.settings' }
  },
  {
    path: 'feedback',
    loadChildren: 'app/feedback#FeedbackModule',
    pathMatch: 'prefix'
  },
  {
    path: 'admin',
    loadChildren: 'app/admin#AdminModule',
    pathMatch: 'prefix'
  },
  {
    path: 'examples',
    loadChildren: 'app/examples/examples.module#ExamplesModule'
  },
  {
    path: '**',
    redirectTo: 'about'
  }
];

@NgModule({
  // useHash supports github.io demo page, remove in your app
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
