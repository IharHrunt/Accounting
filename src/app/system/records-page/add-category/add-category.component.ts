import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CategoriesService } from '../../shared/services/categories.service';
import { Category } from '../../shared/models/category.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit, OnDestroy {

  sub1: Subscription;

  @Output() onCategoryAdd = new EventEmitter<Category>();

  constructor(private categoriesService: CategoriesService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.sub1) this.sub1.unsubscribe();
  }

  onSubmit(form: NgForm) {
    console.log(form.value);
    let { name, capacity } =  form.value;
    if (capacity < 0) {
      capacity *= -1;
    }
    const category = new Category(name, capacity);

    this.sub1 = this.categoriesService.addCategory(category)
      .subscribe((cat: Category) => {
        form.reset();
        form.form.patchValue({capacity: 1});
        this.onCategoryAdd.emit(category);
        // console.log(cat);
      });
  }

}
