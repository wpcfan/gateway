import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { take, switchMap, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ConfirmService } from '@app/shared/confirm/confirm.service';
import { UserSearchService } from '@app/admin/services/user-search.service';
import { KeycloakUser, KeycloakRole } from '@app/admin/admin.model';

import * as fromAdminReducer from '../../reducers';
import * as fromRole from '../../actions/role.actions';
import * as fromRoleDetail from '../../actions/role-detail.actions';
import * as fromRoleDetailSelectors from '../../reducers/role-detail.selectors';
import * as _ from 'lodash';

@Component({
  selector: 'tgapp-role-detail-container',
  templateUrl: './role-detail-container.component.html',
  styleUrls: ['./role-detail-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RoleDetailContainerComponent implements OnInit, OnDestroy {
  entityForm = new FormGroup({});
  model;
  params = new HttpParams().set('pageIndex', '0').set('pageSize', '25');
  model$ = this.store.pipe(select(fromRoleDetailSelectors.selectRole));
  users$ = this.store.pipe(select(fromRoleDetailSelectors.selectUsers));
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
          this.translate.instant('tgapp.admin.role-dialog.name.label'),
        'templateOptions.placeholder': () =>
          this.translate.instant('tgapp.admin.role-dialog.name.placeholder')
      }
    },
    {
      key: 'description',
      type: 'textarea',
      templateOptions: {
        type: 'text',
        required: true,
        maxLength: 255,
        rows: 3
      },
      expressionProperties: {
        'templateOptions.label': () =>
          this.translate.instant('tgapp.admin.role-dialog.description.label'),
        'templateOptions.placeholder': () =>
          this.translate.instant(
            'tgapp.admin.role-dialog.description.placeholder'
          )
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
    this.model$.pipe(take(1)).subscribe(role => {
      this.store.dispatch(
        new fromRole.UpdateAction({
          id: role.name,
          update: { ...role, ...this.entityForm.value }
        })
      );
    });
  }

  handleAddRoleMapping() {}

  handleRemoveUser(user: KeycloakUser) {
    this.model$.pipe(take(1)).subscribe(role => {
      this.store.dispatch(
        new fromRoleDetail.DeleteUserFromRoleAction({
          user: user,
          role: role
        })
      );
    });
  }

  handleDelete() {
    this.confirm
      .delete()
      .pipe(
        take(1),
        filter(ok => ok),
        switchMap(_ => this.model$.pipe(take(1)))
      )
      .subscribe(role => {
        this.store.dispatch(new fromRole.DeleteAction(role.name));
      });
  }

  selectUser(user: KeycloakUser) {
    this.model$.pipe(take(1)).subscribe(role => {
      this.store.dispatch(
        new fromRoleDetail.AddUserToRoleAction({
          user: user,
          role: role
        })
      );
    });
  }

  public isBuiltIn(roleId: string): boolean {
    const builtInRoles = ['admin', 'user'];
    return _.includes(builtInRoles, roleId);
  }
}
