import { AfterViewInit, Directive, ElementRef, HostListener, Input } from '@angular/core';
// import { GtmTrackingService } from '@services';
import { EnumGtmEvent, EnumGtmGroup, EnumGtmSource } from '@enums';

@Directive({
  selector: '[appGtm]',
})
export class GtmDirective implements AfterViewInit {
  @Input() appGtm: { source: EnumGtmSource; group: EnumGtmGroup };

  constructor(
    private elRef: ElementRef,
    // private gtmTrackingService: GtmTrackingService,
  ) {}

  ngAfterViewInit(): void {
    this.elRef.nativeElement.setAttribute('data-event', EnumGtmEvent.GroupClick);
    this.elRef.nativeElement.setAttribute(
      'data-source',
      this.appGtm.source || EnumGtmSource.Anywhere,
    );
    this.elRef.nativeElement.setAttribute('data-group', this.appGtm.group || EnumGtmGroup.General);
  }

  // TODO: gtmTracking
  @HostListener('click', ['$event.target'])
  onClick(): void {
    // this.gtmTrackingService.registerEvent(
    //   {
    //     event: EnumGtmEvent.GroupClick,
    //     source: this.appGtm.source || EnumGtmSource.Anywhere,
    //   },
    //   GtmTrackingService.MapGroup(
    //     this.appGtm.group || EnumGtmGroup.General,
    //     this.elRef.nativeElement.innerText,
    //   ),
    // );
  }
}
