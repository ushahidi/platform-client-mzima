import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-deployment-modal',
  template: `
    <div class="modal-wrapper">
      <h2 class="modal-title">Are you sure you want to delete this deployment?</h2>

      <p class="modal-description">
        Deleting means that from now you will not see it in your deployment list.
      </p>

      <ion-footer>
        <ion-buttons class="modal-buttons">
          <app-button fill="clear" color="medium" (click)="dismissModal()">Cancel</app-button>
          <app-button fill="clear" color="danger" (click)="deleteItem(deploymentId)">
            Delete
          </app-button>
        </ion-buttons>
      </ion-footer>
    </div>
  `,
  styleUrls: ['./delete-deployment-modal.component.scss'],
})
export class DeleteDeploymentModalComponent {
  @Input() deploymentId: number;

  constructor(private modalController: ModalController) {}

  public deleteItem(id: number) {
    this.closeModal(id, 'success');
  }

  public dismissModal() {
    this.closeModal(null, 'cancel');
  }

  private closeModal(deploymentId: number | null, status: string): void {
    this.modalController.dismiss(deploymentId, status);
  }
}
