export default function PresenceCounter() {
  return (
    <span class="bg-base-100 border rounded-xl text-sm p-2 text-center fixed text-primary bottom-4 right-4 z-[100] font-bold flex gap-2">
      <div class="relative w-full h-full">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
        <span>3 pessoas vendo isto</span>
      </div>
    </span>
  );
}
