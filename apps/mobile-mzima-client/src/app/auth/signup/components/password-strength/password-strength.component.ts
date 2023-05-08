import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-password-strength',
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss'],
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() public passwordToCheck: string;
  @Output() passwordStrength = new EventEmitter<boolean>();

  private colors = ['var(--ion-color-danger)', 'orangered', 'orange', 'yellowgreen'];
  public bars = new Array(4);

  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    const password = changes['passwordToCheck'].currentValue;
    this.setBarColors(4, 'var(--color-neutral-20)');
    if (password) {
      const { index, color } = this.getColor(this.checkStrength(password));
      this.setBarColors(index, color);
      const pwdStrength = this.checkStrength(password);
      this.passwordStrength.emit(pwdStrength >= 20);
    }
  }

  private getColor(strength: number) {
    let index = 0;
    switch (strength) {
      case 10:
        index = 0;
        break;
      case 20:
        index = 1;
        break;
      case 30:
        index = 2;
        break;
      case 40:
        index = 3;
        break;
      default:
        index = 4;
    }
    return {
      index: index + 1,
      color: this.colors[index],
    };
  }

  private setBarColors(count: number, color: string) {
    for (let n = 0; n < count; n++) {
      this.bars[n] = color;
    }
  }

  private checkStrength(password: string) {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_@`[\]]/g;
    const lowerLetters = /[a-z]+/.test(password);
    const upperLetters = /[A-Z]+/.test(password);
    const numbers = /[0-9]+/.test(password);
    const symbols = regex.test(password);

    const flags = [lowerLetters, upperLetters, numbers, symbols];

    let passedMatches = 0;
    for (const flag of flags) {
      passedMatches += flag ? 1 : 0;
    }

    force += 2 * password.length + (password.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    force = password.length <= 6 ? Math.min(force, 10) : force;

    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 30) : force;
    force = passedMatches === 4 ? Math.min(force, 40) : force;

    return force;
  }
}
