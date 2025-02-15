import { getIconByName } from "@/utils/icons";
import { NodeData } from "../../../../types/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/utils";
interface StatusIconProps {
  data: NodeData;
  size?: number;
  className?: string;
}

// Add this new component before the ConfigNode
export default function StatusIcon({
  data,
  size = 16,
  className,
}: StatusIconProps) {
  // Calculate status info
  const getStatusInfo = () => {
    if (data?.state?.validation?.isValid === false) {
      return {
        icon: getIconByName("alertCircle"),
        color: "text-warning",
        bgColor: "bg-warning",
        tooltip: "Invalid Configuration",
        errors: data?.state?.validation?.errors,
        className: "animate-pulse",
      };
    }
    if (data?.state?.execution?.isRunning) {
      return {
        icon: getIconByName("loader2"),
        color: "text-primary",
        bgColor: "bg-primary",
        tooltip: "Running",
        className: "animate-spin",
      };
    }
    if (data?.state?.execution?.isFailed) {
      return {
        icon: getIconByName("xCircle"),
        color: "text-destructive",
        bgColor: "bg-destructive",
        tooltip: "Failed",
        error: data?.state?.execution?.error,
        className: "animate-pulse",
      };
    }
    if (data?.state?.execution?.isCompleted) {
      return {
        icon: getIconByName("Check"),
        color: "text-success",
        bgColor: "bg-success",
        tooltip: "Completed",
        className: "",
      };
    }
    return {
      icon: getIconByName("circle"),
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      tooltip: "Ready",
      className: "",
    };
  };

  const status = getStatusInfo();
  const StatusIconComponent = status.icon;

  const sizeClass = () => `w-[${size}px] h-[${size}px]`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn("ml-2", status.color, className)}>
            <StatusIconComponent
              style={{ width: size, height: size }}
              className={cn(status.className)}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className={cn(status.bgColor, "space-y-1")}>
          <p className="font-medium">{status.tooltip}</p>
          {status.error && <p className="text-sm opacity-90">{status.error}</p>}
          {status.errors && status.errors.length > 0 && (
            <ul className="text-sm list-disc pl-4 opacity-90">
              {status.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
