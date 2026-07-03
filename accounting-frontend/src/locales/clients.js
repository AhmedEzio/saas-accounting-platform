export const translations = {
  // Page
  "page.title":    { en: "Clients", ar: "العملاء" },
  "page.subtitle": { en: "Manage clients and vendors in one place.", ar: "إدارة العملاء والموردين في مكان واحد." },

  // Stat cards
  "stat.totalClients":  { en: "Total Clients", ar: "إجمالي العملاء" },
  "stat.totalVendors":  { en: "Total Vendors", ar: "إجمالي الموردين" },
  "stat.totalBalance":  { en: "Total Balance", ar: "إجمالي الرصيد" },

  // Toolbar
  "toolbar.search":     { en: "Filter by name...", ar: "بحث بالاسم..." },
  "toolbar.tabAll":     { en: "All", ar: "الكل" },
  "toolbar.tabClients": { en: "Clients", ar: "العملاء" },
  "toolbar.tabVendors": { en: "Vendors", ar: "الموردين" },
  "toolbar.sort":       { en: "Sort", ar: "ترتيب" },
  "sort.newest":        { en: "Newest", ar: "الأحدث" },
  "sort.oldest":        { en: "Oldest", ar: "الأقدم" },
  "sort.balanceAsc":    { en: "Balance ↑", ar: "الرصيد ↑" },
  "sort.balanceDesc":   { en: "Balance ↓", ar: "الرصيد ↓" },

  // Table headers
  "col.name":           { en: "Name", ar: "الاسم" },
  "col.phone":          { en: "Phone", ar: "الهاتف" },
  "col.type":           { en: "Type", ar: "النوع" },
  "col.status":         { en: "Status", ar: "الحالة" },
  "col.balance":        { en: "Current Balance", ar: "الرصيد الحالي" },
  "col.created":        { en: "Created Date", ar: "تاريخ الإنشاء" },
  "col.actions":        { en: "Actions", ar: "الإجراءات" },

  // Status
  "status.active":      { en: "Active", ar: "نشط" },
  "status.inactive":    { en: "Inactive", ar: "غير نشط" },

  // Badge types
  "type.client":        { en: "Client", ar: "عميل" },
  "type.vendor":        { en: "Vendor", ar: "مورد" },

  // Empty / pagination
  "table.empty":        { en: "No entries found.", ar: "لا توجد إدخالات." },
  "pagination.showing": { en: "Showing", ar: "عرض" },
  "pagination.to":      { en: "to", ar: "إلى" },
  "pagination.of":      { en: "of", ar: "من" },
  "pagination.entries": { en: "entries", ar: "إدخالات" },
  "pagination.prev":    { en: "Previous", ar: "السابق" },
  "pagination.next":    { en: "Next", ar: "التالي" },

  // Actions
  "action.addClient":   { en: "Add Client", ar: "إضافة عميل" },
  "action.add":         { en: "Add", ar: "إضافة" },
  "action.edit":        { en: "Edit", ar: "تعديل" },
  "action.view":        { en: "View", ar: "عرض" },
  "action.delete":      { en: "Delete", ar: "حذف" },
  "action.reactivate":  { en: "Reactivate", ar: "إعادة تفعيل" },
  "action.cancel":      { en: "Cancel", ar: "إلغاء" },
  "action.retry":       { en: "Retry", ar: "إعادة المحاولة" },

  // Confirm modal
  "confirm.deleteTitle":      { en: "Delete Client", ar: "حذف العميل" },
  "confirm.reactivateTitle":  { en: "Reactivate Client", ar: "إعادة تفعيل العميل" },
  "confirm.deleteMsg":        { en: "Are you sure you want to delete", ar: "هل أنت متأكد من حذف" },
  "confirm.deleteWarning":    { en: "This action cannot be undone.", ar: "لا يمكن التراجع عن هذا الإجراء." },
  "confirm.reactivateMsg":    { en: "Reactivate", ar: "إعادة تفعيل" },
  "confirm.reactivateInfo":   { en: "They will appear as active again.", ar: "سيظهر كنشط مجددًا." },

  // Add modal
  "modal.addTitle":     { en: "Add New Client", ar: "إضافة عميل جديد" },
  "modal.addSubtitle":  { en: "Fill in the details to add a new client or vendor.", ar: "أدخل التفاصيل لإضافة عميل أو مورد جديد." },
  "modal.name":         { en: "Full Name / Company", ar: "الاسم الكامل / الشركة" },
  "modal.namePlaceholder": { en: "e.g. Acme Corp", ar: "مثال: شركة أكمي" },
  "modal.email":        { en: "Email Address", ar: "البريد الإلكتروني" },
  "modal.emailPlaceholder": { en: "contact@example.com", ar: "contact@example.com" },
  "modal.phone":        { en: "Phone Number", ar: "رقم الهاتف" },
  "modal.phonePlaceholder": { en: "+1 (555) 000-0000", ar: "+966 5X XXX XXXX" },
  "modal.type":         { en: "Type", ar: "النوع" },
  "modal.notes":        { en: "Notes", ar: "ملاحظات" },
  "modal.notesPlaceholder": { en: "Write any notes about this client...", ar: "اكتب أي ملاحظات عن هذا العميل..." },
  "modal.required":     { en: "All fields are required.", ar: "جميع الحقول مطلوبة." },

  // Error
  "error.load":         { en: "Failed to load clients", ar: "فشل تحميل العملاء" },
  "error.retry":        { en: "Retry", ar: "إعادة المحاولة" },
};

export function t(key, lang = "en") {
  return translations[key]?.[lang] ?? translations[key]?.en ?? key;
}
