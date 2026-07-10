"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/locales/documents";
import { documentsApi } from "@/services/documents";

import DocumentsStatsCards from "@/components/documents/DocumentsStatsCards";
import DocumentsFilters from "@/components/documents/DocumentsFilters";
import DocumentsTable from "@/components/documents/DocumentsTable";
import Pagination from "@/components/invoices/Pagination";
import EmptyState from "@/components/invoices/EmptyState";

import DocumentUploadModal from "@/components/documents/DocumentUploadModal";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import DeleteConfirmationModal from "@/components/documents/DeleteConfirmationModal";
import AppShell from "@/components/AppShell";

export default function DocumentsPage() {
  const { lang, isRtl, setLang, dir } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [filters, setFilters] = useState({
    search: "",
    fileType: "",
    page: 1,
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 20,
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await documentsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch document stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentsApi.getDocuments(filters);
      setDocuments(data.documents);
      setPagination({
        total: data.total,
        pages: data.pages,
        limit: data.limit,
      });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // Debounce search filter
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const hasActiveFilters = filters.search !== "" || filters.fileType !== "";

  const handleSuccess = () => {
    fetchStats();
    fetchDocuments();
  };

  return (
    <AppShell activeKey="documents" lang={lang} setLang={setLang}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6" dir={dir}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("page.documents", lang)}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {t("page.documentsSubtitle", lang)}
          </p>
        </div>
        
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#1b2b6b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:ring-offset-slate-900"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t("action.upload", lang)}
          </button>
        </div>
      </div>

      <DocumentsStatsCards stats={stats} loading={statsLoading} />

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <DocumentsFilters 
          filters={filters} 
          isRtl={isRtl} 
          onChange={handleFilterChange} 
          t={t} 
          lang={lang} 
        />
        
        {!loading && documents.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? t("state.emptyFiltered", lang) : t("state.empty", lang)}
            hint={hasActiveFilters ? t("state.emptyFilteredHint", lang) : t("state.emptyHint", lang)}
          />
        ) : (
          <DocumentsTable 
            documents={documents} 
            loading={loading} 
            lang={lang} 
            t={t} 
            isRtl={isRtl}
            onPreview={setPreviewId}
            onDelete={setDeleteId}
          />
        )}
        
        {documents.length > 0 && (
          <Pagination
            page={filters.page}
            pages={pagination.pages}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={(page) => handleFilterChange({ page })}
            t={(key) => t(key, lang)}
            isRtl={isRtl}
          />
        )}
      </div>

      <DocumentUploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleSuccess}
        t={(key) => t(key, lang)}
      />

      <DocumentPreviewModal
        documentId={previewId}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
        t={(key) => t(key, lang)}
      />

      <DeleteConfirmationModal
        documentId={deleteId}
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onSuccess={handleSuccess}
        t={(key) => t(key, lang)}
      />
      </div>
    </AppShell>
  );
}
