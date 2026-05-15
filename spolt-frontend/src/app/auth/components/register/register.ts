import { Component, output, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, RegisterDto } from '../../services/auth.service';
import { CustomCalendar } from '../../../shared/components/custom-calendar/custom-calendar';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CustomCalendar, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  message:string="";
  @Input() loading = false;
  @Input() serverError = "";
  public sendRegister = output<RegisterDto>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      fecha_nacimiento: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  register(){
    if(this.registerForm.invalid){
      this.message= "Please correct all errors and resubmit the form";
      this.registerForm.markAllAsTouched(); // Esto hace que todos los mensajes de error aparezcan
    }else{
      this.message = "";
      this.serverError = "";
      const { terms, ...formData } = this.registerForm.value;
      const registerData: RegisterDto = {
        ...formData,
        aceptado_terminos: terms
      };
      this.sendRegister.emit(registerData);
    }
  }
}
