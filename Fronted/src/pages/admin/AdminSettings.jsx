import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Loader from '../../components/Loader'
import { FiSave, FiShield, FiAlertTriangle, FiGlobe, FiMessageCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    maxRadius: 10,
    autoSuspendThreshold: 3,
    profanityFilter: true,
    requireEmailVerification: false,
    allowGuestAccess: false,
    maxMessageLength: 1000,
    chatRetentionDays: 30,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminService.getSettings()
        if (response.data.settings) {
          setSettings((prev) => ({ ...prev, ...response.data.settings }))
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminService.updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader text="Loading settings..." />
  }

  const Toggle = ({ value, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
    </label>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
          <p className="text-dark-400 mt-1">
            Configure platform behavior and policies
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* General Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiGlobe className="w-5 h-5 text-primary-400" />
          General
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-white">Maintenance Mode</h3>
              <p className="text-sm text-dark-400">
                Put the platform in maintenance mode
              </p>
            </div>
            <Toggle
              value={settings.maintenanceMode}
              onChange={(v) => handleChange('maintenanceMode', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-white">Registration Enabled</h3>
              <p className="text-sm text-dark-400">
                Allow new users to create accounts
              </p>
            </div>
            <Toggle
              value={settings.registrationEnabled}
              onChange={(v) => handleChange('registrationEnabled', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-white">Guest Access</h3>
              <p className="text-sm text-dark-400">
                Allow users to browse without an account
              </p>
            </div>
            <Toggle
              value={settings.allowGuestAccess}
              onChange={(v) => handleChange('allowGuestAccess', v)}
            />
          </div>
        </div>
      </div>

      {/* Chat Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiMessageCircle className="w-5 h-5 text-secondary-400" />
          Chat Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-white">Profanity Filter</h3>
              <p className="text-sm text-dark-400">
                Automatically filter inappropriate language
              </p>
            </div>
            <Toggle
              value={settings.profanityFilter}
              onChange={(v) => handleChange('profanityFilter', v)}
            />
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <h3 className="font-medium text-white mb-2">Max Message Length</h3>
            <input
              type="number"
              value={settings.maxMessageLength}
              onChange={(e) =>
                handleChange('maxMessageLength', parseInt(e.target.value))
              }
              min={100}
              max={5000}
              className="input-field"
            />
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <h3 className="font-medium text-white mb-2">
              Chat Retention (Days)
            </h3>
            <input
              type="number"
              value={settings.chatRetentionDays}
              onChange={(e) =>
                handleChange('chatRetentionDays', parseInt(e.target.value))
              }
              min={1}
              max={365}
              className="input-field"
            />
            <p className="text-xs text-dark-500 mt-1">
              Messages older than this will be automatically deleted
            </p>
          </div>
        </div>
      </div>

      {/* Safety Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiShield className="w-5 h-5 text-green-400" />
          Safety & Moderation
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-dark-700/50 rounded-lg">
            <h3 className="font-medium text-white mb-2">Max Search Radius (KM)</h3>
            <input
              type="number"
              value={settings.maxRadius}
              onChange={(e) =>
                handleChange('maxRadius', parseInt(e.target.value))
              }
              min={1}
              max={50}
              className="input-field"
            />
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <h3 className="font-medium text-white mb-2">
              Auto-Suspend Threshold
            </h3>
            <input
              type="number"
              value={settings.autoSuspendThreshold}
              onChange={(e) =>
                handleChange('autoSuspendThreshold', parseInt(e.target.value))
              }
              min={1}
              max={10}
              className="input-field"
            />
            <p className="text-xs text-dark-500 mt-1">
              Number of valid reports before auto-suspension
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-white">Email Verification</h3>
              <p className="text-sm text-dark-400">
                Require users to verify their email address
              </p>
            </div>
            <Toggle
              value={settings.requireEmailVerification}
              onChange={(v) => handleChange('requireEmailVerification', v)}
            />
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="card border-yellow-500/30">
        <div className="flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-300">
              Important Considerations
            </h3>
            <p className="text-sm text-dark-400 mt-1">
              Changing these settings affects all users immediately. Make sure
              to communicate any major changes to your user base. Some settings
              like maintenance mode will disconnect all active users.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings