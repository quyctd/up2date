import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { NameValidator, EmailValidator, UsernameValidator, PasswordValidator, RepeatPasswordValidator } from './validator';
import { AuthService as MyAuthService } from '../auth.service';
import {Router} from '@angular/router';

import { AuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  user: SocialUser;
  router;
  isChecked = false;
  btnDisable = true;

  // tslint:disable-next-line:variable-name
  constructor( private formBuilder: FormBuilder, private api: MyAuthService, _router: Router, private authService: AuthService) {
    this.router = _router;
  }

  ngOnInit() {
    // Init form
    this.form = this.formBuilder.group({
      name : new FormControl('', NameValidator),
      email : new FormControl('', EmailValidator),
      username : new FormControl('', UsernameValidator),
      password : new FormControl('', PasswordValidator),
      re_password : new FormControl('', [
        Validators.required,
      ]),
    },  {validator: RepeatPasswordValidator }
    );

    // Init authentic
    if (localStorage.getItem('currentToken') != null) {
      this.router.navigateByUrl('/newest');
    }
  }

  get name() {
    return this.form.get('name');
  }

  get email() {
    return this.form.get('email');
  }

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }

  get re_password() {
    return this.form.get('re_password');
  }


  toggleTerm() {
    this.isChecked = !this.isChecked;
    this.btnDisable = !this.isChecked;
  }

  doBasicRegister(): void {
    const formData = {
      name: this.name.value,
      email : this.email.value,
      username : this.username.value,
      password: this.password.value,
      re_password : this.re_password.value
    };
    this.api.basicRegister(formData).subscribe(
      data => {
        console.log("Success: " + data);
        localStorage.setItem('currentToken', JSON.stringify({ token: data.key}));
        this.getUserData(data.key);
        this.router.navigateByUrl('/newest');
      },
      error => {
        console.log("ERROR", error);
        if ( error.error.email) {
          this.email.setErrors({ emailExist : true });
        }
        if (error.error.username) {
          this.username.setErrors({ usernameExist : error.error.username[0]});

        }
      }
    );
  }

  doFacebookRegister(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(
        x => {
          const authToken = x.authToken;
          this.api.loginFacebook(authToken).subscribe(
            data => {
              console.log(data);
              localStorage.setItem('currentToken', JSON.stringify({ token: data.key}));
              this.getUserData(data.key);
              this.router.navigateByUrl('/newest');
            },
            error => {
              console.log("Login error");
            }
          );
        },
        error => {
          console.log("ERROR");
        }
      );
  }

  doGoogleRegister() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      x => {
        const authToken = x.authToken;
        this.api.loginGoogle(authToken).subscribe(
          data => {
            console.log(data);
            localStorage.setItem('currentToken', JSON.stringify({ token: data.key}));
            this.getUserData(data.key);
            this.router.navigateByUrl('/newest');
          },
          error => {
            console.log("Login error");
          }
        );
      },
      error => {
        console.log("ERROR");
      }
    );

  }

  doGithubRegister() {

  }

  getUserData(token) {
    this.api.getUserDataFromToken(token).subscribe(
      data => {
        const nameOfUser = data.name ? data.name : data.username;
        localStorage.setItem('currentUser', JSON.stringify({ id: data.id, name: nameOfUser, username: data.username, email: data.email}));
      },
      error => {
        console.log("Error");
      }
    );
  }
}
