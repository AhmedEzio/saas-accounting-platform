export default function ClientBadge({ type }) {
  const isClient = type === "client";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${isClient
          ? "bg-[#e8ecff] text-[#3451d1]"
          : "bg-[#d3f9d8] text-[#2f9e44]"
        }`}
    >
      {type}
    </span>
  );
}
