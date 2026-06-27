

export default function ClientStatCards({ totalClients, totalVendors, totalBalance }) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-20 mb-6">

      {/* Total Clients */}
      <div className="bg-white rounded-2xl px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[.07em] text-gray-400 mb-2.5">
          Total Clients
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] sm:text-[32px] font-extrabold text-gray-900">
            {totalClients}
          </span>

        </div>
      </div>

      {/* Total Vendors */}
      <div className="bg-white rounded-2xl px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[.07em] text-gray-400 mb-2.5">
          Total Vendors
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] sm:text-[32px] font-extrabold text-gray-900">
            {totalVendors}
          </span>

        </div>
      </div>


    </div>
  );
}
