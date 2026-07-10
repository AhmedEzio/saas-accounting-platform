export const translations = {
  // Page titles
  'page.documents':           { en: 'Documents',                                  ar: 'المستندات' },
  'page.documentsSubtitle':   { en: 'Manage and organize all your invoice files.',ar: 'إدارة وتنظيم جميع ملفات فواتيرك.' },

  // Stats
  'stats.totalDocuments':     { en: 'Total Documents',                            ar: 'إجمالي المستندات' },
  'stats.pdfFiles':           { en: 'PDF Files',                                  ar: 'ملفات PDF' },
  'stats.imageFiles':         { en: 'Image Files',                                ar: 'ملفات الصور' },
  'stats.processedOCR':       { en: 'Processed OCR',                              ar: 'النصوص المستخرجة' },
  'stats.recentDocuments':    { en: 'Recent (Last 30 Days)',                      ar: 'مضافة حديثاً' },

  // Table columns
  'col.fileName':             { en: 'File Name',                                  ar: 'اسم الملف' },
  'col.fileType':             { en: 'Type',                                       ar: 'النوع' },
  'col.invoiceRef':           { en: 'Invoice Ref.',                               ar: 'رقم الفاتورة' },
  'col.uploadDate':           { en: 'Upload Date',                                ar: 'تاريخ الرفع' },
  'col.actions':              { en: 'Actions',                                    ar: 'الإجراءات' },

  // Table filters & states
  'filter.search':            { en: 'Search documents...',                        ar: 'البحث في المستندات...' },
  'filter.allTypes':          { en: 'All Types',                                  ar: 'جميع الأنواع' },
  'state.empty':              { en: 'No documents yet',                           ar: 'لا توجد مستندات بعد' },
  'state.emptyHint':          { en: 'Upload your first document to get started.', ar: 'ارفع أول مستند لك للبدء.' },
  'state.emptyFiltered':      { en: 'No documents match your filters.',           ar: 'لا توجد مستندات تطابق فلاتر البحث.' },
  
  // Actions & Modals
  'action.upload':            { en: 'Upload Document',                            ar: 'رفع مستند' },
  'action.preview':           { en: 'Preview',                                    ar: 'معاينة' },
  'action.delete':            { en: 'Delete',                                     ar: 'حذف' },
  'action.download':          { en: 'Download',                                   ar: 'تحميل' },
  
  'upload.title':             { en: 'Upload New Document',                        ar: 'رفع مستند جديد' },
  'upload.dragDrop':          { en: 'Drag and drop your file here, or click to browse', ar: 'اسحب وافلت الملف هنا أو انقر للتصفح' },
  'upload.supported':         { en: 'Supported formats: PDF, JPG, PNG',           ar: 'الصيغ المدعومة: PDF, JPG, PNG' },
  'upload.submitting':        { en: 'Uploading...',                               ar: 'جارٍ الرفع...' },
  
  'delete.confirmTitle':      { en: 'Delete Document',                            ar: 'حذف المستند' },
  'delete.confirmMessage':    { en: 'Are you sure you want to delete this document? This action cannot be undone.', ar: 'هل أنت متأكد أنك تريد حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.' },

  // Toasts
  'toast.uploadSuccess':      { en: 'Document uploaded successfully.',            ar: 'تم رفع المستند بنجاح.' },
  'toast.uploadError':        { en: 'Failed to upload document.',                 ar: 'فشل في رفع المستند.' },
  'toast.deleteSuccess':      { en: 'Document deleted.',                          ar: 'تم حذف المستند.' },
  'toast.deleteError':        { en: 'Failed to delete document.',                 ar: 'فشل في حذف المستند.' },
};

export const t = (key, lang = 'en') =>
  translations[key]?.[lang] ?? translations[key]?.['en'] ?? key;
