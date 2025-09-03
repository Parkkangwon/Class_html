export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Auction Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            </div>

            <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />

            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
