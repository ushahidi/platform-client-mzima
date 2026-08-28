import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnvService } from '@services';

interface CampaignOption {
  id: number | string;
  label: string;
}

interface PostMoveModalData {
  post_id: number | string;
}

@Component({
  selector: 'app-post-move-modal',
  templateUrl: './post-move-modal.component.html',
  styleUrls: ['./post-move-modal.component.scss'],
})
export class PostMoveModalComponent implements OnInit {
  public campaigns: CampaignOption[] = [];
  public selectedCampaignId?: number | string;
  public isLoading = false;
  public isSubmitting = false;

  constructor(
    private matDialogRef: MatDialogRef<PostMoveModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostMoveModalData,
    private httpClient: HttpClient,
    private env: EnvService,
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  closeModal(): void {
    this.matDialogRef.close();
  }

  submitMove(): void {
    if (this.isSubmitting || !this.data?.post_id || !this.selectedCampaignId) return;

    this.isSubmitting = true;

    const params = new HttpParams()
      .set('post_id', this.data.post_id.toString())
      .set('form_id', this.selectedCampaignId.toString());

    this.httpClient
      .get<any>(`${this.env.environment.backend_url + this.env.environment.api_v5}posts/move`, {
        params,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.matDialogRef.close(true);
          window.location.reload();
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
  }

  private loadCampaigns(): void {
    this.isLoading = true;

    const params = new HttpParams().set('only', 'name,id,color').set('show_unknown_form', 'true');

    this.httpClient
      .get<any>(`${this.env.environment.backend_url + this.env.environment.api_v5}surveys`, {
        params,
      })
      .subscribe({
        next: (response) => {
          const results = response?.results ?? [];
          this.campaigns = this.mapCampaignOptions(results);
          if (this.campaigns.length > 0) {
            this.selectedCampaignId = this.campaigns[0].id;
          }
          this.isLoading = false;
        },
        error: () => {
          this.campaigns = [];
          this.isLoading = false;
        },
      });
  }

  private mapCampaignOptions(groups: any[]): CampaignOption[] {
    return (groups || [])
      .filter((group: any) => group.id > 0)
      .map((group: any) => ({
        id: group.id,
        label: group.name ?? String(group.id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
}
