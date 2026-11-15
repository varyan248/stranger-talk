import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  FiMapPin,
  FiMessageCircle,
  FiShuffle,
  FiShield,
  FiUsers,
  FiZap,
  FiLock,
  FiHeart,
  FiArrowRight,
} from 'react-icons/fi'

const Home = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: FiMapPin,
      title: 'Discover Nearby',
      description:
        'Find people within 5 KM of your location. Connect with those around you.',
    },
    {
      icon: FiMessageCircle,
      title: 'Real-Time Chat',
      description:
        'Instant messaging with typing indicators, emojis, and read receipts.',
    },
    {
      icon: FiShuffle,
      title: 'Random Matching',
      description:
        'Feeling adventurous? Get matched with a random stranger nearby.',
    },
    {
      icon: FiShield,
      title: 'Safe & Private',
      description:
        'Your exact location is never shared. Block and report features included.',
    },
    {
      icon: FiUsers,
      title: 'Interest Matching',
      description:
        'Connect with people who share your hobbies and interests.',
    },
    {
      icon: FiZap,
      title: 'Instant Connect',
      description:
        'No waiting. Start conversations immediately with online users.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up with your email and create your profile in seconds.',
    },
    {
      number: '02',
      title: 'Share Location',
      description:
        'Allow location access to discover people nearby. Your exact location stays private.',
    },
    {
      number: '03',
      title: 'Start Chatting',
      description:
        'Browse nearby users, send a message, and make new connections.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      {isAuthenticated && <Navbar />}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-dark-900 to-secondary-600/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-600/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 border border-primary-600/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-online rounded-full animate-pulse" />
              <span className="text-sm text-primary-300">
                Connect with people nearby
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Meet Someone{' '}
              <span className="text-gradient">Nearby</span>
            </h1>

            <p className="text-lg sm:text-xl text-dark-300 mb-10 max-w-2xl mx-auto">
              Start a conversation. Make a connection. Discover people in your
              area who share your interests.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/nearby"
                  className="btn-primary flex items-center gap-2 text-lg px-8 py-3.5 w-full sm:w-auto justify-center"
                >
                  <FiMapPin className="w-5 h-5" />
                  Find People Nearby
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary flex items-center gap-2 text-lg px-8 py-3.5 w-full sm:w-auto justify-center"
                  >
                    Get Started Free
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-outline text-lg px-8 py-3.5 w-full sm:w-auto justify-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
              {[
                { value: '5 KM', label: 'Search Radius' },
                { value: '100%', label: 'Private' },
                { value: '24/7', label: 'Available' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gradient">
                    {stat.value}
                  </p>
                  <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Get started in three simple steps and start connecting with people
              around you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="card text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-dark-400">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FiArrowRight className="w-6 h-6 text-primary-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose NearTalk?
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Packed with features to help you connect with people nearby safely
              and easily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card-hover group">
                <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
                <FiLock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300">Privacy First</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Your Privacy is Our Priority
              </h2>

              <p className="text-dark-400 mb-8">
                We take your safety seriously. NearTalk is designed with privacy
                at its core, ensuring you can connect with others without
                compromising your personal information.
              </p>

              <ul className="space-y-4">
                {[
                  'Exact GPS coordinates are never shared',
                  'Only approximate distances are shown',
                  'Block and report users instantly',
                  'Control who can message you',
                  'Delete conversations anytime',
                  'Email addresses stay private',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                    <span className="text-dark-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center">
                    <FiShield className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Safety Center</h3>
                    <p className="text-xs text-dark-400">Always protecting you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Location Privacy', value: 'Enabled' },
                    { label: 'Message Encryption', value: 'Active' },
                    { label: 'Report System', value: '24/7' },
                    { label: 'Account Security', value: 'Strong' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg"
                    >
                      <span className="text-sm text-dark-300">{item.label}</span>
                      <span className="text-sm font-medium text-green-400">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card bg-gradient-to-br from-primary-600/20 to-secondary-600/20 border-primary-600/30">
            <FiHeart className="w-12 h-12 text-primary-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Make New Connections?
            </h2>
            <p className="text-dark-300 mb-8 max-w-2xl mx-auto">
              Join thousands of people already connecting with others nearby.
              It's free, safe, and takes just seconds to get started.
            </p>

            {isAuthenticated ? (
              <Link
                to="/nearby"
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3.5"
              >
                <FiMapPin className="w-5 h-5" />
                Find People Nearby
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3.5"
              >
                Create Free Account
                <FiArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home