/** Canonical 10-K / 10-Q item titles, used only for labelling. */
export const ITEM_TITLES_10K: Record<string, string> = {
  '1': 'Business',
  '1A': 'Risk Factors',
  '1B': 'Unresolved Staff Comments',
  '1C': 'Cybersecurity',
  '2': 'Properties',
  '3': 'Legal Proceedings',
  '4': 'Mine Safety Disclosures',
  '5': "Market for Registrant's Common Equity",
  '6': '[Reserved]',
  '7': "Management's Discussion and Analysis",
  '7A': 'Quantitative and Qualitative Disclosures About Market Risk',
  '8': 'Financial Statements and Supplementary Data',
  '9': 'Changes in and Disagreements with Accountants',
  '9A': 'Controls and Procedures',
  '9B': 'Other Information',
  '9C': 'Disclosure Regarding Foreign Jurisdictions that Prevent Inspections',
  '10': 'Directors, Executive Officers and Corporate Governance',
  '11': 'Executive Compensation',
  '12': 'Security Ownership',
  '13': 'Certain Relationships and Related Transactions',
  '14': 'Principal Accountant Fees and Services',
  '15': 'Exhibits and Financial Statement Schedules',
  '16': 'Form 10-K Summary',
};

export const ITEM_TITLES_10Q: Record<string, string> = {
  'I.1': 'Financial Statements',
  'I.2': "Management's Discussion and Analysis",
  'I.3': 'Quantitative and Qualitative Disclosures About Market Risk',
  'I.4': 'Controls and Procedures',
  'II.1': 'Legal Proceedings',
  'II.1A': 'Risk Factors',
  'II.2': 'Unregistered Sales of Equity Securities',
  'II.3': 'Defaults Upon Senior Securities',
  'II.4': 'Mine Safety Disclosures',
  'II.5': 'Other Information',
  'II.6': 'Exhibits',
};

const ITEM_TITLE_VARIANTS_10K: Partial<Record<string, string[]>> = {
  '5': [
    "Market for Registrant's Common Equity, Related Stockholder Matters and Issuer Purchases of Equity Securities",
    "Market for Registrant's Common Equity, Related Stockholder Matters, and Issuer Purchases of Equity Securities",
    "Market for the Registrant's Common Equity, Related Stockholder Matters and Issuer Purchases of Equity Securities",
    "Market for the Company's Common Equity, Related Stockholder Matters and Issuer Purchases of Equity Securities",
    "Market for Registrant's Common Stock, Related Shareholder Matters, and Issuer Purchases of Equity Securities",
    "Market for the Registrant's Common Stock, Related Shareholder Matters, and Issuer Purchases of Equity Securities",
  ],
  '7': ["Management's Discussion and Analysis of Financial Condition and Results of Operations"],
  '9': ['Changes in and Disagreements with Accountants on Accounting and Financial Disclosure'],
  '10': ['Directors, Executive Officers, and Corporate Governance'],
  '12': [
    'Security Ownership of Certain Beneficial Owners and Management and Related Stockholder Matters',
    'Security Ownership of Certain Beneficial Owners and Management and Related Shareholder Matters',
  ],
  '13': ['Certain Relationships and Related Transactions, and Director Independence'],
  '14': ['Principal Accounting Fees and Services'],
  '15': [
    'Exhibits, Financial Statement Schedules',
    'Exhibit and Financial Statement Schedules',
    'Exhibits, Financial Statements and Schedules',
  ],
};

const ITEM_TITLE_VARIANTS_10Q: Partial<Record<string, string[]>> = {
  'I.1': ['Financial Statements'],
  'I.2': ["Management's Discussion and Analysis of Financial Condition and Results of Operations"],
  'I.3': ['Quantitative and Qualitative Disclosures About Market Risk'],
  'I.4': ['Controls and Procedures'],
  'II.1': ['Legal Proceedings'],
  'II.1A': ['Risk Factors'],
  'II.2': [
    'Unregistered Sales of Equity Securities and Use of Proceeds and Issuer Repurchases of Equity Securities',
    'Unregistered Sales of Equity Securities and Use of Proceeds and Issuer Purchases of Equity Securities',
    'Unregistered Sales of Equity Securities, Use of Proceeds and Issuer Repurchases of Equity Securities',
    'Unregistered Sales of Equity Securities, Use of Proceeds and Issuer Purchases of Equity Securities',
    'Unregistered Sales of Equity Securities, Use of Proceeds, and Issuer Repurchases of Equity Securities',
    'Unregistered Sales of Equity Securities, Use of Proceeds, and Issuer Purchases of Equity Securities',
    'Unregistered Sales of Equity Securities and Issuer Repurchases of Equity Securities',
    'Unregistered Sales of Equity Securities and Issuer Purchases of Equity Securities',
    'Unregistered Sales of Equity Securities and Use of Proceeds',
  ],
  'II.3': ['Defaults Upon Senior Securities'],
  'II.4': ['Mine Safety Disclosures'],
  'II.5': ['Other Information'],
  'II.6': ['Exhibits'],
};

/** Known filed variants, longest first so a shorter canonical prefix never truncates a title. */
export function titleVariantsFor(form: string, key: string): string[] {
  const f = form.toUpperCase();
  const table = f.startsWith('10-Q') ? ITEM_TITLES_10Q : f.startsWith('10-K') ? ITEM_TITLES_10K : undefined;
  const canonical = table?.[key];
  const variants = f.startsWith('10-Q')
    ? ITEM_TITLE_VARIANTS_10Q[key] ?? []
    : f.startsWith('10-K')
      ? ITEM_TITLE_VARIANTS_10K[key] ?? []
      : [];
  return [...new Set([...variants, ...(canonical ? [canonical] : [])])].sort((a, b) => b.length - a.length);
}

/** Canonical titles only for the forms we actually know; anything else keeps its own heading text. */
export function titleFor(form: string, key: string, fallback: string): string {
  const f = form.toUpperCase();
  const table = f.startsWith('10-Q') ? ITEM_TITLES_10Q : f.startsWith('10-K') ? ITEM_TITLES_10K : undefined;
  const raw = fallback.trim().replace(/[.:\-\u2013\u2014]+$/, '').trim();
  return table?.[key] ?? (raw || 'Untitled');
}
