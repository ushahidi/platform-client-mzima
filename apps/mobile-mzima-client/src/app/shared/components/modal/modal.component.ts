import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

interface ModalOptions {
  footer?: boolean;
  header?: boolean;
  offsetTop?: boolean;
  offsetBottom?: boolean;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() public isOpen: boolean;
  @Input() public closable = true;
  @Input() public options: ModalOptions = {};
  @Output() public modalClose = new EventEmitter();
  public modalOptions: ModalOptions = {
    header: true,
    footer: false,
    offsetTop: true,
    offsetBottom: true,
  };

  ngOnInit(): void {
    this.modalOptions = {
      ...this.modalOptions,
      ...this.options,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.modalOptions = {
        ...this.modalOptions,
        ...changes['options'].currentValue,
      };
    }
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
