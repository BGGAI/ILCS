export const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white/80 flex justify-center items-center">
    <LoadingSpinner />
  </div>
);
