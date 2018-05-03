import { Component, EventEmitter, Input, OnDestroy,  OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Category } from '../../shared/models/category.model';
import { CategoriesService } from '../../shared/services/categories.service';
import { Message } from '../../../shared/models/message.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css']
})
export class EditCategoryComponent implements OnInit, OnDestroy {

  sub1: Subscription;	

  @Input() categories: Category[] = [];
  @Output() onCategoryEdit = new EventEmitter<Category>();

  currentCategoryId = 1;
  currentCategory: Category;
  message: Message;

  constructor(private categoriesService: CategoriesService) {
  }

  ngOnInit() {
    this.message = new Message('success', '');
    this.onCategoryChange();
  }

  ngOnDestroy() {
    if (this.sub1) this.sub1.unsubscribe();
  }

  onCategoryChange() {
     this.currentCategory = this.categories
       .find(c => c.id === +this.currentCategoryId);
      // console.log('this.categories = ' + this.categories);
  }

  onSubmit(form: NgForm) {
    let {capacity, name} = form.value;
    if (capacity < 0) {
      capacity *= -1;
    }

    const category = new Category(name, capacity, +this.currentCategoryId);

    this.sub1 = this.categoriesService.updateCategory(category)
      .subscribe((cat: Category) => {
        this.onCategoryEdit.emit(cat);
        this.message.text = 'Категория успешно отредактирована.';
        window.setTimeout(() => this.message.text = '', 5000);
      });
  }

}
