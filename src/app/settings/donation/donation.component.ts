import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DonationConfigInterface, SiteConfigInterface } from '@models';
import {
  ConfigService,
  LoaderService,
  MediaService,
  SessionService,
  BreakpointService,
} from '@services';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss'],
})
export class DonationComponent implements OnInit {
  public isDesktop$ = this.breakpointService.isDesktop$;
  public donationConfig: DonationConfigInterface;
  public images: string[] = [];
  public donationForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: ['', []],
    wallet: ['', []],
    enabled: [false, []],
  });
  public isDesktop: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private loader: LoaderService,
    private configService: ConfigService,
    private breakpointService: BreakpointService,
    private router: Router,
  ) {
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  deleteImage(id: number) {
    this.donationConfig.images = this.donationConfig.images.filter((image) => image.id !== id);
  }

  uploadFile($event: any) {
    this.loader.show();
    this.mediaService.uploadFile($event.file).subscribe((result: any) => {
      this.donationConfig.images.push({
        id: result.id,
        original_file_url: result.original_file_url,
      });
      this.images = this.donationConfig.images.map((image) => image.original_file_url);
      this.loader.hide();
    });
  }

  save() {
    this.loader.show();
    const donation: DonationConfigInterface = Object.assign({}, this.donationForm.value, {
      images: this.donationConfig.images,
    });
    this.configService.update('site', { donation }).subscribe((res: SiteConfigInterface) => {
      this.sessionService.setSiteDonationConfigurations(res.donation!);
      this.donationConfig = this.sessionService.getSiteConfigurations().donation!;
      this.loader.hide();
    });
  }

  public imageDeleted(event: any): void {
    this.donationConfig.images.splice(event, 1);
    this.images = this.donationConfig.images.map((image) => image.original_file_url);
  }

  public cancel(): void {
    !this.isDesktop ? this.router.navigate(['settings']) : this.initForm();
  }

  private initForm(): void {
    this.donationConfig = this.sessionService.getSiteConfigurations().donation!;
    this.images = this.donationConfig.images.map((image) => image.original_file_url);

    this.donationForm.patchValue({
      title: this.donationConfig.title,
      description: this.donationConfig.description,
      wallet: this.donationConfig.wallet,
      enabled: this.donationConfig.enabled,
    });
  }
}
