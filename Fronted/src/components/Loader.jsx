const Loader = ({ fullScreen = false, size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-dark-400 text-sm animate-pulse">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>
}

export default Loader