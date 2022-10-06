import { Directive, Input, OnChanges, RendererFactory2 } from '@angular/core';
import { SessionService } from '@services';

@Directive({
  selector: '[appUserRole]',
})
export class UserRoleDirective implements OnChanges {
  @Input() appUserRole: string | string[];
  private renderer = this.rendererFactory.createRenderer(null, null);

  constructor(
    private rendererFactory: RendererFactory2, //
    private sessionService: SessionService,
  ) {}

  ngOnChanges(): void {
    this.validateAccess();
  }

  private validateAccess(): void {
    // if (this.appUserRole && !this.rolesService.hasRoles(this.appUserRole)) {
    //   this.renderer.setAttribute(this.elRef.nativeElement, 'disabled', 'true');
    //   this.renderer.setStyle(this.elRef.nativeElement, 'cursor', 'not-allowed');
    // }
  }
}
