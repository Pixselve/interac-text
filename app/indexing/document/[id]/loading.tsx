export default function () {
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl animate-pulse">🗒️ Loading...</h1>
      <div className="bg-base-300 p-10 rounded-xl animate-pulse space-y-4">
        <span className="text-white bg-gray-400 h-4 w-1/2 block rounded"></span>
        <span className="text-white bg-gray-400 h-4 w-1/3 block rounded"></span>
        <span className="text-white bg-gray-400 h-4 w-full block rounded"></span>
        <span className="text-white bg-gray-400 h-4 w-1/6 block rounded"></span>
        <span className="text-white bg-gray-400 h-4 w-full block rounded"></span>
        <span className="text-white bg-gray-400 h-4 w-1/3 block rounded"></span>
        <span className="text-white bg-gray-400 h-4 w-1/2 block rounded"></span>
      </div>
    </div>
  );
}
