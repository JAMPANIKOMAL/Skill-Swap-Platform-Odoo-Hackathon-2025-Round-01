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
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-blue-400" />
        <span className="text-base font-semibold text-blue-700">Filter by Status</span>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = statusCounts[status] || 0;
          const isSelected = selectedStatus === status;
          return (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`transition-all duration-200 px-4 py-2 rounded-full flex flex-col items-center gap-1 min-w-[90px] border text-sm font-medium shadow-sm focus:outline-none
                ${isSelected
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 scale-105 shadow-lg"
                  : `${config.color} hover:shadow-md hover:scale-105`}
              `}
              style={{ boxShadow: isSelected ? '0 4px 16px 0 rgba(59,130,246,0.10)' : undefined }}
            >
              <Icon className={`h-5 w-5 mb-1 ${isSelected ? 'text-white' : ''}`} />
              <span>{config.label}</span>
              {loading ? (
                <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
              ) : count > 0 ? (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-blue-700 border border-blue-200'}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StatusFilter; 