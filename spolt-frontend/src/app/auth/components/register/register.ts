import { Component, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, RegisterDto } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  message:string="";
  public sendRegister = output<RegisterDto>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      fecha_nacimiento: ['', Validators.required]
    });
  }

  register(){
    if(this.registerForm.invalid){
      this.message= "Please correct all errors and resubmit the form";
      this.registerForm.markAllAsTouched(); // Esto hace que todos los mensajes de error aparezcan
    }else{
      const register:RegisterDto = this.registerForm.value;
      this.sendRegister.emit(register);
    }
  }
}
