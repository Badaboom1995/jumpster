export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-700 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded bg-gray-700" />
          ))}
        </div>
      </div>
    </div>
  );
} 