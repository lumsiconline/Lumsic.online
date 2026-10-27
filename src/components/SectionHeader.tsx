import React from 'react';

export interface SectionHeaderProps {
  icon: string | React.ReactNode;
  iconBg?: string;
  iconBorder?: string;
  title: string | React.ReactNode;
  titleColor?: string;
  badge?: string;
  badgeBg?: string;
  badgeText?: string;
  badgeBorder?: string;
  subtitle: string;
  onViewAll?: () => void;
  actionText?: string;
  className?: string;
}

/**
 * Universal Section Header Component
 * Strict layout:
 * - LEFT: Small circular icon + (Title & Description grouped together)
 * - RIGHT: Action button (View All →) vertically centered with complete heading block
 * - Mobile-first, responsive, zero collision, zero overlap
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  iconBg = 'bg-rose-100',
  iconBorder = 'border-rose-300',
  title,
  titleColor = 'text-[#881337]',
  badge,
  badgeBg = 'bg-rose-100',
  badgeText = 'text-rose-900',
  badgeBorder = 'border-rose-300',
  subtitle,
  onViewAll,
  actionText = 'View All →',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 sm:gap-3 px-0.5 w-full ${className}`}>
      {/* LEFT SIDE: Small circular icon + Grouped Title & Subtitle */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        {/* Small circular icon */}
        <div
          className={`w-8 h-8 rounded-full ${iconBg} ${iconBorder} border flex items-center justify-center shadow-2xs text-sm shrink-0 select-none`}
        >
          {icon}
        </div>

        {/* Grouped Title & Subtitle */}
        <div className="min-w-0 flex-1">
          {typeof title === 'string' ? (
            <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
              <h3 className={`text-[14px] sm:text-[15px] font-bold ${titleColor} tracking-tight font-serif leading-tight whitespace-nowrap truncate`}>
                {title}
              </h3>
              {badge && (
                <span className={`text-[9px] font-sans font-black px-1.5 py-0.5 rounded-full ${badgeBg} ${badgeText} ${badgeBorder} border uppercase tracking-wider shrink-0`}>
                  {badge}
                </span>
              )}
            </div>
          ) : (
            <div className="min-w-0">
              {title}
            </div>
          )}
          <p className="text-[11px] text-[#78350F] font-medium leading-tight mt-0.5 truncate sm:line-clamp-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Action button vertically centered with the complete heading block */}
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] hover:text-[#78350F] font-bold text-[11px] sm:text-xs border border-[#FCD34D] shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
