/**
 * Bilingual translation dictionary for the Invoice module.
 * English (LTR) and Arabic (RTL) — natural accounting terminology.
 * No external i18n library. Used with the useLang hook.
 *
 * Usage: import { t } from '@/locales/invoices';
 *        t('key', 'en') → English string
 *        t('key', 'ar') → Arabic string
 */

export const translations = {
  // ── Page titles ───────────────────────────────────────────────────────────
  'page.invoices':            { en: 'Invoices',                                         ar: 'الفواتير' },
  'page.invoicesSubtitle':    { en: 'Create, track, and manage all your invoices.',     ar: 'إنشاء الفواتير وتتبعها وإدارتها بكل سهولة.' },
  'page.createInvoice':       { en: 'Create Invoice',                                   ar: 'إنشاء فاتورة' },
  'page.invoiceDetails':      { en: 'Invoice Details',                                  ar: 'تفاصيل الفاتورة' },

  // ── Invoice types ─────────────────────────────────────────────────────────
  'type.sale':                { en: 'Sale',            ar: 'مبيعات' },
  'type.purchase':            { en: 'Purchase',        ar: 'مشتريات' },
  'type.sales_return':        { en: 'Sales Return',    ar: 'مرتجع مبيعات' },
  'type.purchase_return':     { en: 'Purchase Return', ar: 'مرتجع مشتريات' },
  'type.expense':             { en: 'Expense',         ar: 'مصروفات' },

  // ── Payment status ────────────────────────────────────────────────────────
  'status.paid':              { en: 'Paid',            ar: 'مدفوع' },
  'status.unpaid':            { en: 'Unpaid',          ar: 'غير مدفوع' },
  'status.partial':           { en: 'Partial',         ar: 'مدفوع جزئياً' },
  'status.cancelled':         { en: 'Cancelled',       ar: 'ملغاة' },

  // ── Payment methods ───────────────────────────────────────────────────────
  'method.cash':              { en: 'Cash',            ar: 'نقداً' },
  'method.card':              { en: 'Card',            ar: 'بطاقة' },
  'method.wallet':            { en: 'Wallet',          ar: 'محفظة إلكترونية' },
  'method.bank_transfer':     { en: 'Bank Transfer',   ar: 'تحويل بنكي' },

  // ── Expense types ─────────────────────────────────────────────────────────
  'expense.rent':             { en: 'Rent',            ar: 'إيجار' },
  'expense.salary':           { en: 'Salary',          ar: 'رواتب' },
  'expense.electricity':      { en: 'Electricity',     ar: 'كهرباء' },
  'expense.internet':         { en: 'Internet',        ar: 'إنترنت' },
  'expense.transportation':   { en: 'Transportation',  ar: 'مواصلات' },
  'expense.maintenance':      { en: 'Maintenance',     ar: 'صيانة' },
  'expense.marketing':        { en: 'Marketing',       ar: 'تسويق' },
  'expense.office_supplies':  { en: 'Office Supplies', ar: 'مستلزمات مكتبية' },
  'expense.other':            { en: 'Other',           ar: 'أخرى' },

  // ── Actions ───────────────────────────────────────────────────────────────
  'action.newInvoice':        { en: 'New Invoice',      ar: 'فاتورة جديدة' },
  'action.export':            { en: 'Export',           ar: 'تصدير' },
  'action.cancel':            { en: 'Cancel',           ar: 'إلغاء' },
  'action.cancelInvoice':     { en: 'Cancel Invoice',   ar: 'إلغاء الفاتورة' },
  'action.keepInvoice':       { en: 'Keep Invoice',     ar: 'الاحتفاظ بالفاتورة' },
  'action.return':            { en: 'Create Return',    ar: 'إنشاء مرتجع' },
  'action.save':              { en: 'Save Draft',       ar: 'حفظ مسودة' },
  'action.submit':            { en: 'Save & Send',      ar: 'حفظ وإرسال' },
  'action.addItem':           { en: 'Add Item',         ar: 'إضافة بند' },
  'action.addPayment':        { en: 'Record Payment',   ar: 'تسجيل دفعة' },
  'action.retry':             { en: 'Retry',            ar: 'إعادة المحاولة' },
  'action.back':              { en: 'Back to Invoices', ar: 'العودة للفواتير' },
  'action.view':              { en: 'View',             ar: 'عرض' },
  'action.download':          { en: 'Download',         ar: 'تحميل' },
  'action.more':              { en: 'More',             ar: 'المزيد' },
  'action.createFirst':       { en: 'Create Invoice',   ar: 'إنشاء فاتورة' },
  'action.clearFilters':      { en: 'Clear Filters',    ar: 'مسح الفلاتر' },
  'action.confirm':           { en: 'Confirm',          ar: 'تأكيد' },
  'action.close':             { en: 'Close',            ar: 'إغلاق' },

  // ── Table columns ─────────────────────────────────────────────────────────
  'col.invoiceNo':            { en: 'Invoice No.',      ar: 'رقم الفاتورة' },
  'col.client':               { en: 'Client / Vendor',  ar: 'العميل / المورد' },
  'col.type':                 { en: 'Type',             ar: 'النوع' },
  'col.status':               { en: 'Status',           ar: 'الحالة' },
  'col.finalAmount':          { en: 'Final Amount',     ar: 'المبلغ الإجمالي' },
  'col.dueAmount':            { en: 'Due Amount',       ar: 'المبلغ المستحق' },
  'col.date':                 { en: 'Date',             ar: 'التاريخ' },
  'col.actions':              { en: 'Actions',          ar: 'الإجراءات' },

  // ── Form labels ───────────────────────────────────────────────────────────
  'form.invoiceType':         { en: 'Invoice Type',     ar: 'نوع الفاتورة' },
  'form.client':              { en: 'Client / Vendor',  ar: 'العميل / المورد' },
  'form.paymentMethod':       { en: 'Payment Method',   ar: 'طريقة الدفع' },
  'form.issueDate':           { en: 'Issue Date',       ar: 'تاريخ الإصدار' },
  'form.notes':               { en: 'Notes',            ar: 'ملاحظات' },
  'form.taxPct':              { en: 'Tax %',            ar: 'نسبة الضريبة %' },
  'form.amountPaid':          { en: 'Amount Paid',      ar: 'المبلغ المدفوع' },
  'form.description':         { en: 'Description',      ar: 'الوصف' },
  'form.qty':                 { en: 'Qty',              ar: 'الكمية' },
  'form.unitPrice':           { en: 'Unit Price',       ar: 'سعر الوحدة' },
  'form.total':               { en: 'Total',            ar: 'الإجمالي' },
  'form.subtotal':            { en: 'Subtotal',         ar: 'المجموع الفرعي' },
  'form.tax':                 { en: 'Tax',              ar: 'الضريبة' },
  'form.relatedInvoice':      { en: 'Related Invoice',  ar: 'الفاتورة الأصلية' },
  'form.expenseName':         { en: 'Expense Name',     ar: 'اسم المصروف' },
  'form.expenseType':         { en: 'Expense Category', ar: 'فئة المصروف' },
  'form.expenseDesc':         { en: 'Expense Description', ar: 'وصف المصروف' },
  'form.expenseNotes':        { en: 'Additional Notes', ar: 'ملاحظات إضافية' },
  'form.baseAmount':          { en: 'Amount',           ar: 'المبلغ' },
  'form.reason':              { en: 'Reason',           ar: 'السبب' },
  'form.required':            { en: 'Required',         ar: 'مطلوب' },
  'form.invoiceDetails':      { en: 'Invoice Details',  ar: 'بيانات الفاتورة' },
  'form.ready':               { en: 'Ready',            ar: 'جاهزة' },
  'form.selected':            { en: 'Selected',         ar: 'محدد' },
  'form.clientSelected':      { en: 'Client selected',  ar: 'تم تحديد العميل' },
  'form.searchClient':        { en: 'Search for a client...', ar: 'ابحث عن عميل...' },
  'form.searchVendor':        { en: 'Search for a vendor...', ar: 'ابحث عن مورد...' },
  'form.noClients':           { en: 'No matching clients or vendors found.', ar: 'لا توجد نتائج مطابقة.' },
  'form.relatedInvoicePlaceholder': { en: 'Paste the original invoice ID', ar: 'أدخل معرف الفاتورة الأصلية' },
  'form.relatedInvoiceHint':  { en: 'Use the 24-character original invoice ID for returns.', ar: 'استخدم معرف الفاتورة الأصلية المكوّن من ٢٤ حرفاً للمرتجعات.' },
  'form.removeItem':          { en: 'Remove item',      ar: 'حذف البند' },
  'form.submitting':          { en: 'Creating invoice...', ar: 'جارٍ إنشاء الفاتورة...' },

  // ── Form errors ───────────────────────────────────────────────────────────
  'error.required':           { en: 'This field is required.', ar: 'هذا الحقل مطلوب.' },
  'error.taxRange':           { en: 'Tax must be between 0 and 100.', ar: 'يجب أن تكون الضريبة بين ٠ و١٠٠.' },
  'error.nonNegative':        { en: 'Value cannot be negative.', ar: 'لا يمكن أن تكون القيمة سالبة.' },
  'error.max500':             { en: 'Must not exceed 500 characters.', ar: 'يجب ألا يتجاوز ٥٠٠ حرف.' },
  'error.amountPositive':     { en: 'Amount must be greater than zero.', ar: 'يجب أن يكون المبلغ أكبر من صفر.' },
  'error.validObjectId':      { en: 'Enter a valid 24-character invoice ID.', ar: 'أدخل معرف فاتورة صحيحاً مكوناً من ٢٤ حرفاً.' },
  'error.quantityMin':        { en: 'Quantity must be at least 1.', ar: 'يجب ألا تقل الكمية عن ١.' },
  'error.submitFailed':       { en: 'Could not create invoice. Try again.', ar: 'تعذر إنشاء الفاتورة. حاول مرة أخرى.' },

  // ── Stats cards ───────────────────────────────────────────────────────────
  'stats.totalInvoices':      { en: 'Total Invoices',   ar: 'إجمالي الفواتير' },
  'stats.paidInvoices':       { en: 'Paid Invoices',    ar: 'الفواتير المدفوعة' },
  'stats.unpaidOverdue':      { en: 'Unpaid & Partial',  ar: 'غير مدفوع / جزئي' },
  'stats.outstanding':        { en: 'Outstanding',      ar: 'المستحق' },
  'stats.currentPage':        { en: 'Current page',     ar: 'الصفحة الحالية' },
  'stats.allFiltered':        { en: 'All (filtered)',   ar: 'الكل (مفلتر)' },

  // ── Filters ───────────────────────────────────────────────────────────────
  'filter.search':            { en: 'Search invoices...', ar: 'بحث في الفواتير...' },
  'filter.allTypes':          { en: 'All Types',          ar: 'كل الأنواع' },
  'filter.allStatuses':       { en: 'All Statuses',       ar: 'كل الحالات' },
  'filter.last30':            { en: 'Last 30 Days',       ar: 'آخر ٣٠ يوماً' },
  'filter.showCancelled':     { en: 'Show Cancelled',     ar: 'إظهار الملغية' },
  'filter.allDates':          { en: 'All Dates',          ar: 'كل التواريخ' },

  // ── Pagination ────────────────────────────────────────────────────────────
  'pagination.showing':       { en: 'Showing',            ar: 'عرض' },
  'pagination.to':            { en: 'to',                 ar: 'إلى' },
  'pagination.of':            { en: 'of',                 ar: 'من' },
  'pagination.entries':       { en: 'entries',            ar: 'سجل' },
  'pagination.prev':          { en: 'Previous',           ar: 'السابق' },
  'pagination.next':          { en: 'Next',               ar: 'التالي' },

  // ── Empty & Error states ──────────────────────────────────────────────────
  'state.empty':              { en: 'No invoices yet',                               ar: 'لا توجد فواتير بعد' },
  'state.emptyHint':          { en: 'Create your first invoice to get started.',    ar: 'أنشئ فاتورتك الأولى للبدء.' },
  'state.emptyFiltered':      { en: 'No invoices match your filters.',              ar: 'لا توجد فواتير تطابق الفلاتر المحددة.' },
  'state.emptyFilteredHint':  { en: 'Try adjusting or clearing your filters.',     ar: 'جرّب تعديل الفلاتر أو مسحها.' },
  'state.error':              { en: 'Failed to load invoices',                      ar: 'تعذّر تحميل الفواتير' },
  'state.networkError':       { en: 'Check your internet connection and try again.',ar: 'تحقق من اتصالك بالإنترنت وأعد المحاولة.' },
  'state.loading':            { en: 'Loading invoices...',                          ar: 'جارٍ تحميل الفواتير...' },
  'state.notFound':           { en: 'Invoice not found.',                           ar: 'الفاتورة غير موجودة.' },

  // ── Cancel modal ──────────────────────────────────────────────────────────
  'cancel.title':             { en: 'Cancel Invoice',                                ar: 'إلغاء الفاتورة' },
  'cancel.warning':           { en: 'This action cannot be undone. The invoice will be marked as cancelled and excluded from revenue reports.', ar: 'لا يمكن التراجع عن هذا الإجراء. ستُعلَّم الفاتورة ملغاةً وتُستبعد من تقارير الإيرادات.' },
  'cancel.reasonLabel':       { en: 'Cancellation Reason *',                        ar: 'سبب الإلغاء *' },
  'cancel.reasonPlaceholder': { en: 'Enter reason for cancellation...',             ar: 'أدخل سبب الإلغاء...' },
  'cancel.reasonHint':        { en: 'Minimum 3 characters, maximum 500.',           ar: '٣ أحرف على الأقل وبحد أقصى ٥٠٠.' },
  'cancel.submitting':        { en: 'Cancelling...',                                ar: 'جارٍ الإلغاء...' },
  'cancel.success':           { en: 'Invoice cancelled successfully.',              ar: 'تم إلغاء الفاتورة بنجاح.' },

  // ── Return modal ──────────────────────────────────────────────────────────
  'return.title':             { en: 'Create Return',              ar: 'إنشاء مرتجع' },
  'return.typeLabel':         { en: 'Return Type',                ar: 'نوع المرتجع' },
  'return.salesReturn':       { en: 'Sales Return',               ar: 'مرتجع مبيعات' },
  'return.purchaseReturn':    { en: 'Purchase Return',            ar: 'مرتجع مشتريات' },
  'return.itemsHint':         { en: 'Select items and quantities to return.', ar: 'حدد البنود والكميات المراد إرجاعها.' },
  'return.maxQuantity':       { en: 'Available quantity',        ar: 'الكمية المتاحة' },
  'return.noItems':           { en: 'This invoice has no returnable items.', ar: 'لا تحتوي هذه الفاتورة على بنود قابلة للمرتجع.' },
  'return.quantityTooHigh':   { en: 'Return quantity cannot exceed the original quantity.', ar: 'لا يمكن أن تتجاوز كمية المرتجع الكمية الأصلية.' },
  'return.cannotReturn':      { en: 'This invoice type cannot be returned.', ar: 'لا يمكن إنشاء مرتجع لهذا النوع من الفواتير.' },
  'return.submitting':        { en: 'Creating Return...',         ar: 'جارٍ إنشاء المرتجع...' },

  // ── Payment modal ─────────────────────────────────────────────────────────
  'payment.title':            { en: 'Record Payment',             ar: 'تسجيل دفعة' },
  'payment.amount':           { en: 'Amount',                     ar: 'المبلغ' },
  'payment.method':           { en: 'Payment Method',             ar: 'طريقة الدفع' },
  'payment.notes':            { en: 'Notes (optional)',           ar: 'ملاحظات (اختياري)' },
  'payment.amountTooHigh':    { en: 'Amount cannot be greater than the due amount.', ar: 'لا يمكن أن يكون المبلغ أكبر من المبلغ المستحق.' },
  'payment.submitFailed':     { en: 'Could not record payment. Try again.', ar: 'تعذر تسجيل الدفعة. حاول مرة أخرى.' },
  'payment.submitting':       { en: 'Recording...',               ar: 'جارٍ التسجيل...' },
  'payment.success':          { en: 'Payment recorded.',          ar: 'تم تسجيل الدفعة.' },

  // ── Invoice details ───────────────────────────────────────────────────────
  'details.client':           { en: 'Client Information',         ar: 'بيانات العميل' },
  'details.vendor':           { en: 'Vendor Information',         ar: 'بيانات المورد' },
  'details.items':            { en: 'Line Items',                 ar: 'بنود الفاتورة' },
  'details.summary':          { en: 'Summary',                    ar: 'الملخص' },
  'details.paymentHistory':   { en: 'Payment History',           ar: 'سجل المدفوعات' },
  'details.relatedTo':        { en: 'Related to Invoice',        ar: 'مرتبطة بالفاتورة' },
  'details.cancelledOn':      { en: 'Cancelled on',              ar: 'تاريخ الإلغاء' },
  'details.cancelledBy':      { en: 'Cancelled by',              ar: 'ألغاها' },
  'details.reason':           { en: 'Reason',                    ar: 'السبب' },
  'details.createdBy':        { en: 'Created by',                ar: 'أنشأها' },
  'details.issuedOn':         { en: 'Issued on',                 ar: 'تاريخ الإصدار' },
  'details.invoiceType':      { en: 'Invoice Type',              ar: 'نوع الفاتورة' },
  'details.paymentMethod':    { en: 'Payment Method',            ar: 'طريقة الدفع' },
  'details.notes':            { en: 'Notes',                     ar: 'ملاحظات' },
  'details.noPayments':       { en: 'No payment records yet.',   ar: 'لا توجد سجلات دفع بعد.' },
  'details.paymentHistoryUnavailable': { en: 'Payment history is unavailable right now.', ar: 'سجل المدفوعات غير متاح حالياً.' },
  'details.expenseName':      { en: 'Expense Name',              ar: 'اسم المصروف' },
  'details.expenseType':      { en: 'Expense Category',          ar: 'فئة المصروف' },
};

/**
 * t(key, lang) — look up a translation key.
 * Falls back to English if the Arabic translation is missing.
 * Falls back to the key itself if no translation exists at all.
 */
export const t = (key, lang = 'en') =>
  translations[key]?.[lang] ?? translations[key]?.['en'] ?? key;
