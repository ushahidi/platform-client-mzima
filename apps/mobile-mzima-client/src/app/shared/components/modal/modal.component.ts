import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface ModalOptions {
  footer?: boolean;
  header?: boolean;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() public isOpen: boolean;
  @Input() public closable = true;
  @Input() public options: ModalOptions = {};
  @Output() public modalClose = new EventEmitter();
  public modalOptions: ModalOptions = {
    header: true,
    footer: false,
  };

  ngOnInit(): void {
    this.modalOptions = {
      ...this.modalOptions,
      ...this.options,
    };
  }

  public closeModal(): void {
    this.modalClose.emit();
  }

  public closeModalHandle(): void {
    this.modalClose.emit();
    if (this.closable) {
      this.isOpen = false;
    }
  }
}
