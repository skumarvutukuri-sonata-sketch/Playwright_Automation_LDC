// // // export class DefaultData {

// // //   /**
// // //    * Main entry: label-based mapping
// // //    */
// // //   static getValue(label: string): string {

// // //     const key = label.toLowerCase().trim();

// // //     if (key.includes('first name') || key.includes('given name')) {
// // //       return 'Harish';
// // //     }

// // //     if (key.includes('last name') || key.includes('surname')) {
// // //       return 'Jacob';
// // //     }

// // //     if (key.includes('email')) {
// // //       return this.getEmail();
// // //     }

// // //     if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) {
// // //       return this.getPhone();
// // //     }

// // //     if (key.includes('zip') || key.includes('postal')) {
// // //       return this.getZip();
// // //     }

// // //     if (key.includes('city')) {
// // //       return this.getCity();
// // //     }

// // //     if (key.includes('state')) {
// // //       return this.getState();
// // //     }

// // //     if (key.includes('address')) {
// // //       return this.getAddress();
// // //     }

// // //     if (key.includes('textarea') || key.includes('message')) {
// // //       return this.getParagraph();
// // //     }

// // //     return this.getRandomText();
// // //   }

// // //   /**
// // //    * Generic text
// // //    */
// // //   static getRandomText(): string {
// // //     return `Test${Date.now().toString().slice(-5)}`;
// // //   }

// // //   /**
// // //    * Email
// // //    */
// // //   static getEmail(): string {
// // //     return `test${Date.now()}@mailinator.com`;
// // //   }

// // //   /**
// // //    * Phone
// // //    */
// // //   static getPhone(): string {
// // //     const number = Math.floor(
// // //       1000000000 + Math.random() * 9000000000
// // //     );

// // //     return `+91${number}`;
// // //   }

// // //   /**
// // //    * Textarea
// // //    */
// // //   static getParagraph(): string {
// // //     return 'Playwright automation generated test data.';
// // //   }

// // //   static getZip(): string {
// // //     return '500001';
// // //   }

// // //   static getAddress(): string {
// // //     return '123 Test Street';
// // //   }

// // //   static getCity(): string {
// // //     return 'Hyderabad';
// // //   }

// // //   static getState(): string {
// // //     return 'Telangana';
// // //   }

// // //   /**
// // //    * ✅ KEEP THESE (used in validation mode)
// // //    */

// // //   static getInvalidEmails(): string[] {
// // //     return [
// // //       'test',
// // //       'test@',
// // //       '@gmail.com',
// // //       'test@gmail',
// // //       'test.com'
// // //     ];
// // //   }

// // //   static getInvalidPhones(): string[] {
// // //     return [
// // //       '1234',
// // //       '12345678901234567890',
// // //       '9876543210'
// // //     ];
// // //   }
// // // }

// // export class DefaultData {
// //   private static pick(values: string[]): string {
// //     return values[Math.floor(Math.random() * values.length)];
// //   }

// //   private static randomDigits(length: number): string {
// //     let value = '';
// //     for (let i = 0; i < length; i++) {
// //       value += Math.floor(Math.random() * 10).toString();
// //     }
// //     return value;
// //   }

// //   private static randomAlnum(length: number): string {
// //     const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
// //     let value = '';
// //     for (let i = 0; i < length; i++) {
// //       value += chars[Math.floor(Math.random() * chars.length)];
// //     }
// //     return value;
// //   }

// //   private static readonly firstNames = [
// //     'Liam',
// //     'Noah',
// //     'Olivia',
// //     'Emma',
// //     'Ava',
// //     'Mia',
// //     'John',
// //     'Priya',
// //     'Aarav',
// //     'Ananya'
// //   ];

// //   private static readonly lastNames = [
// //     'Sharma',
// //     'Patel',
// //     'Alex',
// //     'Roy',
// //     'Smith',
// //     'Johnson',
// //     'Brown',
// //     'Khan',
// //     'Mehta',
// //     'Singh'
// //   ];

// //   private static readonly streetNames = [
// //     'Maple Street',
// //     'Cedar Avenue',
// //     'Lake View Road',
// //     'Hillcrest Lane',
// //     'Park Boulevard'
// //   ];

// //   private static readonly cities = [
// //     'Hyderabad',
// //     'Bengaluru',
// //     'Chennai',
// //     'Pune',
// //     'Mumbai',
// //     'Delhi'
// //   ];

// //   private static readonly states = [
// //     'Telangana',
// //     'Karnataka',
// //     'Tamil Nadu',
// //     'Maharashtra',
// //     'Delhi'
// //   ];

// //   private static readonly adjectives = [
// //     'rapid',
// //     'bright',
// //     'calm',
// //     'smart',
// //     'swift',
// //     'agile'
// //   ];

// //   private static readonly products = [
// //     'Automation Plan',
// //     'QA Bundle',
// //     'Cloud Toolkit',
// //     'Dashboard Suite',
// //     'Testing Kit'
// //   ];

// //   /**
// //    * Main entry: label-based mapping
// //    */
// //   static getValue(label: string): string {
// //     const key = label.toLowerCase().trim();

// //     if (key.includes('first name') || key.includes('given name')) return this.getFirstName();
// //     if (key.includes('last name') || key.includes('surname')) return this.getLastName();
// //     if (key.includes('email')) return this.getEmail();
// //     if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) return this.getPhone();
// //     if (key.includes('zip') || key.includes('postal')) return this.getZip();
// //     if (key.includes('city')) return this.getCity();
// //     if (key.includes('state')) return this.getState();
// //     if (key.includes('address')) return this.getAddress();
// //     if (key.includes('textarea') || key.includes('message')) return this.getParagraph();

// //     return this.getRandomText();
// //   }

// //   static getFirstName(): string {
// //     return this.pick(this.firstNames);
// //   }

// //   static getLastName(): string {
// //     return this.pick(this.lastNames);
// //   }

// //   static getEmail(): string {
// //     const randomWord = this.pick(this.adjectives);
// //     const randomName = this.getFirstName();
// //     return `${randomWord}.${randomName}${Date.now().toString().slice(-4)}@mailinator.com`.toLowerCase();
// //   }

// //   static getPhone(): string {
// //     return `+91${this.randomDigits(10)}`;
// //   }

// //   static getZip(): string {
// //     return this.randomDigits(6);
// //   }

// //   static getAddress(): string {
// //     return `${Math.floor(1 + Math.random() * 9999)} ${this.pick(this.streetNames)}`;
// //   }

// //   static getCity(): string {
// //     return this.pick(this.cities);
// //   }

// //   static getState(): string {
// //     return this.pick(this.states);
// //   }

// //   static getParagraph(): string {
// //     return `Automation input ${this.randomAlnum(12)} generated for validation flow.`;
// //   }

// //   static getRandomText(): string {
// //     return `${this.pick(this.products)} ${this.randomAlnum(6)}`;
// //   }

// //   // ==========================================
// //   // 🛑 INVALID DATA (Used for Validation Mode)
// //   // ==========================================

// //   static getInvalidEmails(): string[] {
// //     return [
// //       'test',
// //       'test@',
// //       '@gmail.com',
// //       'test@gmail',
// //       'test.com'
// //     ];
// //   }

// //   static getInvalidPhones(): string[] {
// //     return [
// //       '1234',
// //       '12345678901234567890',
// //       '9876543210' // Invalid without country code (if your CRM requires +91)
// //     ];
// //   }
// // }

// export class DefaultData {
//   private static pick(values: string[]): string {
//     return values[Math.floor(Math.random() * values.length)];
//   }

//   private static randomDigits(length: number): string {
//     let value = '';
//     for (let i = 0; i < length; i++) {
//       value += Math.floor(Math.random() * 10).toString();
//     }
//     return value;
//   }

//   private static randomAlnum(length: number): string {
//     const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
//     let value = '';
//     for (let i = 0; i < length; i++) {
//       value += chars[Math.floor(Math.random() * chars.length)];
//     }
//     return value;
//   }

//   private static readonly firstNames = [
//     'Liam', 'Noah', 'Olivia', 'Emma', 'Ava',
//     'Mia', 'John', 'Priya', 'Aarav', 'Ananya'
//   ];

//   private static readonly lastNames = [
//     'Sharma', 'Patel', 'Alex', 'Roy', 'Smith',
//     'Johnson', 'Brown', 'Khan', 'Mehta', 'Singh'
//   ];

//   private static readonly streetNames = [
//     'Maple Street', 'Cedar Avenue', 'Lake View Road',
//     'Hillcrest Lane', 'Park Boulevard'
//   ];

//   private static readonly cities = [
//     'Hyderabad', 'Bengaluru', 'Chennai', 'Pune', 'Mumbai', 'Delhi'
//   ];

//   private static readonly states = [
//     'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi'
//   ];

//   private static readonly products = [
//     'Automation Plan', 'QA Bundle', 'Cloud Toolkit', 'Dashboard Suite', 'Testing Kit'
//   ];

//   /**
//    * Main entry: label-based mapping
//    * 🚀 UPDATED: Added mode and groupId as optional parameters so they can be passed down to getEmail
//    */
//   static getValue(label: string, mode: 'positive' | 'negative' = 'positive', groupId: string = 'TEST-GROUP'): string {
//     const key = label.toLowerCase().trim();

//     if (key.includes('first name') || key.includes('given name')) return this.getFirstName();
//     if (key.includes('last name') || key.includes('surname')) return this.getLastName();
//     if (key.includes('email')) return this.getEmail(mode, groupId); // Passes mode and ID to the generator
//     if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) return this.getPhone();
//     if (key.includes('zip') || key.includes('postal')) return this.getZip();
//     if (key.includes('city')) return this.getCity();
//     if (key.includes('state')) return this.getState();
//     if (key.includes('address')) return this.getAddress();
//     if (key.includes('textarea') || key.includes('message')) return this.getParagraph();

//     return this.getRandomText();
//   }

//   static getFirstName(): string {
//     return this.pick(this.firstNames);
//   }

//   static getLastName(): string {
//     return this.pick(this.lastNames);
//   }

//   /**
//    * 🚀 UPDATED: Dynamic Email Generator
//    * Formats: 
//    * Positive: skumarvutukuri-sonata+test+{MMDDYYYY}+{groupId}@2u.com
//    * Negative: skumarvutukuri-sonata+test+{MMDDYYYY}1+{groupId}@2u.com
//    */
//   static getEmail(mode: 'positive' | 'negative' = 'positive', groupId: string = 'TEST-GROUP'): string {
//     const today = new Date();
//     const mm = String(today.getMonth() + 1).padStart(2, '0');
//     const dd = String(today.getDate()).padStart(2, '0');
//     const yyyy = today.getFullYear();
//     const currentDate = `${mm}${dd}${yyyy}`; // e.g., 08212026

//     // Append '1' for negative scenarios
//     const dateSuffix = mode === 'negative' ? '1' : '';

//     return `skumarvutukuri-sonata+test+${currentDate}${dateSuffix}+${groupId}@2u.com`.toLowerCase();
//   }

//   static getPhone(): string {
//     return `+91${this.randomDigits(10)}`;
//   }

//   static getZip(): string {
//     return this.randomDigits(6);
//   }

//   static getAddress(): string {
//     return `${Math.floor(1 + Math.random() * 9999)} ${this.pick(this.streetNames)}`;
//   }

//   static getCity(): string {
//     return this.pick(this.cities);
//   }

//   static getState(): string {
//     return this.pick(this.states);
//   }

//   static getParagraph(): string {
//     return `Automation input ${this.randomAlnum(12)} generated for validation flow.`;
//   }

//   static getRandomText(): string {
//     return `${this.pick(this.products)} ${this.randomAlnum(6)}`;
//   }

//   // ==========================================
//   // 🛑 INVALID DATA (Used for Validation Mode)
//   // ==========================================

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
//       '9876543210' // Invalid without country code (if your CRM requires +91)
//     ];
//   }
// }

export class DefaultData {
  private static pick(values: string[]): string {
    return values[Math.floor(Math.random() * values.length)];
  }

  private static randomDigits(length: number): string {
    let value = '';
    for (let i = 0; i < length; i++) {
      value += Math.floor(Math.random() * 10).toString();
    }
    return value;
  }

  private static randomAlnum(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let i = 0; i < length; i++) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }
    return value;
  }

  private static readonly firstNames = [
    'Liam', 'Noah', 'Olivia', 'Emma', 'Ava',
    'Mia', 'John', 'Priya', 'Aarav', 'Ananya'
  ];

  private static readonly lastNames = [
    'Sharma', 'Patel', 'Alex', 'Roy', 'Smith',
    'Johnson', 'Brown', 'Khan', 'Mehta', 'Singh'
  ];

  private static readonly streetNames = [
    'Maple Street', 'Cedar Avenue', 'Lake View Road',
    'Hillcrest Lane', 'Park Boulevard'
  ];

  private static readonly cities = [
    'Hyderabad', 'Bengaluru', 'Chennai', 'Pune', 'Mumbai', 'Delhi'
  ];

  private static readonly states = [
    'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi'
  ];

  private static readonly products = [
    'Automation Plan', 'QA Bundle', 'Cloud Toolkit', 'Dashboard Suite', 'Testing Kit'
  ];

  /**
   * Main entry: label-based mapping
   * 🚀 Passes mode and groupId directly down to getEmail
   */
  static getValue(label: string, mode: 'positive' | 'negative' = 'positive', groupId: string = 'TEST-GROUP'): string {
    const key = label.toLowerCase().trim();

    if (key.includes('first name') || key.includes('given name')) return this.getFirstName();
    if (key.includes('last name') || key.includes('surname')) return this.getLastName();
    
    // 🔥 The email function now dynamically handles the Group ID and test mode
    if (key.includes('email')) return this.getEmail(mode, groupId); 
    
    if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) return this.getPhone();
    if (key.includes('zip') || key.includes('postal')) return this.getZip();
    if (key.includes('city')) return this.getCity();
    if (key.includes('state')) return this.getState();
    if (key.includes('address')) return this.getAddress();
    if (key.includes('textarea') || key.includes('message')) return this.getParagraph();

    return this.getRandomText();
  }

  static getFirstName(): string {
    return this.pick(this.firstNames);
  }

  static getLastName(): string {
    return this.pick(this.lastNames);
  }

  /**
   * 🚀 Dynamic Email Generator
   * Formats: 
   * Positive: skumarvutukuri-sonata+test+{MMDDYYYY}+{groupId}@2u.com
   * Negative: skumarvutukuri-sonata+test+{MMDDYYYY}1+{groupId}@2u.com
   */
  static getEmail(mode: 'positive' | 'negative' = 'positive', groupId: string = 'TEST-GROUP'): string {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    
    // Result: 08212026 (based on today's date)
    const currentDate = `${mm}${dd}${yyyy}`; 

    // Append '1' ONLY if it is a negative test scenario
    const dateSuffix = mode === 'negative' ? '1' : '';

    return `skumarvutukuri-sonata+test+${currentDate}${dateSuffix}+${groupId}@2u.com`.toLowerCase();
  }

  static getPhone(): string {
    return `+91${this.randomDigits(10)}`;
  }

  static getZip(): string {
    return this.randomDigits(6);
  }

  static getAddress(): string {
    return `${Math.floor(1 + Math.random() * 9999)} ${this.pick(this.streetNames)}`;
  }

  static getCity(): string {
    return this.pick(this.cities);
  }

  static getState(): string {
    return this.pick(this.states);
  }

  static getParagraph(): string {
    return `Automation input ${this.randomAlnum(12)} generated for validation flow.`;
  }

  static getRandomText(): string {
    return `${this.pick(this.products)} ${this.randomAlnum(6)}`;
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
      '9876543210' // Invalid without country code
    ];
  }
}