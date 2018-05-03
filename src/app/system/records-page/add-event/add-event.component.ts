import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Category } from '../../shared/models/category.model';
import { WFMEvent } from '../../shared/models/event.model';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { EventsService } from '../../shared/services/events.service';
import { BillService } from '../../shared/services/bill.service';
import { Bill } from '../../shared/models/bill.model';
import { Message } from '../../../shared/models/message.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit, OnDestroy {

  sub1: Subscription;
  sub2: Subscription;

  @Input() categories: Category[] = [];
  types = [
    { type: 'debet', label: 'Debet' },
    { type: 'credit', label: 'Credit' }
  ];

  message: Message = new Message('danger', '');

  constructor(private eventsService: EventsService, private billService: BillService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.sub1) {
      this.sub1.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }

  showMessage(text: string) {
    this.message.text = text;
    window.setTimeout(() => this.message.text = '', 4000);
  }

  onSubmit(form: NgForm) {
    let {amount, description, category, type} = form.value;
    if (amount < 0) {
      amount *= -1;
    }

    const event = new WFMEvent(
      type,
      amount,
      +category,
      moment().format('DD.MM.YYYY HH:mm:ss'),
      description
    );

    this.sub1 = this.billService.getBill()
      .subscribe((bill: Bill) => {
        let value = 0;
        if (type === 'credit') {
          if (amount > bill.value) {
            this.showMessage(`Insufficient amount on the account, the difference is ${amount - bill.value}`);
            return;
          } else {
            value = bill.value - amount;
          }
        } else {
          value = bill.value + amount;
        }
        this.sub2 = this.billService.updateBill({value, currency: bill.currency})
          .mergeMap(() => this.eventsService.addEvent(event))
          .subscribe(() => {
            form.setValue({
              category: '1',
              type: 'debet',
              amount: 0,
              description: ' '
            });
          });
      });

    // this.eventsService.addEvent(event);
  }

}
