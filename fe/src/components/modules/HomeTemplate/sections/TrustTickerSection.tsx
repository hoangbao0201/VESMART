const MESSAGES = [
  "Không mất phí nếu không sửa được!",
  "Sửa chữa robot hút bụi toàn quốc",
  "Bảo hành dài hạn · Tư vấn miễn phí",
  "Nhận sửa robot · máy hút bụi · máy lọc không khí",
] as const;

const TrustTickerSection = () => {
  const duplicated = [...MESSAGES, ...MESSAGES];

  return (
    <div className="overflow-hidden bg-hero-from text-hero-foreground">
      <div className="animate-scroll py-2.5">
        {duplicated.map((message, index) => (
          <span
            key={`${message}-${index}`}
            className="inline-flex shrink-0 items-center px-6 text-xs font-medium tracking-wide sm:text-sm"
          >
            <span className="mr-6 text-primary" aria-hidden>
              •
            </span>
            {message}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TrustTickerSection;
