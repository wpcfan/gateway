import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { EntityFormComponent } from '@app/libs/entity/entity-form.component';
import { KeycloakRole } from '@app/admin/services/auth-admin.service';

@Component({
  selector: 'tgapp-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss']
})
export class RoleDialogComponent extends EntityFormComponent<KeycloakRole> {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; payload: KeycloakRole },
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    private fb: FormBuilder
  ) {
    super(data, dialogRef);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  buildForm(item: KeycloakRole) {
    this.entityForm = this.fb.group({
      name: [item ? item.name || '' : '', Validators.required],
      description: [item ? item.description || '' : '', Validators.required]
    });
  }
}