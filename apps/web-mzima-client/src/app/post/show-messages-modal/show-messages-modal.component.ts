import { Component, Input } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { MessagesService, MessageResult, MessageFilter } from '@mzima-client/sdk';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-show-messages-modal',
  templateUrl: './show-messages-modal.component.html',
  styleUrls: ['./show-messages-modal.component.scss'],
})
export class ShowMessagesModalComponent {
  @Input() postId: number | string = 1;
  public messages: Observable<MessageResult[]>;
  public messagesTotal: number;
  public currentPage: number = 1;
  constructor(
    private matDialogRef: MatDialogRef<ShowMessagesModalComponent>,
    private messagesService: MessagesService,
  ) {
    this.getMessagesData();
  }

  getMessagesData() {
    this.messagesService
      .getMessagesByPost(this.postId, <MessageFilter>{ page: this.currentPage })
      .subscribe((results) => {
        this.messages = of(results.results);
        this.messagesTotal = results.total_count;
      });
  }

  nextPage() {
    this.currentPage++;
    this.getMessagesData();
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;

    this.getMessagesData();
  }

  addMessage() {
    const testMessage = {
      post_id: 1,
      title: '',
      message: 'Another test message 15',
      type: 'sms',
      status: 'received',
      direction: 'outgoing',
    };
    this.messagesService.createMessage({ testMessage }).subscribe(() => {
      this.getMessagesData();
    });
  }

  close() {
    this.matDialogRef.close();
  }
}
