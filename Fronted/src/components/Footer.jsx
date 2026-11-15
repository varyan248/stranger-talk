import { Link } from 'react-router-dom'
import { FiMessageCircle, FiGithub, FiTwitter, FiMail } from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-800 border-t border-dark-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <FiMessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">NearTalk</span>
            </Link>
            <p className="text-dark-400 text-sm max-w-md">
              Meet someone nearby. Start a conversation. Make a connection.
              Connect with people in your area safely and securely.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@neartalk.com"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiMail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/nearby" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Find People
                </Link>
              </li>
              <li>
                <Link to="/random-chat" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Random Chat
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Safety Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-400 text-sm">
            © {currentYear} NearTalk. All rights reserved.
          </p>
          <p className="text-dark-500 text-xs">
            Made with ❤️ for connecting people nearby
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer