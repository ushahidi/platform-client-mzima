import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IonModal } from '@ionic/angular';

interface ModalOptions {
  footer?: boolean;
  header?: boolean;
  offsetTop?: boolean;
  offsetBottom?: boolean;
  searchForm?: boolean;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() public isOpen: boolean;
  @Input() public closable = true;
  @Input() public title: string;
  @Input() public options: ModalOptions = {};
  @Output() public modalClose = new EventEmitter();
  @Output() public search = new EventEmitter<string>();
  @Output() back = new EventEmitter();
  @ViewChild('modal') modal: IonModal;
  public modalOptions: ModalOptions = {
    header: true,
    footer: false,
    offsetTop: true,
    offsetBottom: true,
    searchForm: false,
  };
  public searchFormValue = '';
  public isSearchView = false;

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

  public closeModal(force = false): void {
    this.modalClose.emit();
    if (this.closable || force) {
      this.modal.dismiss();
    }
  }

  public closeModalHandle(): void {
    this.modalClose.emit();
  }

  public goBackThenCloseModal(): void {
    this.back.emit();
    this.closeModalHandle();
  }

  public searchQueryChanged(): void {
    this.search.emit(this.searchFormValue);
  }
}
