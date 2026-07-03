// export class DefaultData {

//   /**
//    * Main entry: label-based mapping
//    */
//   static getValue(label: string): string {

//     const key = label.toLowerCase().trim();

//     if (key.includes('first name') || key.includes('given name')) {
//       return 'Harish';
//     }

//     if (key.includes('last name') || key.includes('surname')) {
//       return 'Sagiraju';
//     }

//     if (key.includes('email')) {
//       return this.getEmail();
//     }

//     if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) {
//       return this.getPhone();
//     }

//     if (key.includes('zip') || key.includes('postal')) {
//       return this.getZip();
//     }

//     if (key.includes('city')) {
//       return this.getCity();
//     }

//     if (key.includes('state')) {
//       return this.getState();
//     }

//     if (key.includes('address')) {
//       return this.getAddress();
//     }

//     if (key.includes('textarea') || key.includes('message')) {
//       return this.getParagraph();
//     }

//     return this.getRandomText();
//   }

//   /**
//    * Generic text
//    */
//   static getRandomText(): string {
//     return `Test${Date.now().toString().slice(-5)}`;
//   }

//   /**
//    * Email
//    */
//   static getEmail(): string {
//     return `test${Date.now()}@mailinator.com`;
//   }

//   /**
//    * Phone
//    */
//   static getPhone(): string {
//     const number = Math.floor(
//       1000000000 + Math.random() * 9000000000
//     );

//     return `+91${number}`;
//   }

//   /**
//    * Textarea
//    */
//   static getParagraph(): string {
//     return 'Playwright automation generated test data.';
//   }

//   static getZip(): string {
//     return '500001';
//   }

//   static getAddress(): string {
//     return '123 Test Street';
//   }

//   static getCity(): string {
//     return 'Hyderabad';
//   }

//   static getState(): string {
//     return 'Telangana';
//   }

//   /**
//    * ✅ KEEP THESE (used in validation mode)
//    */

//   static getInvalidEmails(): string[] {
//     return [
//       'test',
//       'test@',
//       '@gmail.com',
//       'test@gmail',
//       'test.com'
//     ];
//   }

//   static getInvalidPhones(): string[] {
//     return [
//       '1234',
//       '12345678901234567890',
//       '9876543210'
//     ];
//   }
// }

import { faker } from '@faker-js/faker';

export class DefaultData {

  /**
   * Main entry: label-based mapping
   */
  static getValue(label: string): string {
    const key = label.toLowerCase().trim();

    if (key.includes('first name') || key.includes('given name')) return this.getFirstName();
    if (key.includes('last name') || key.includes('surname')) return this.getLastName();
    if (key.includes('email')) return this.getEmail();
    if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) return this.getPhone();
    if (key.includes('zip') || key.includes('postal')) return this.getZip();
    if (key.includes('city')) return this.getCity();
    if (key.includes('state')) return this.getState();
    if (key.includes('address')) return this.getAddress();
    if (key.includes('textarea') || key.includes('message')) return this.getParagraph();

    return this.getRandomText();
  }

  // ==========================================
  // 🎲 100% DYNAMIC FAKER DATA
  // ==========================================

  static getFirstName(): string {
    return faker.person.firstName(); // e.g., 'John', 'Priya'
  }

  static getLastName(): string {
    return faker.person.lastName(); // e.g., 'Doe', 'Patel'
  }

  static getEmail(): string {
    // Generates completely random emails but keeps them in your mailinator inbox!
    // e.g., 'swift.john171@mailinator.com'
    const randomWord = faker.word.adjective();
    const randomName = faker.person.firstName();
    return `${randomWord}.${randomName}${Date.now().toString().slice(-4)}@mailinator.com`.toLowerCase();
  }

  static getPhone(): string {
    // Keeps your +91 prefix, but generates 10 completely random digits after it
    return `+91${faker.string.numeric(10)}`; 
  }

  static getZip(): string {
    return faker.location.zipCode('######'); // Generates a random 6-digit zip code
  }

  static getAddress(): string {
    return faker.location.streetAddress(); // e.g., '1234 Elm Street'
  }

  static getCity(): string {
    return faker.location.city(); 
  }

  static getState(): string {
    return faker.location.state(); 
  }

  static getParagraph(): string {
    return faker.lorem.sentence(); // Generates a random realistic sentence
  }

  static getRandomText(): string {
    return faker.commerce.productName(); // e.g., 'Incredible Steel Hat'
  }

  // ==========================================
  // 🛑 INVALID DATA (Used for Validation Mode)
  // ==========================================

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
      '9876543210' // Invalid without country code (if your CRM requires +91)
    ];
  }
}