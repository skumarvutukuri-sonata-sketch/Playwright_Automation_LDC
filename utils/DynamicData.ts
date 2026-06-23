export class DefaultData {

  static getValue(label: string): string {

    const field = label.toLowerCase();

    // ---------- Name ----------

    if (field.includes('first')) {
      return 'Automation';
    }

    if (
      field.includes('last') ||
      field.includes('surname') ||
      field.includes('family')
    ) {
      return 'Tester';
    }

    // ---------- Email ----------

    if (field.includes('email')) {
      return `test${Date.now()}@mail.com`;
    }

    // ---------- Phone ----------

    if (
      field.includes('phone') ||
      field.includes('mobile') ||
      field.includes('contact')
    ) {
      return '9876543210';
    }

    // ---------- Zip ----------

    if (
      field.includes('zip') ||
      field.includes('postal')
    ) {
      return '12345';
    }

    // ---------- Address ----------

    if (field.includes('address')) {
      return '123 Test Street';
    }

    // ---------- City ----------

    if (field.includes('city')) {
      return 'Chennai';
    }

    // ---------- Comments ----------

    if (
      field.includes('comment') ||
      field.includes('message')
    ) {
      return 'Automation Test';
    }

    // ---------- Default ----------

    return 'Automation';

  }

}