export class Logger {

  private static separator = '================================================';

  static startForm(formName: string, mode: string) {
    console.log('\n' + this.separator);
    console.log(`FORM: ${formName}`);
    console.log(`MODE: ${mode.toUpperCase()}`);
    console.log(this.separator);
  }

  static endForm() {
    console.log(this.separator + '\n');
  }

  static step(stepNumber: number) {
    console.log(`\nSTEP ${stepNumber}`);
    console.log('------------------------------------------------');
  }

  static field(label: string) {
    console.log(`\nField: ${label}`);
  }

  static action(message: string) {
    console.log(`→ ${message}`);
  }

  static success(message: string) {
    console.log(`✓ ${message}`);
  }

  static error(message: string) {
    console.log(`✗ ${message}`);
  }

  static dropdownStart(label: string) {
    console.log(`\nDropdown: ${label}`);
    console.log('Iterating all options...');
  }

  static dropdownOption(option: string) {
    console.log(`  • ${option}`);
  }

  static dropdownSelected(option: string) {
    console.log(`✓ Selected (final): ${option}`);
  }

  static validationStart() {
    console.log(`\nValidation Mode Triggered`);
  }

  static validationError(label: string) {
    console.log(`⚠ Error detected for: ${label}`);
  }

  static validationResolved(label: string) {
    console.log(`✓ Error resolved for: ${label}`);
  }

}