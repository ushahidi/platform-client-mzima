import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MessagesService,
  MessageResult,
  MessageFilter,
  PostResult,
  PostPropertiesInterface,
} from '@mzima-client/sdk';
import { SessionService } from '@services';
import { Observable, of, map } from 'rxjs';

@Component({
  selector: 'app-post-conversation',
  templateUrl: './post-conversation.component.html',
  styleUrls: ['./post-conversation.component.scss'],
})
export class PostConversationComponent implements OnInit {
  @Input() post: PostResult | PostPropertiesInterface;
  public inputError: boolean = false;
  public messages: Observable<MessageResult[]> | any;
  public messagesTotal: number;
  public currentPage: number = 1;
  public messageLimit: number = 5;
  public newMessage = new FormControl();
  public sender: string;

  constructor(private messagesService: MessagesService, private sessionService: SessionService) {}

  ngOnInit(): void {
    this.getMessagesData();
    this.getSender();
  }

  getMessagesData() {
    this.messagesService
      .getMessagesByPost(this.post.id, <MessageFilter>{
        page: this.currentPage,
        type: 'sms',
        limit: this.messageLimit,
        orderby: 'created',
        order: 'desc',
        contact: this.post.contact.id,
      })
      .subscribe((results: Observable<MessageResult[]> | any) => {
        this.messages = this.sortByDate(of(results.results));
        this.messagesTotal = results.meta.total | 0;
      });
  }

  getSender() {
    this.sessionService.deploymentInfo$.pipe().subscribe({
      next: ({ title }) => {
        this.sender = title;
      },
    });
  }

  sortByDate(messages: Observable<MessageResult[]> | any) {
    return messages.pipe(
      map((data: any) => {
        return data.sort((a: any, b: any) => {
          if (a.created === b.created) return 0;
          return a.created > b.created ? 1 : -1;
        });
      }),
    );
  }

  addMessage() {
    const outgoingMessage = {
      contact_id: this.post.contact.id,
      post_id: this.post.id,
      message: this.newMessage.value,
      type: 'sms',
      status: 'sent',
      direction: 'outgoing',
      contact: this.post.contact.contact,
      contact_type: 'sms',
    };
    if (this.newMessage.value) {
      this.messagesService.createMessage(outgoingMessage).subscribe(() => {
        this.inputError = false;
        this.getMessagesData();
        this.newMessage.setValue('');
      });
    } else {
      this.inputError = true;
    }
  }

  nextPage() {
    if (this.currentPage * this.messageLimit < this.messagesTotal) {
      this.currentPage++;
      this.getMessagesData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getMessagesData();
    }
  }
}
