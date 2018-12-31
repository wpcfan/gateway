import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import {
  switchMap,
  map,
  catchError,
  tap,
  filter,
  first,
  withLatestFrom
} from 'rxjs/operators';
import { of } from 'rxjs';
import { GroupService } from '../services';

import * as fromGroup from '../actions/group.actions';
import * as fromGroupDetail from '../actions/group-detail.actions';
import * as fromAdminReducer from '../reducers';
import * as fromGroupDetailSelectors from '../reducers/groups/group-detail.selectors';
import * as fromGroupSelectors from '../reducers/groups/group.selectors';

@Injectable()
export class GroupEffects {
  constructor(
    private actions$: Actions,
    private service: GroupService,
    private router: Router,
    private store: Store<fromAdminReducer.State>
  ) {}
  @Effect()
  add = this.actions$.pipe(
    ofType<fromGroup.AddTopAction>(fromGroup.ActionTypes.AddTop),
    map(action => action.payload),
    switchMap(val => {
      return this.service.add(val).pipe(
        map(group => new fromGroup.AddTopSuccessAction(group)),
        catchError(err => of(new fromGroup.AddTopFailAction(err)))
      );
    })
  );

  @Effect()
  addChild = this.actions$.pipe(
    ofType<fromGroup.AddChildAction>(fromGroup.ActionTypes.AddChild),
    map(action => action.payload),
    switchMap(({ id, changes }) =>
      this.service.updateSubGroups(id, changes).pipe(
        map(
          group =>
            new fromGroup.AddChildSuccessAction({ parentId: id, child: group })
        ),
        catchError(err => of(new fromGroup.AddChildFailAction(err)))
      )
    )
  );

  @Effect()
  delete = this.actions$.pipe(
    ofType<fromGroup.DeleteAction>(fromGroup.ActionTypes.Delete),
    switchMap(action =>
      this.service.delete(action.payload).pipe(
        map(_ => new fromGroup.DeleteSuccessAction(action.payload)),
        catchError(err => of(new fromGroup.DeleteFailAction(err)))
      )
    )
  );

  @Effect()
  update = this.actions$.pipe(
    ofType<fromGroup.UpdateAction>(fromGroup.ActionTypes.Update),
    switchMap(action =>
      this.service.update(action.payload.id, action.payload.update).pipe(
        map(_ => new fromGroup.UpdateSuccessAction(action.payload.update)),
        catchError(err => of(new fromGroup.UpdateFailAction(err)))
      )
    )
  );

  @Effect()
  loadPage = this.actions$.pipe(
    ofType<fromGroup.LoadPageAction>(fromGroup.ActionTypes.LoadPage),
    switchMap(action =>
      this.service
        .paged(action.payload.pageIndex, action.payload.pageSize)
        .pipe(
          map(result => new fromGroup.LoadPageSuccessAction(result)),
          catchError(err => of(new fromGroup.LoadPageFailAction(err)))
        )
    )
  );

  @Effect()
  nextPage = this.actions$.pipe(
    ofType<fromGroup.NextPageAction>(fromGroup.ActionTypes.NextPage),
    withLatestFrom(
      this.store.pipe(select(fromGroupSelectors.selectPageIndex)),
      this.store.pipe(select(fromGroupSelectors.selectPageSize))
    ),
    map(
      ([_, pageIndex, pageSize]) =>
        new fromGroup.LoadPageAction({ pageIndex, pageSize })
    )
  );

  @Effect()
  count = this.actions$.pipe(
    ofType<fromGroup.CountAction>(fromGroup.ActionTypes.Count),
    switchMap(_ =>
      this.service.count().pipe(
        map(result => new fromGroup.CountSuccessAction(result)),
        catchError(err => of(new fromGroup.CountFailAction(err)))
      )
    )
  );

  @Effect()
  search = this.actions$.pipe(
    ofType<fromGroup.SearchAction>(fromGroup.ActionTypes.Search),
    map(action => action.payload),
    withLatestFrom(
      this.store.pipe(select(fromGroupSelectors.selectPageIndex)),
      this.store.pipe(select(fromGroupSelectors.selectPageSize))
    ),
    switchMap(([search, pageIndex, pageSize]) =>
      this.service.search(search, pageIndex, pageSize).pipe(
        map(result => new fromGroup.SearchSuccessAction(result)),
        catchError(err => of(new fromGroup.SearchFailAction(err)))
      )
    )
  );

  @Effect()
  clearSearch = this.actions$.pipe(
    ofType<fromGroup.ClearSearchAction>(fromGroup.ActionTypes.ClearSearch),
    withLatestFrom(
      this.store.pipe(select(fromGroupSelectors.selectPageIndex)),
      this.store.pipe(select(fromGroupSelectors.selectPageSize))
    ),
    map(
      ([_, pageIndex, pageSize]) =>
        new fromGroup.LoadPageAction({ pageIndex, pageSize })
    )
  );

  @Effect({ dispatch: false })
  successAndNavigate = this.actions$.pipe(
    ofType<fromGroup.UpdateSuccessAction | fromGroup.DeleteSuccessAction>(
      fromGroup.ActionTypes.UpdateSuccess,
      fromGroup.ActionTypes.DeleteSuccess
    ),
    tap(_ => this.router.navigate(['/admin/groups']))
  );

  @Effect()
  getById = this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    filter(
      (action: any) =>
        action.payload.event.url.indexOf('/admin/groups') > -1 &&
        action.payload.routerState.params['groupId']
    ),
    map(action => action.payload.routerState.params['groupId']),
    switchMap(groupId =>
      this.store.pipe(
        select(fromGroupSelectors.selectGroupById(groupId)),
        filter(val => val != null),
        first(),
        map(group => new fromGroupDetail.GetByIdAction(group))
      )
    )
  );

  @Effect()
  getUsersByGroup = this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    filter(
      (action: any) =>
        action.payload.event.url.indexOf('/admin/groups') > -1 &&
        action.payload.routerState.params['groupId']
    ),
    map(action => action.payload.routerState.params['groupId']),
    switchMap(groupId =>
      this.store.pipe(
        select(fromGroupSelectors.selectGroupById(groupId)),
        filter(val => val != null),
        first(),
        map(group => group.id)
      )
    ),
    withLatestFrom(
      this.store.pipe(select(fromGroupDetailSelectors.selectPageIndex)),
      this.store.pipe(select(fromGroupDetailSelectors.selectPageSize))
    ),
    switchMap(([id, pageIndex, pageSize]) =>
      this.service.getGroupMembers(id, pageIndex, pageSize).pipe(
        map(result => new fromGroupDetail.GetUsersByGroupSuccessAction(result)),
        catchError(err =>
          of(new fromGroupDetail.GetUsersByGroupFailAction(err))
        )
      )
    )
  );
}
