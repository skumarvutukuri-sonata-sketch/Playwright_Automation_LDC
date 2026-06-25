export class DefaultData {

  /**
   * Main entry: label-based mapping
   */
  static getValue(label: string): string {

    const key = label.toLowerCase().trim();

    if (key.includes('first name') || key.includes('given name')) {
      return 'Test';
    }

    if (key.includes('last name') || key.includes('surname')) {
      return 'Jacob';
    }

    if (key.includes('email')) {
      return this.getEmail();
    }

    if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) {
      return this.getPhone();
    }

    if (key.includes('zip') || key.includes('postal')) {
      return this.getZip();
    }

    if (key.includes('city')) {
      return this.getCity();
    }

    if (key.includes('state')) {
      return this.getState();
    }

    if (key.includes('address')) {
      return this.getAddress();
    }

    if (key.includes('textarea') || key.includes('message')) {
      return this.getParagraph();
    }

    return this.getRandomText();
  }

  /**
   * Generic text
   */
  static getRandomText(): string {
    return `Test${Date.now().toString().slice(-5)}`;
  }

  /**
   * Email
   */
  static getEmail(): string {
    return `test${Date.now()}@mailinator.com`;
  }

  /**
   * Phone
   */
  static getPhone(): string {
    const number = Math.floor(
      1000000000 + Math.random() * 9000000000
    );

    return `+91${number}`;
  }

  /**
   * Textarea
   */
  static getParagraph(): string {
    return 'Playwright automation generated test data.';
  }

  static getZip(): string {
    return '500001';
  }

  static getAddress(): string {
    return '123 Test Street';
  }

  static getCity(): string {
    return 'Hyderabad';
  }

  static getState(): string {
    return 'Telangana';
  }

  /**
   * ✅ KEEP THESE (used in validation mode)
   */

  static getInvalidEmails(): string[] {
    return [
      'test',
      'test@',
      '@gmail.com',
      'test@gmail',
      'test.com'
    ];
  }

  static getInvalidPhones(): string[] {
    return [
      '1234',
      '12345678901234567890',
      '9848022338'
    ];
  }
}