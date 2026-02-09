import { useState } from 'react';
import { X } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export interface EmailChipInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
  'aria-label'?: string;
}

/**
 * Multi-email input: type an email and press Enter to add it as a chip.
 * Click X on a chip to remove. Duplicates and invalid emails are not added.
 */
export function EmailChipInput({
  emails,
  onChange,
  placeholder = "Add email, press Enter",
  disabled = false,
  id,
  className = '',
  inputClassName = '',
  'aria-label': ariaLabel = 'Email addresses',
}: EmailChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  function addEmail(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || !isValidEmail(trimmed)) return;
    if (emails.map((e) => e.toLowerCase()).includes(trimmed)) return;
    onChange([...emails, trimmed]);
    setInputValue('');
  }

  function removeEmail(index: number) {
    onChange(emails.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail(inputValue);
      return;
    }
    if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addEmail(inputValue);
      return;
    }
    if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      removeEmail(emails.length - 1);
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 min-h-[42px] px-3 py-2 rounded-lg border focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-w-0 ${className}`}
      style={{
        backgroundColor: 'var(--input-background)',
        borderColor: 'var(--border)',
      }}
    >
      {emails.map((email, index) => (
        <span
          key={`${email}-${index}`}
          className="inline-flex items-center gap-1.5 max-w-[240px] min-w-0 px-2.5 py-1 rounded-md text-sm"
          style={{
            backgroundColor: 'var(--muted)',
            color: 'var(--foreground)',
          }}
          title={email}
        >
          <span className="truncate">{email}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeEmail(index)}
              className="p-0.5 rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label={`Remove ${email}`}
            >
              <X className="size-3.5" />
            </button>
          )}
        </span>
      ))}
      <input
        id={id}
        type="email"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) addEmail(inputValue);
        }}
        placeholder={emails.length === 0 ? placeholder : ''}
        disabled={disabled}
        className={`flex-1 min-w-[140px] py-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm ${inputClassName}`}
        style={{ color: 'var(--foreground)' }}
        aria-label={ariaLabel}
        autoComplete="off"
      />
    </div>
  );
}
