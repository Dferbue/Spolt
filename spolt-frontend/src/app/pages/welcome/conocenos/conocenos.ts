import { Component } from '@angular/core';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [],
  templateUrl: './conocenos.html',
  styleUrl: './conocenos.css',
})
export class Conocenos {
  getAge(): number {
    const birthDate = new Date(2005, 0, 31); // 31 de enero de 2005 (mes 0 en JS)
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
