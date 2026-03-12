'use client';

import React from 'react';
import { UserRole } from '../types/dashboard';
import { Shield, User, Users } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roles: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'sales_rep', 
    label: 'Sales Rep', 
    icon: <User className="w-4 h-4" />,
    description: 'Standard sales representative access'
  },
  { 
    value: 'manager', 
    label: 'Manager', 
    icon: <Users className="w-4 h-4" />,
    description: 'Team management access'
  },
  { 
    value: 'admin', 
    label: 'Admin', 
    icon: <Shield className="w-4 h-4" />,
    description: 'Full system access'
  },
];

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Role-Based Access Control</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Switch roles to test different access levels. Each role has different permissions.
      </p>
      
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => onRoleChange(role.value)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              currentRole === role.value
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
          >
            <div className={`p-2 rounded-full ${
              currentRole === role.value ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {role.icon}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{role.label}</span>
                {currentRole === role.value && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{role.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
