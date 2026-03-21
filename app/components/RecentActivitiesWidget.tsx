import React from 'react';
import { Phone, Mail, Users, Video, FileText, CheckCircle, MinusCircle, XCircle, Clock } from 'lucide-react';
import { RecentActivity } from '../types/dashboard';

interface RecentActivitiesWidgetProps {
  activities: RecentActivity[];
}

const typeIcons: Record<RecentActivity['type'], React.ReactNode> = {
  phone: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  quote_sent: <FileText className="w-4 h-4" />,
  quote_accepted: <CheckCircle className="w-4 h-4" />,
};

const typeLabels: Record<RecentActivity['type'], string> = {
  phone: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  video: 'Video Call',
  quote_sent: 'Quote Sent',
  quote_accepted: 'Quote Accepted',
};

const typeColors: Record<RecentActivity['type'], string> = {
  phone: 'bg-blue-100 text-blue-600',
  email: 'bg-indigo-100 text-indigo-600',
  meeting: 'bg-purple-100 text-purple-600',
  video: 'bg-cyan-100 text-cyan-600',
  quote_sent: 'bg-orange-100 text-orange-600',
  quote_accepted: 'bg-green-100 text-green-600',
};

const outcomeIcons: Record<string, React.ReactNode> = {
  positive: <CheckCircle className="w-3 h-3" />,
  neutral: <MinusCircle className="w-3 h-3" />,
  negative: <XCircle className="w-3 h-3" />,
};

const outcomeColors: Record<string, string> = {
  positive: 'text-green-600',
  neutral: 'text-yellow-600',
  negative: 'text-red-600',
};

function formatActivityTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function RecentActivitiesWidget({ activities }: RecentActivitiesWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <span className="text-sm text-gray-500">{activities.length} total</span>
      </div>
      
      <div className="p-2">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activities</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeColors[activity.type]}`}>
                  {typeIcons[activity.type]}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{typeLabels[activity.type]}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">{activity.customer_name}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">
                    {formatActivityTime(activity.date)}
                  </span>
                  {activity.outcome && (
                    <span className={`flex items-center gap-1 ${outcomeColors[activity.outcome]}`}>
                      {outcomeIcons[activity.outcome]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
