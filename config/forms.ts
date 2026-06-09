export type FormDefinition = {
    key: string;
    displayName: string;
    group: string;
    formId: string;
    url: string;
};

export const FORMS = {
    ALB_BIO_2581: {
        key: 'ALB_BIO_2581',
        displayName: '[ELF] ALB-BIO',
        group: 'ALB-UMT',
        formId: '2581',
        url: 'https://taxi.stg.mktg.2u.com/credential-type/6/groupings/593/forms/2581/preview/',
    },
    ALB_MSB_3003: {
        key: 'ALB_MSB_3003',
        displayName: 'ALB-MSB Default Form',
        group: 'ALB-UMT',
        formId: '3003',
        url: 'https://taxi.stg.mktg.2u.com/credential-type/6/groupings/593/forms/3003/preview/',
    },
} as const satisfies Record<string, FormDefinition>;

export type FormKey = keyof typeof FORMS;

export function getFormUrl(formKey: FormKey): string {
    return FORMS[formKey].url;
}

export function getFormDefinition(formKey: FormKey): FormDefinition {
    return FORMS[formKey];
}