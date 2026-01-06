export type EmailValue = string

export const EmailUtil = {
  isValid: (email: string): boolean => {
    const trimmed = email.trim()
    const atIndex = trimmed.indexOf('@')
    return (
      trimmed.length > 0 &&
      atIndex > 0 && // @より前に1文字以上
      atIndex < trimmed.length - 1 // @より後に1文字以上
    )
  },
  validate: (email: string): void => {
    const trimmed = email.trim()
    if (trimmed.length === 0) {
      throw new Error('メールアドレスは必須です')
    }
    const atIndex = trimmed.indexOf('@')
    if (atIndex <= 0 || atIndex >= trimmed.length - 1) {
      throw new Error('メールアドレスの形式が不正です')
    }
  },
  normalize: (email: string): string => {
    return email.trim().toLowerCase()
  },
}

export class Email {
  private constructor(private readonly value: EmailValue) {}

  getValue(): EmailValue {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  getDomain(): string {
    const parts = this.value.split('@')
    return parts[1] || ''
  }

  static fromValue(email: string): Email {
    const normalized = EmailUtil.normalize(email)
    EmailUtil.validate(normalized)
    return new Email(normalized)
  }
}
