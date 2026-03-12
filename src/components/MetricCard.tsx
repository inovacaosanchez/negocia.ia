import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  color: "orange" | "blue" | "navy" | "gold";
  delay?: number;
}

const colorClasses = {
  orange: "text-metric-orange bg-metric-orange/20",
  blue: "text-metric-blue bg-metric-blue/20",
  navy: "text-metric-navy bg-metric-navy/20",
  gold: "text-metric-gold bg-metric-gold/20",
};

const MetricCard = ({ title, value, icon: Icon, suffix = "", color, delay = 0 }: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  return (
    <div 
      className={`metric-card opacity-0 ${isVisible ? "animate-slide-up" : ""}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">
            {displayValue.toLocaleString("pt-BR")}
            {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
