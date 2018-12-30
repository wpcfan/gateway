import { createSelector } from '@ngrx/store';
import { schema, denormalize } from 'normalizr';
import { selectAdminState } from './admin.state';
import { KeycloakGroupDTO, KeycloakGroup } from '../admin.model';
import * as fromUser from './group.reducer';

export const selectGroupState = createSelector(
  selectAdminState,
  state => state.group
);

export const {
  selectIds: selectIds,
  selectEntities: selectEntities,
  selectAll: selectAll
} = fromUser.adapter.getSelectors(selectGroupState);

export const selectCount = createSelector(
  selectGroupState,
  state => state.count
);

export const selectPageIndex = createSelector(
  selectGroupState,
  state => state.pageIndex
);

export const selectPageSize = createSelector(
  selectGroupState,
  state => state.pageSize
);

export const selectSearch = createSelector(
  selectGroupState,
  state => state.search
);

export const selectTopLevelNodeIds = createSelector(
  selectGroupState,
  state => state.topLevelNodeIds
);

export const selectAllInTree = createSelector(
  selectEntities,
  selectTopLevelNodeIds,
  (groups, topIds) => {
    const group = new schema.Entity('group');
    group.define({
      subGroups: [group]
    });

    const denormalizeData = denormalize(topIds, [group], {
      group: groups
    });
    return denormalizeData as KeycloakGroup[];
  }
);

export const selectGroupById = (id: string) =>
  createSelector(
    selectEntities,
    entities => getGroup(id, entities)
  );

const getGroup = (
  id: string,
  entities: { [id: string]: KeycloakGroupDTO }
): KeycloakGroup => {
  if (entities[id] == null) {
    return null;
  }
  return {
    ...entities[id],
    subGroups: entities[id].subGroups.map(groupId =>
      getGroup(groupId, entities)
    )
  };
};