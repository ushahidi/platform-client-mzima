import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validateFile } from '@helpers';
import { DonationConfigInterface, SiteConfigInterface } from '@models';
import {
  ConfigService,
  LoaderService,
  MediaService,
  NotificationService,
  SessionService,
} from '@services';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss'],
})
export class DonationComponent implements OnInit {
  donationConfig: DonationConfigInterface;
  public donationForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: ['', []],
    wallet: ['', []],
    enabled: [false, []],
  });

  constructor(
    private formBuilder: FormBuilder,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private loader: LoaderService,
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {}

  ngOnInit(): void {
    this.donationConfig = this.sessionService.getSiteConfigurations().donation!;
    console.log('DONATION!', this.donationConfig);
    this.donationForm.patchValue({
      title: this.donationConfig.title,
      description: this.donationConfig.description,
      wallet: this.donationConfig.wallet,
      enabled: this.donationConfig.enabled,
    });
  }

  deleteImage(id: number) {
    this.donationConfig.images = this.donationConfig.images.filter((image) => image.id !== id);
  }

  uploadFile($event: any) {
    if (validateFile($event.target.files[0])) {
      this.loader.show();
      var reader = new FileReader();
      reader.onload = () => {
        this.mediaService.uploadFile($event.target.files[0]).subscribe((result: any) => {
          this.donationConfig.images.push({
            id: result.id,
            original_file_url: result.original_file_url,
          });
          this.loader.hide();
        });
      };
      reader.readAsDataURL($event.target.files[0]);
    } else {
      this.notificationService.showError('post.media.error_in_upload');
    }
  }

  save() {
    const donation: DonationConfigInterface = Object.assign({}, this.donationForm.value, {
      images: this.donationConfig.images,
    });
    this.configService.update('site', { donation }).subscribe((res: SiteConfigInterface) => {
      this.donationConfig = res.donation!;
    });
  }
}
