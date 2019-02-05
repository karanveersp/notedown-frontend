import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  isLoading = true;
  signUpForm: FormGroup;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = false;
    this.signUpForm = new FormGroup({});
    this.signUpForm.addControl(
      'email',
      new FormControl(null, [Validators.required, Validators.email])
    );
    this.signUpForm.addControl(
      'password',
      new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[#$^=!*@&%]).{6,}$')
      ])
    );
    this.signUpForm.addControl(
      'confirmPassword',
      new FormControl(null, [
        Validators.required,
        this.passwordMatchValidator.bind(this)
      ])
    );
  }

  passwordMatchValidator(control: FormControl) {
    return control.value === this.signUpForm.get('password').value
      ? null
      : { mismatch: true };
  }

  onSignup() {
    this.isLoading = true;
    this.signUpForm.updateValueAndValidity();
    if (this.signUpForm.invalid) return;
    this.authService.signup(
      this.signUpForm.value.email,
      this.signUpForm.value.password
    );
  }
}
