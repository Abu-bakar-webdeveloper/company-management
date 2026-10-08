import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { FormField as SharedFormField } from '@/shared/ui/FormField'

export const leaveFormInputClass =
  "h-11 w-full rounded-lg border border-[#e2e8f0] bg-surface px-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/15";

export const leaveFormTextareaClass =
  "min-h-[100px] w-full resize-y rounded-lg border border-[#e2e8f0] bg-surface px-4 py-3 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/15";

export function FormField(
  props: Omit<ComponentProps<typeof SharedFormField>, 'spacing'>,
) {
  return <SharedFormField spacing="section" {...props} />
}

function SegmentedToggleControl({
  value,
  onChange,
  options,
  disabled,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  options: { trueLabel: string; falseLabel: string };
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 rounded-lg border border-[#e2e8f0] p-1",
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={cn(
          "rounded-md px-6 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
          value
            ? "bg-primary text-white"
            : "text-text-muted hover:text-heading",
        )}
      >
        {options.trueLabel}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={cn(
          "rounded-md px-6 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
          !value
            ? "bg-primary text-white"
            : "text-text-muted hover:text-heading",
        )}
      >
        {options.falseLabel}
      </button>
    </div>
  );
}

export function SegmentedToggle({
  value,
  onChange,
  options,
  title,
  description,
  disabled,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  options: { trueLabel: string; falseLabel: string };
  title?: string;
  description?: string;
  disabled?: boolean;
}) {
  const control = (
    <SegmentedToggleControl
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
    />
  );

  if (!title) return control;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-[#e2e8f0] px-4 py-3",
        disabled && "bg-[#f8fafc]",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-heading">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-text-muted">{description}</p>
        )}
      </div>
      {control}
    </div>
  );
}

export function LeaveTypeFormCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-card bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 border-b border-border-card px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] sm:size-9">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V9H16V8H2V18H9V20H2ZM2 6H16V4H2V6ZM2 6V4V6ZM11 20V16.925L16.525 11.425C16.675 11.275 16.8417 11.1667 17.025 11.1C17.2083 11.0333 17.3917 11 17.575 11C17.775 11 17.9667 11.0375 18.15 11.1125C18.3333 11.1875 18.5 11.3 18.65 11.45L19.575 12.375C19.7083 12.525 19.8125 12.6917 19.8875 12.875C19.9625 13.0583 20 13.2417 20 13.425C20 13.6083 19.9667 13.7958 19.9 13.9875C19.8333 14.1792 19.725 14.35 19.575 14.5L14.075 20H11ZM18.5 13.425L17.575 12.5L18.5 13.425ZM12.5 18.5H13.45L16.475 15.45L16.025 14.975L15.55 14.525L12.5 17.55V18.5ZM16.025 14.975L15.55 14.525L16.475 15.45L16.025 14.975Z"
              fill="#00284F"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-heading sm:text-xl">Leave Type Details</h2>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
