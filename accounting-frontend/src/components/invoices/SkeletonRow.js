export default function SkeletonRow() {
  return (
    <tr className="h-[52px] animate-pulse border-b border-slate-100">
      <td className="px-4 py-3">
        <div className="h-4 w-4 rounded bg-slate-200" />
      </td>
      {Array.from({ length: 8 }).map((_, index) => (
        <td className="px-4 py-3" key={index}>
          <div className="h-3 w-full max-w-[130px] rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}
