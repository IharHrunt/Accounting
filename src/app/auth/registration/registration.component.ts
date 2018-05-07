import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { UsersService } from '../../shared/services/users.service';
import { User } from '../../shared/models/user.model';

import { AsyncValidatorFn, AbstractControl, ValidationErrors,  } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  form: FormGroup;
  private fb1: FormBuilder;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.fb1 = fb;

  }

  ngOnInit() {
    // this.form = new FormGroup({
    //   'emailGroup': new FormGroup ({
    //     'email': new FormControl(null, [Validators.required, Validators.email], this.asyncForbiddenEmailValidator.bind(this)),
    //     'emailConfirm': new FormControl(null, [Validators.required])
    //   }, this.emailMatchValidator) ,
    //   'password': new FormControl(null, [Validators.required, Validators.minLength(6)]),
    //   'name': new FormControl(null, [Validators.required, this.rangeNumberValidator(0, 1000)]),
    //   'agree': new FormControl(false, [Validators.requiredTrue])
    // });
    // this.form.get('email').clearValidators();

    this.form = this.fb.group({
      emailGroup: this.fb.group({
          email: ['', [Validators.required, Validators.email], this.asyncForbiddenEmailValidator.bind(this)],
          emailConfirm: ['', [Validators.required]]
      }, {validator: this.emailMatchValidator}),
      password: [null, [Validators.required, Validators.minLength(6)]], // this.rangeNumberValidator(0, 1000)
      name: [null, [Validators.required]],
      agree: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    const {emailGroup, password, name} = this.form.value;
    const user = new User(emailGroup['email'].toLowerCase(), password, name);
    // console.log(user);
    this.usersService.createNewUser(user)
      .subscribe(() => {
        this.router.navigate(['/login'], {
          queryParams: {
            canLogin: true
          }
        });
      });
  }

  emailMatchValidator(c: AbstractControl): {[key: string]: boolean} | null {
    const emailControl = c.get('email');
    const confirmControl = c.get('emailConfirm');
    if (emailControl.pristine || confirmControl.pristine) {
      return null;
    }
    if (emailControl.value.toLowerCase() === confirmControl.value.toLowerCase()) {
        return null;
    }
    return { 'match': true };
 }

  rangeNumberValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl) => {
      return  ((control.value > max) || (control.value < min) || isNaN(control.value)) &&
               (control.value !== undefined) ?  {'range': true} : null;
    };
  }

  asyncForbiddenEmailValidator(control: AbstractControl) {
    return this.usersService.getUserByEmail(control.value)
      .map(user => user ? { forbiddenEmail: true } : null);
  }

  // asyncForbiddenEmailValidator(control: FormControl): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.usersService.getUserByEmail(control.value)
  //       .subscribe((user: User) => {
  //         if (user) {
  //           resolve({forbiddenEmail: true});
  //         } else {
  //           resolve(null);
  //         }
  //       });
  //   });
  // }


}
