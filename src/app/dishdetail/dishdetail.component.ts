import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from '../shared/comment';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
 })
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;
  commentForm: FormGroup;
  comment: Comment;
  currentDate: Date;
  visibility ="shown";

    formErrors = {
      'comment': '',
      'author': ''
    };

    validationMessages = {
      'comment': {
        'required':      'Comment is required.',
      },
      'author': {
        'required':      'Autor is required.',
        'minlength':     'Autor must be at least 2 characters long.'
      }
    };

    constructor(private dishservice: DishService,
      private route: ActivatedRoute,
      private location: Location,
      private fb: FormBuilder) {
        this.currentDate  = new Date();
        this.createForm();
    }

    ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params
        .switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); })
        .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; });
    }

    createForm() {
      this.commentForm = this.fb.group({
        rating: 5,
        comment: ['', Validators.required ],
        author: ['', [Validators.required, Validators.minLength(2)] ],
        date: ''
      });

      this.commentForm.valueChanges
        .subscribe(data => this.onValueChanged(data));
         this.onValueChanged(); // (re)set validation messages now
    }


    onValueChanged(data?: any) {
      if (!this.commentForm) { return; }
      const form = this.commentForm;
      for (const field in this.formErrors) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    }

    onSubmit() {
      this.commentForm.patchValue({date: this.currentDate.toISOString()});
      this.comment = this.commentForm.value;
      this.dish.comments.push(this.comment);
      this.commentForm.reset({
        rating: 5,
        comment: '',
        author: '',
        date: ''
      });
    }

    

    setPrevNext(dishId: number) {
      let index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

    goBack(): void {
      this.location.back();
    }

}
