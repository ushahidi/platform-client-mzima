import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactsInterface } from '@mzima-client/sdk';

export interface DeleteContactModalData {
  contacts: ContactsInterface[];
  contactId: number;
}

@Component({
  selector: 'app-delete-contact-modal',
  templateUrl: './delete-contact-modal.component.html',
  styleUrls: ['./delete-contact-modal.component.scss'],
})
export class DeleteContactModalComponent {
  public notificationSwitches: boolean[] = [];
  public contacts: ContactsInterface[] = [];

  constructor(
    private matDialogRef: MatDialogRef<DeleteContactModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteContactModalData,
  ) {
    // Create an array of can_notify booleans, excluding the contact to be deleted.
    this.contacts = this.data.contacts.filter((contact) => contact.id != this.data.contactId);
    this.contacts.forEach((contact) => {
      this.notificationSwitches.push(contact.can_notify);
    });
  }

  cancel() {
    this.matDialogRef.close();
  }

  submit() {
    // Empty contacts array and then fill with modified contacts for updating.
    this.contacts = [];
    this.data.contacts
      .filter((contact) => contact.id != this.data.contactId)
      .forEach((contact, i) => {
        if (contact.can_notify !== this.notificationSwitches[i]) {
          contact.can_notify = this.notificationSwitches[i];
          this.contacts.push(contact);
        }
      });

    this.matDialogRef.close(this.contacts);
  }
}
