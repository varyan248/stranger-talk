import { Link } from 'react-router-dom'
import { FiHome, FiCompass } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-dark-400 max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
          <Link to="/nearby" className="btn-outline flex items-center gap-2">
            <FiCompass className="w-4 h-4" />
            Find People
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound