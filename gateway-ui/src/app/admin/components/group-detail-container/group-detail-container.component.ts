import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { take, filter, switchMap } from 'rxjs/operators';
import { UserSearchService } from '@app/admin/services';
import { KeycloakUser } from '@app/admin/admin.model';
import { ConfirmService } from '@app/shared/confirm/confirm.service';

import * as fromAdminReducer from '../../reducers';
import * as fromGroup from '../../actions/group.actions';
import * as fromGroupDetail from '../../actions/group-detail.actions';
import * as fromGroupDetailSelectors from '../../reducers/group-detail.selectors';
import * as _ from 'lodash';

@Component({
  selector: 'tgapp-group-detail-container',
  templateUrl: './group-detail-container.component.html',
  styleUrls: ['./group-detail-container.component.scss']
})
export class GroupDetailContainerComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  readonly pageSize = 25;
  entityForm = new FormGroup({});
  model;
  params = new HttpParams().set('pageIndex', '0').set('pageSize', '25');
  model$ = this.store.pipe(select(fromGroupDetailSelectors.selectGroup));
  users$ = this.store.pipe(select(fromGroupDetailSelectors.selectUsers));
  sub: Subscription;
  fields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        required: true
      },
      expressionProperties: {
        'templateOptions.label': () =>
          this.translate.instant('tgapp.admin.group-detail.name.label'),
        'templateOptions.placeholder': () =>
          this.translate.instant('tgapp.admin.group-detail.name.placeholder')
      }
    }
  ];
  constructor(
    private store: Store<fromAdminReducer.State>,
    private translate: TranslateService,
    private confirm: ConfirmService,
    public service: UserSearchService
  ) {}
  ngOnInit(): void {
    this.sub = this.model$.subscribe(val => {
      this.model = { ...val };
    });
  }
  ngOnDestroy() {
    if (this.sub && !this.sub.closed) {
      this.sub.unsubscribe();
    }
  }
  submit() {
    if (this.entityForm.invalid) {
      return;
    }
    this.model$.pipe(take(1)).subscribe(group => {
      this.store.dispatch(
        new fromGroup.UpdateAction({
          id: group.id,
          update: { ...group, ...this.entityForm.value }
        })
      );
    });
  }

  handleAddRoleMapping() {}

  handleRemoveUser(user: KeycloakUser) {
    this.model$.pipe(take(1)).subscribe(group => {});
  }

  handleDelete() {
    this.confirm
      .delete()
      .pipe(
        take(1),
        filter(ok => ok),
        switchMap(__ => this.model$.pipe(take(1)))
      )
      .subscribe(group => {
        this.store.dispatch(new fromGroup.DeleteAction(group.id));
      });
  }

  selectUser(user: KeycloakUser) {
    this.model$.pipe(take(1)).subscribe(group => {});
  }

  trackByIdx(i: number) {
    return i;
  }

  pageChange() {
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    console.log(`${end}, '>=', ${total}`);
    if (end === total && total >= this.pageSize) {
      this.store.dispatch(new fromGroupDetail.NextPageAction());
    }
  }

  /**
   * paths
   */
  public paths(path: string) {
    return path.split('/').filter(val => val);
  }
}
