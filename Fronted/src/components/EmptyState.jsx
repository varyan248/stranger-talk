const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-10 h-10 text-dark-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-dark-400 max-w-md mb-6">{description}</p>
      )}
      {action && actionLabel && (
        <button onClick={action} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState