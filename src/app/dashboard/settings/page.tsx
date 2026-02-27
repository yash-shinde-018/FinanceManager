'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Globe,
  Camera,
  Save,
  CheckCircle2,
  Loader2,
  Mail,
  Smartphone,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Moon },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: true,
    anomalyAlerts: true,
    goalUpdates: true,
    marketingEmails: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateUser({ name: profileData.name });
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--muted-text)]">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-indigo-500 text-white'
                : 'bg-[var(--glass-bg)] text-[var(--muted-text)] hover:text-[var(--foreground)]'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card-glass p-6">
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">Profile Information</h2>
            
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-indigo-500/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <button className="btn-secondary flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="input-premium opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-premium input-with-left-icon"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    className="input-premium input-with-left-icon appearance-none cursor-pointer"
                  >
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Singapore">Singapore (SGT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="America/New_York">New York (ET)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
            
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-bg)]">
                  <div>
                    <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm text-[var(--muted-text)]">
                      {key === 'emailAlerts' && 'Receive important account alerts via email'}
                      {key === 'pushNotifications' && 'Get instant push notifications on your device'}
                      {key === 'weeklyReport' && 'Weekly summary of your financial activity'}
                      {key === 'anomalyAlerts' && 'Get notified about unusual transactions'}
                      {key === 'goalUpdates' && 'Updates when you reach financial milestones'}
                      {key === 'marketingEmails' && 'News, tips, and promotional content'}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      value ? 'bg-indigo-500' : 'bg-[var(--glass-border)]'
                    )}
                  >
                    <span className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                      value ? 'left-7' : 'left-1'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">Security Settings</h2>
            
            {/* Change Password */}
            <div className="p-4 rounded-xl bg-[var(--glass-bg)] space-y-4">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-indigo-400" />
                <span className="font-medium">Change Password</span>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Current Password"
                    className="input-premium"
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    className="input-premium"
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    className="input-premium"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-[var(--glass-border)]"
                  />
                  <span className="text-sm text-[var(--muted-text)]">Show passwords</span>
                </label>
              </div>
            </div>

            {/* Two Factor Auth */}
            <div className="p-4 rounded-xl bg-[var(--glass-bg)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-[var(--muted-text)]">Add an extra layer of security</p>
                </div>
              </div>
              <button className="btn-secondary text-sm">
                Enable 2FA
              </button>
            </div>

            {/* Active Sessions */}
            <div className="p-4 rounded-xl bg-[var(--glass-bg)]">
              <p className="font-medium mb-3">Active Sessions</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Current Device - Chrome on Windows</span>
                  </div>
                  <span className="text-[var(--muted-text)]">Active now</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">Appearance</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--glass-bg)]">
                <p className="font-medium mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        theme === t
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-[var(--glass-border)] hover:border-indigo-500/30'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-2" />
                      <span className="text-sm font-medium capitalize">{t}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-[var(--muted-text)] mt-3">
                  Currently using: {getThemeLabel()} mode
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="pt-6 border-t border-[var(--glass-border)] flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'btn-primary flex items-center gap-2',
              isSaving && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
          
          {showSuccess && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-emerald-400 text-sm"
            >
              Settings saved successfully
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
