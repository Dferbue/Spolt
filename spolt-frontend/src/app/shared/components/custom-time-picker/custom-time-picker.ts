import { Component, forwardRef, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-time-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-time-picker.html',
  styleUrl: './custom-time-picker.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTimePicker),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None
})
export class CustomTimePicker implements ControlValueAccessor {
  placeholder = '00:00';
  isOpen = signal(false);

  selectedHour = signal(12);
  selectedMinute = signal(0);
  currentValue = signal<string>('');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h)) this.selectedHour.set(Math.min(23, Math.max(0, h)));
      if (!isNaN(m)) this.selectedMinute.set(Math.min(59, Math.max(0, m)));
      this.currentValue.set(value.substring(0, 5));
    } else {
      this.currentValue.set('');
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  openPicker() { this.isOpen.set(true); }
  closePicker() { this.isOpen.set(false); }

  adjustHour(step: number) {
    this.selectedHour.set((this.selectedHour() + step + 24) % 24);
  }

  adjustMinute(step: number) {
    this.selectedMinute.set((this.selectedMinute() + step + 60) % 60);
  }

  setMinute(m: number) {
    this.selectedMinute.set(m);
  }

  onHourInput(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.selectedHour.set(Math.min(23, Math.max(0, val)));
    }
  }

  onMinuteInput(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.selectedMinute.set(Math.min(59, Math.max(0, val)));
    }
  }

  formatUnit(val: number): string {
    return val.toString().padStart(2, '0');
  }

  getFormattedCurrent(): string {
    return this.currentValue() || this.placeholder;
  }

  confirmSelection() {
    const val = `${this.formatUnit(this.selectedHour())}:${this.formatUnit(this.selectedMinute())}`;
    this.currentValue.set(val);
    this.onChange(val);
    this.onTouched();
    this.closePicker();
  }
}
