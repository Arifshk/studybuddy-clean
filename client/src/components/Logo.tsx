import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="owl-icon" />
      <span className="text-xl font-bold text-primary">StudyBuddy</span>
    </div>
  );
}
