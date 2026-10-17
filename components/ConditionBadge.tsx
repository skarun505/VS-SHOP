import React from "react";
import { getGradeInfo } from "@/lib/grading";
import { Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface ConditionBadgeProps {
  grade: string;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConditionBadge({
  grade,
  showDescription = false,
  size = "md",
}: ConditionBadgeProps) {
  const info = getGradeInfo(grade);

  const getIcon = () => {
    switch (info.code) {
      case "A_PLUS":
        return <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />;
      case "A":
        return <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />;
      case "B":
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />;
      case "C":
        return <AlertCircle className="w-3.5 h-3.5 mr-1 text-orange-600 dark:text-orange-400" />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1 font-medium",
    lg: "text-sm px-3.5 py-1.5 font-semibold",
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${info.badgeBg} ${info.badgeText} ${info.badgeBorder} ${sizeClasses[size]}`}
      >
        {getIcon()}
        {info.tag} &bull; {info.label}
      </span>
      {showDescription && (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
          {info.description}
        </span>
      )}
    </div>
  );
}
