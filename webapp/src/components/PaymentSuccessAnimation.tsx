export function PaymentSuccessAnimation({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-u-lg text-center">
      <svg
        viewBox="0 0 64 64"
        width="80"
        height="80"
        className="payment-success-circle"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" fill="var(--color-primary-container)" />
        <path
          d="M20 33 L28 41 L44 24"
          fill="none"
          stroke="var(--color-on-primary-container)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="payment-success-check"
        />
      </svg>
      <p className="font-headline-md text-headline-md text-primary mt-u-sm">{message ?? "Төлбөр амжилттай!"}</p>
    </div>
  );
}
