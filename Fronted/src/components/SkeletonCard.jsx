const SkeletonCard = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-dark-700" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-dark-700 rounded w-1/3" />
          <div className="h-3 bg-dark-700 rounded w-1/4" />
          <div className="h-3 bg-dark-700 rounded w-full" />
          <div className="h-3 bg-dark-700 rounded w-2/3" />
          <div className="flex gap-2 mt-3">
            <div className="h-9 bg-dark-700 rounded flex-1" />
            <div className="h-9 bg-dark-700 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const SkeletonChatItem = () => {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-dark-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-dark-700 rounded w-1/2" />
        <div className="h-3 bg-dark-700 rounded w-3/4" />
      </div>
    </div>
  )
}

export const SkeletonMessage = ({ isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-pulse`}>
      <div
        className={`h-10 rounded-2xl bg-dark-700 ${
          isOwn ? 'w-48' : 'w-56'
        }`}
      />
    </div>
  )
}

export default SkeletonCard