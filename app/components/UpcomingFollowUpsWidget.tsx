import React from 'react';
import { Calendar, Phone, Mail, Users, CheckCircle } from 'lucide-react';
import { FollowUp } from '../types/dashboard';

interface UpcomingFollowUpsWidgetProps {
  followUps: FollowUp[];
  onComplete: (id: string) => void;
}

const typeIcons: Record<FollowUp['type'], React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
};

const typeLabels: Record<FollowUp['type'], string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
};

function formatDueDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 0) return 'Overdue';
  if (diffHours < 24) return `in ${diffHours}h`;
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === 0) return 'Today';
  return `in ${diffDays} days`;
}

function getDueDateColor(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return 'text-red-600 bg-red-50';
  if (diffHours < 24) return 'text-orange-600 bg-orange-50';
  return 'text-blue-600 bg-blue-50';
}

export function UpcomingFollowUpsWidget({ followUps, onComplete }: UpcomingFollowUpsWidgetProps) {
  const pendingFollowUps = followUps.filter(fu => !fu.completed);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Upcoming Follow-ups</h3>
        </div>
        <span className="text-sm text-gray-500">{pendingFollowUps.length} pending</span>
      </div>
      
      <div className="p-2">
        {pendingFollowUps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No upcoming follow-ups</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingFollowUps.slice(0, 5).map((followUp) => (
              <div
                key={followUp.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  {typeIcons[followUp.type]}
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-gray-900 truncate">{followUp.customer_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{typeLabels[followUp.type]}</span>
                    {followUp.notes && (
                      <>
                        <span>•</span>
                        <span className="truncate">{followUp.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDueDateColor(followUp.due_date)}`}>
                    {formatDueDate(followUp.due_date)}
                  </span>
                  
                  <button
                    onClick={() => onComplete(followUp.id)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Mark as complete"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
