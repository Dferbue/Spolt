import { Component, forwardRef, ElementRef, HostListener, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-calendar.html',
  styleUrls: ['./custom-calendar.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCalendar),
      multi: true
    }
  ]
})
export class CustomCalendar implements ControlValueAccessor, OnInit {
  @Input() theme: 'dark' | 'light' = 'dark';
  @Input() position: 'bottom' | 'top' = 'bottom';
  @Input() size: 'normal' | 'small' = 'normal';

  // Static reference to track which calendar is currently open globally
  private static openInstance: CustomCalendar | null = null;

  isOpen = false;
  currentMonth: Date = new Date();
  selectedDate: Date | null = null;
  daysInMonth: { date: number, isCurrentMonth: boolean, fullDate: Date }[] = [];
  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  value: string = ''; // YYYY-MM-DD
  displayValue: string = ''; // DD/MM/YYYY or whatever user types
  disabled = false;

  years: number[] = [];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 100; i <= currentYear + 10; i++) {
      this.years.push(i);
    }
    this.generateCalendar();
  }

  onMonthChange(newMonthStr: string) {
    const newMonth = parseInt(newMonthStr, 10);
    this.currentMonth = new Date(this.currentMonth.getFullYear(), newMonth, 1);
    this.generateCalendar();
  }

  onYearChange(newYearStr: string) {
    const newYear = parseInt(newYearStr, 10);
    this.currentMonth = new Date(newYear, this.currentMonth.getMonth(), 1);
    this.generateCalendar();
  }

  writeValue(value: string): void {
    this.value = value;
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        this.selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        this.currentMonth = new Date(this.selectedDate.getTime());
        this.displayValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } else {
      this.selectedDate = null;
      this.currentMonth = new Date();
      this.displayValue = '';
    }
    this.generateCalendar();
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  toggleCalendar() {
    if (!this.disabled) {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  private open() {
    // Close any other open instance first
    if (CustomCalendar.openInstance && CustomCalendar.openInstance !== this) {
      CustomCalendar.openInstance.close();
    }
    
    this.isOpen = true;
    CustomCalendar.openInstance = this;
    this.onTouched();
    this.generateCalendar();
  }

  private close() {
    this.isOpen = false;
    if (CustomCalendar.openInstance === this) {
      CustomCalendar.openInstance = null;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove non-digit characters
    let val = input.value.replace(/\D/g, '');
    
    if (val.length > 8) {
      val = val.substring(0, 8);
    }
    
    // Auto-add slashes
    if (val.length >= 5) {
      this.displayValue = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4)}`;
    } else if (val.length >= 3) {
      this.displayValue = `${val.substring(0, 2)}/${val.substring(2)}`;
    } else {
      this.displayValue = val;
    }

    input.value = this.displayValue; // Force the input view to update

    // If fully typed, try parsing immediately
    if (val.length === 8) {
      this.parseUserInput(this.displayValue);
    }
  }

  onInputBlur() {
    this.onTouched();
    this.parseUserInput(this.displayValue);
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.parseUserInput(this.displayValue);
      this.isOpen = false;
    }
  }

  parseUserInput(input: string) {
    if (!input || input.trim() === '') {
      this.value = '';
      this.selectedDate = null;
      this.onChange(this.value);
      return;
    }

    // Attempt to parse DD/MM/YYYY or DD-MM-YYYY
    const regex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const match = input.match(regex);
    if (match) {
      const d = match[1].padStart(2, '0');
      const m = match[2].padStart(2, '0');
      const y = match[3];
      
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      if (!isNaN(dateObj.getTime()) && dateObj.getDate() === parseInt(d, 10)) {
        this.selectedDate = dateObj;
        this.currentMonth = new Date(dateObj.getTime());
        this.value = `${y}-${m}-${d}`;
        this.displayValue = `${d}/${m}/${y}`;
        this.onChange(this.value);
        this.generateCalendar();
        return;
      }
    }
    // If not valid, just trigger validation failure by pushing the raw/invalid value or let angular handle format
    // But since this is a custom accessor, emitting the invalid value will trigger 'required' or pattern error depending on parent
    this.value = input;
    this.onChange(this.value);
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // First day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust so Monday is 0

    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const previousMonthLastDay = new Date(year, month, 0).getDate();

    this.daysInMonth = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      this.daysInMonth.push({
        date: previousMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, previousMonthLastDay - i)
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      this.daysInMonth.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }

    // Next month days to complete 42 cells (6 rows)
    let nextMonthDay = 1;
    while (this.daysInMonth.length < 42) {
      this.daysInMonth.push({
        date: nextMonthDay++,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, nextMonthDay - 1)
      });
    }
  }

  nextMonth(event: Event) {
    event.stopPropagation();
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  prevMonth(event: Event) {
    event.stopPropagation();
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  selectDate(day: any, event: Event) {
    event.stopPropagation();
    this.selectedDate = day.fullDate;
    
    // Format YYYY-MM-DD
    const y = this.selectedDate!.getFullYear();
    const m = String(this.selectedDate!.getMonth() + 1).padStart(2, '0');
    const d = String(this.selectedDate!.getDate()).padStart(2, '0');
    
    this.value = `${y}-${m}-${d}`;
    this.displayValue = `${d}/${m}/${y}`;
    this.onChange(this.value);
    this.isOpen = false;
  }

  isSameDate(d1: Date | null, d2: Date | null): boolean {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  }

  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  formatDateDisplay(val: string): string {
    if (!val) return '';
    const parts = val.split('-');
    if(parts.length !== 3) return val;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}
