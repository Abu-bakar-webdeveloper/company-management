import { cn } from "@/shared/lib/cn";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { LeaveTypeIcon } from "@/features/leave/model/types";

type IconProps = { className?: string };

export function PlusIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  );
}

export function ExportReportIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M9 2v10M5 8l4 4 4-4M3 16h12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ListIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 16"
      fill="currentColor"
      aria-hidden
    >
      <path
        d="M5 14C5.28333 14 5.52083 13.9042 5.7125 13.7125C5.90417 13.5208 6 13.2833 6 13C6 12.7167 5.90417 12.4792 5.7125 12.2875C5.52083 12.0958 5.28333 12 5 12C4.71667 12 4.47917 12.0958 4.2875 12.2875C4.09583 12.4792 4 12.7167 4 13C4 13.2833 4.09583 13.5208 4.2875 13.7125C4.47917 13.9042 4.71667 14 5 14ZM5 10C5.28333 10 5.52083 9.90417 5.7125 9.7125C5.90417 9.52083 6 9.28333 6 9C6 8.71667 5.90417 8.47917 5.7125 8.2875C5.52083 8.09583 5.28333 8 5 8C4.71667 8 4.47917 8.09583 4.2875 8.2875C4.09583 8.47917 4 8.71667 4 9C4 9.28333 4.09583 9.52083 4.2875 9.7125C4.47917 9.90417 4.71667 10 5 10ZM5 6C5.28333 6 5.52083 5.90417 5.7125 5.7125C5.90417 5.52083 6 5.28333 6 5C6 4.71667 5.90417 4.47917 5.7125 4.2875C5.52083 4.09583 5.28333 4 5 4C4.71667 4 4.47917 4.09583 4.2875 4.2875C4.09583 4.47917 4 4.71667 4 5C4 5.28333 4.09583 5.52083 4.2875 5.7125C4.47917 5.90417 4.71667 6 5 6ZM8 14H14V12H8V14ZM8 10H14V8H8V10ZM8 6H14V4H8V6ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2ZM2 16H16V2H2V16ZM2 2V16V2Z"
        fill="#136DEC"
      />
    </svg>
  );
}

export function ClockIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={cn("size-5 shrink-0", className)}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" strokeLinecap="round" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
        fill="#16A34A"
      />
    </svg>
  );
}

export function XCircleIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        d="M6.4 15L10 11.4L13.6 15L15 13.6L11.4 10L15 6.4L13.6 5L10 8.6L6.4 5L5 6.4L8.6 10L5 13.6L6.4 15ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
        fill="#DC2626"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4 shrink-0", className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M5 2v2M11 2v2M2 7h12" strokeLinecap="round" />
    </svg>
  );
}

export function DocumentIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M3 2h7l3 3v11H3V2z" strokeLinejoin="round" />
      <path d="M10 2v3h3" strokeLinejoin="round" />
    </svg>
  );
}

export function EditIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.55 9.14995V11.55C11.55 11.8682 11.4236 12.1734 11.1985 12.3985C10.9735 12.6235 10.6683 12.75 10.35 12.75H1.95C1.63174 12.75 1.32652 12.6235 1.10147 12.3985C0.876428 12.1734 0.75 11.8682 0.75 11.55V3.14995C0.75 2.83169 0.876428 2.52647 1.10147 2.30142C1.32652 2.07638 1.63174 1.94995 1.95 1.94995H4.35"
        stroke="#136DEC"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7.0501 9.03L12.7501 3.27L10.2301 0.75L4.5301 6.45L4.3501 9.15L7.0501 9.03Z"
        stroke="#136DEC"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.25 14C1.8375 14 1.48438 13.8477 1.19063 13.5431C0.896875 13.2384 0.75 12.8722 0.75 12.4444V2.33333H0V0.777778H3.75V0H8.25V0.777778H12V2.33333H11.25V12.4444C11.25 12.8722 11.1031 13.2384 10.8094 13.5431C10.5156 13.8477 10.1625 14 9.75 14H2.25ZM9.75 2.33333H2.25V12.4444H9.75V2.33333ZM3.75 10.8889H5.25V3.88889H3.75V10.8889ZM6.75 10.8889H8.25V3.88889H6.75V10.8889Z"
        fill="#DC2626"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4 shrink-0", className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({}: IconProps) {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.25 6.25L4.58333 9.58333L12.9167 1.25" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  );
}

export function XIcon({}: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.25 11.25L11.25 1.25M1.25 1.25L11.25 11.25" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  );
}

export function LeaveTypeDetailsIcon({
  className = "size-5 text-[#1877f2]",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M7 2v4M13 2v4M3 9h14" strokeLinecap="round" />
    </svg>
  );
}

const leaveTypeIconStyles: Record<
  LeaveTypeIcon,
  { bg: string; color: string }
> = {
  sick: { bg: "bg-[#fef2f2]", color: "text-[#dc2626]" },
  casual: { bg: "bg-[#eff6ff]", color: "text-[#1877f2]" },
  annual: { bg: "bg-[#ecfdf5]", color: "text-[#00b67a]" },
  unpaid: { bg: "bg-[#f1f5f9]", color: "text-[#64748b]" },
};

export function LeaveTypeIconBadge({ icon }: { icon: LeaveTypeIcon }) {
  const styles = leaveTypeIconStyles[icon];
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        styles.bg,
        styles.color,
      )}
    >
      {icon === "sick" && (
        <svg
          className="size-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V4.5C0 4.0875 0.146875 3.73438 0.440625 3.44062C0.734375 3.14687 1.0875 3 1.5 3H4.5V1.5C4.5 1.0875 4.64688 0.734375 4.94063 0.440625C5.23438 0.146875 5.5875 0 6 0H9C9.4125 0 9.76562 0.146875 10.0594 0.440625C10.3531 0.734375 10.5 1.0875 10.5 1.5V3H13.5C13.9125 3 14.2656 3.14687 14.5594 3.44062C14.8531 3.73438 15 4.0875 15 4.5V13.5C15 13.9125 14.8531 14.2656 14.5594 14.5594C14.2656 14.8531 13.9125 15 13.5 15H1.5ZM1.5 13.5H13.5V4.5H1.5V13.5ZM6 3H9V1.5H6V3ZM1.5 13.5V4.5V13.5ZM6.75 9.75V12H8.25V9.75H10.5V8.25H8.25V6H6.75V8.25H4.5V9.75H6.75Z"
            fill="#DC2626"
          />
        </svg>
      )}
      {icon === "casual" && (
        <svg
          className="size-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            d="M6 6C5.175 6 4.46875 5.70625 3.88125 5.11875C3.29375 4.53125 3 3.825 3 3C3 2.175 3.29375 1.46875 3.88125 0.88125C4.46875 0.29375 5.175 0 6 0C6.825 0 7.53125 0.29375 8.11875 0.88125C8.70625 1.46875 9 2.175 9 3C9 3.825 8.70625 4.53125 8.11875 5.11875C7.53125 5.70625 6.825 6 6 6ZM0 12V9.9C0 9.475 0.109375 9.08437 0.328125 8.72812C0.546875 8.37187 0.8375 8.1 1.2 7.9125C1.975 7.525 2.7625 7.23438 3.5625 7.04063C4.3625 6.84688 5.175 6.75 6 6.75C6.825 6.75 7.6375 6.84688 8.4375 7.04063C9.2375 7.23438 10.025 7.525 10.8 7.9125C11.1625 8.1 11.4531 8.37187 11.6719 8.72812C11.8906 9.08437 12 9.475 12 9.9V12H0ZM1.5 10.5H10.5V9.9C10.5 9.7625 10.4656 9.6375 10.3969 9.525C10.3281 9.4125 10.2375 9.325 10.125 9.2625C9.45 8.925 8.76875 8.67188 8.08125 8.50313C7.39375 8.33438 6.7 8.25 6 8.25C5.3 8.25 4.60625 8.33438 3.91875 8.50313C3.23125 8.67188 2.55 8.925 1.875 9.2625C1.7625 9.325 1.67188 9.4125 1.60312 9.525C1.53437 9.6375 1.5 9.7625 1.5 9.9V10.5ZM6 4.5C6.4125 4.5 6.76562 4.35312 7.05937 4.05937C7.35312 3.76562 7.5 3.4125 7.5 3C7.5 2.5875 7.35312 2.23438 7.05937 1.94062C6.76562 1.64687 6.4125 1.5 6 1.5C5.5875 1.5 5.23438 1.64687 4.94063 1.94062C4.64688 2.23438 4.5 2.5875 4.5 3C4.5 3.4125 4.64688 3.76562 4.94063 4.05937C5.23438 4.35312 5.5875 4.5 6 4.5Z"
            fill="#2563EB"
          />
        </svg>
      )}
      {icon === "annual" && (
        <svg
          className="size-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            d="M12.45 13.5188L7.6875 8.75625L8.7375 7.70625L13.5 12.4688L12.45 13.5188ZM2.2125 12.9937C1.4625 12.2437 0.90625 11.4 0.54375 10.4625C0.18125 9.525 0 8.56875 0 7.59375C0 6.61875 0.18125 5.66875 0.54375 4.74375C0.90625 3.81875 1.4625 2.98125 2.2125 2.23125C2.9625 1.48125 3.80312 0.921875 4.73438 0.553125C5.66563 0.184375 6.61875 0 7.59375 0C8.56875 0 9.52188 0.184375 10.4531 0.553125C11.3844 0.921875 12.225 1.48125 12.975 2.23125L2.2125 12.9937ZM2.3625 10.7063L3.375 9.69375C3.175 9.43125 2.98438 9.1625 2.80312 8.8875C2.62187 8.6125 2.45625 8.3375 2.30625 8.0625C2.15625 7.7875 2.025 7.5125 1.9125 7.2375C1.8 6.9625 1.7 6.69375 1.6125 6.43125C1.475 7.16875 1.46563 7.90625 1.58438 8.64375C1.70312 9.38125 1.9625 10.0688 2.3625 10.7063ZM4.4625 8.64375L8.625 4.44375C8.0875 4.03125 7.54688 3.69687 7.00313 3.44062C6.45938 3.18438 5.95 3.00938 5.475 2.91563C5 2.82188 4.57188 2.80625 4.19063 2.86875C3.80938 2.93125 3.5125 3.06875 3.3 3.28125C3.0875 3.50625 2.95 3.80938 2.8875 4.19063C2.825 4.57188 2.84063 5.00313 2.93438 5.48438C3.02813 5.96562 3.20312 6.475 3.45937 7.0125C3.71562 7.55 4.05 8.09375 4.4625 8.64375ZM9.675 3.39375L10.725 2.38125C10.0625 1.98125 9.3625 1.71875 8.625 1.59375C7.8875 1.46875 7.15 1.48125 6.4125 1.63125C6.6875 1.71875 6.9625 1.81875 7.2375 1.93125C7.5125 2.04375 7.7875 2.17188 8.0625 2.31562C8.3375 2.45937 8.60938 2.62187 8.87813 2.80312C9.14688 2.98438 9.4125 3.18125 9.675 3.39375Z"
            fill="#059669"
          />
        </svg>
      )}
      {icon === "unpaid" && (
        <svg
          className="size-5"
          viewBox="0 0 14 14"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
          aria-hidden
        >
          <path d="M9.7125 4.3125C9.5625 3.9375 9.34062 3.64375 9.04688 3.43125C8.75313 3.21875 8.4 3.1125 7.9875 3.1125C7.7625 3.1125 7.54375 3.14375 7.33125 3.20625C7.11875 3.26875 6.925 3.3875 6.75 3.5625L5.6625 2.475C5.8375 2.3 6.075 2.14062 6.375 1.99688C6.675 1.85313 6.95 1.7625 7.2 1.725V0.15H8.7V1.6875C9.2625 1.8 9.75625 2.02813 10.1812 2.37188C10.6062 2.71563 10.925 3.1625 11.1375 3.7125L9.7125 4.3125ZM13.8 14.85L10.35 11.4C10.1625 11.5875 9.90625 11.7406 9.58125 11.8594C9.25625 11.9781 8.9625 12.05 8.7 12.075V13.65H7.2V12.0375C6.5 11.8625 5.91563 11.5437 5.44688 11.0813C4.97813 10.6188 4.6375 10.0375 4.425 9.3375L5.925 8.7375C6.075 9.2625 6.32812 9.7125 6.68437 10.0875C7.04062 10.4625 7.5125 10.65 8.1 10.65C8.325 10.65 8.53125 10.6219 8.71875 10.5656C8.90625 10.5094 9.0875 10.425 9.2625 10.3125L0 1.05L1.05 0L14.85 13.8L13.8 14.85Z" />
        </svg>
      )}
    </div>
  );
}

export function AvatarCircle({
  name,
  avatar,
  className,
}: {
  name: string;
  avatar?: string;
  className?: string;
}) {
  return <UserAvatar name={name} avatar={avatar} size="md" className={className} />;
}
