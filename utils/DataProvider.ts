import fieldData from '../testdata/fieldData.json';

export interface FieldData {
  type: string;
  value?: string | boolean;
  required?: boolean;
  invalid?: string[];
  strategy?: string;
  aliases?: string[];
}

export class DataProvider {

  /**
   * Find field by its label
   */
  static getField(label: string): FieldData | undefined {

    const fields = (fieldData as any).fields;

    // Exact match
    if (fields[label]) {
      return fields[label];
    }

    // Alias match
    for (const key of Object.keys(fields)) {

      const field = fields[key];

      if (
        field.aliases &&
        field.aliases.some(
          (alias: string) =>
            alias.toLowerCase() === label.toLowerCase()
        )
      ) {
        return field;
      }
    }

    return undefined;
  }

  /**
   * Returns actual value
   */
  static getValue(label: string): any {

    const field = this.getField(label);

    if (!field)
      return undefined;

    switch (field.value) {

      case 'dynamicEmail':
        return `playwright${Date.now()}@mail.com`;

      case 'dynamicPhone':
        return this.randomPhone();

      case 'dynamicZip':
        return this.randomZip();

      default:
        return field.value;
    }
  }

  static getInvalidValues(label: string): string[] {

    const field = this.getField(label);

    return field?.invalid ?? [];
  }

  static isRequired(label: string): boolean {

    const field = this.getField(label);

    return field?.required ?? false;
  }

  static getType(label: string): string {

    const field = this.getField(label);

    return field?.type ?? 'text';
  }

  static getStrategy(label: string): string {

    const field = this.getField(label);

    return field?.strategy ?? '';
  }

  private static randomPhone(): string {

    return `9${Math.floor(
      100000000 + Math.random() * 900000000
    )}`;
  }

  private static randomZip(): string {

    return `${Math.floor(
      100000 + Math.random() * 900000
    )}`;
  }
}