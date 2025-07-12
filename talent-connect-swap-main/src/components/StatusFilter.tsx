import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star, 
  Ban,
  Filter
} from "lucide-react";

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  statusCounts?: Record<string, number>;
  loading?: boolean;
}

const STATUS_CONFIG = {
  All: {
    label: "All Swaps",
    icon: Filter,
    color: "bg-gray-100 text-gray-700 border-gray-200"
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200"
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle,
    color: "bg-green-50 text-green-700 border-green-200"
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200"
  },
  completed: {
    label: "Completed",
    icon: Star,
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    color: "bg-gray-50 text-gray-700 border-gray-200"
  }
};

const StatusFilter = ({ selectedStatus, onStatusChange, statusCounts = {}, loading = false }: StatusFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filter by Status</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = statusCounts[status] || 0;
          const isSelected = selectedStatus === status;
          
          return (
            <Button
              key={status}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(status)}
              className={`h-auto p-3 flex flex-col items-center gap-1 min-w-[80px] ${
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{config.label}</span>
              {loading ? (
                <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
              ) : count > 0 ? (
                <Badge 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0.5 h-5"
                >
                  {count}
                </Badge>
              ) : null}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default StatusFilter; 