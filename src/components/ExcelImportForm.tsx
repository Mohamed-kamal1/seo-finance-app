"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { importExcel, exportTemplate, exportAllData } from "@/app/import-data/actions";

interface ExcelImportFormProps {
  totalRows?: number;
}

export default function ExcelImportForm({ totalRows = 0 }: ExcelImportFormProps) {
  const [message, setMessage] = useState<string>();
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [downloading, setDownloading] = useState<"template" | "export" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) return;
    setElapsedSeconds(0);
    const interval = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [loading]);

  async function submit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    setMessage(undefined);
    setIsError(false);
    const response = await importExcel(formData);
    setLoading(false);
    setIsError(Boolean(response.error));
    if (response.error) {
      setMessage(response.error);
    } else {
      const counts = response.result?.counts || {};
      const countEntries = Object.entries(counts);
      const totalImported = countEntries.reduce((sum, [, count]) => sum + (count as number), 0);
      const summary = countEntries.map(([table, count]) => `${count} ${table.replace(/_/g, " ")}`).join(", ");
      setMessage(
        `Import complete. ${totalImported} row${totalImported === 1 ? "" : "s"} added: ${summary}.${response.result?.skipped?.length ? ` Skipped sheets: ${response.result.skipped.join(", ")}.` : ""}`
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith(".xlsx")) {
        setSelectedFile(file);
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        }
      } else {
        setMessage("Only .xlsx files are supported.");
        setIsError(true);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    if (file && !file.name.toLowerCase().endsWith(".xlsx")) {
      setMessage("Only .xlsx files are supported.");
      setIsError(true);
    } else {
      setMessage(undefined);
      setIsError(false);
    }
  }, []);

  async function handleDownloadTemplate() {
    setDownloading("template");
    try {
      const result = await exportTemplate();
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.base64}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setMessage("Failed to generate template.");
      setIsError(true);
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadAll() {
    setDownloading("export");
    try {
      const result = await exportAllData();
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.base64}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setMessage("Failed to export data.");
      setIsError(true);
    } finally {
      setDownloading(null);
    }
  }

  const supportedSheets = [
    "Currencies", "Clients", "Invoices",
    "Classifications", "Treasuries",
    "Transactions", "Guest Posts", "Guest Post Ledger",
    "Content Billing", "Content Details",
  ];

  return (
    <div className="space-y-6">
      {/* Download template card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-white mb-1">Download Import Template</h2>
            <p className="text-xs text-muted leading-5">
              Get a pre-formatted Excel workbook with all supported sheet names and column headers.
              Fill in your data and upload it below.
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            disabled={downloading === "template"}
            className="shrink-0 border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent rounded-md px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading === "template" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Template
              </>
            )}
          </button>
        </div>

        {/* Supported sheets accordion */}
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform ${showDetails ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {showDetails ? "Hide" : "Show"} supported sheets ({supportedSheets.length})
          </button>
          {showDetails && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {supportedSheets.map((sheet) => (
                <div key={sheet} className="text-xs text-muted bg-panel2 rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent shrink-0">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {sheet}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload card */}
      <form action={submit} aria-busy={loading} className="card p-6">
        <fieldset disabled={loading} className="disabled:opacity-60">
          <h2 className="text-sm font-medium text-white mb-1">Upload Excel Workbook</h2>
          <p className="text-xs text-muted leading-5 mb-4">
            Upload your filled-in workbook. Each sheet is matched to a finance table by name.
            The first row must contain column headers.
          </p>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all ${
              isDragOver
                ? "border-accent bg-accent-dim"
                : selectedFile
                  ? "border-accent/50 bg-accent-dim/50"
                  : "border-line hover:border-accent/50 hover:bg-panel2"
            }`}
          >
            <input
              ref={fileInputRef}
              id="workbook"
              name="workbook"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-accent-dim border border-accent/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <p className="text-sm text-white font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &middot; Click or drop to change
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-panel2 border border-line">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm text-muted">
                  <span className="text-white font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted mt-1">.xlsx files only</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="bg-accent text-ink text-sm font-medium rounded-md px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Import Workbook
                </>
              )}
            </button>

            {selectedFile && !loading && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setMessage(undefined);
                  setIsError(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-muted hover:text-white transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>
        </fieldset>

        {/* Result message */}
        {message && (
          <div className={`mt-5 pt-5 border-t border-line flex items-start gap-3 ${isError ? "text-danger" : "text-muted"}`}>
            <div className={`shrink-0 mt-0.5 ${isError ? "text-danger" : "text-accent"}`}>
              {isError ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm ${isError ? "text-danger" : "text-white"}`}>
                {isError ? "Import failed" : "Import successful"}
              </p>
              <p className="text-xs mt-1 leading-5">{isError ? message : message}</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div role="status" aria-live="assertive" className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
            <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-6 text-center shadow-2xl">
              <span className="mx-auto mb-4 block h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              <h2 className="font-display text-lg text-white">Importing Workbook</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Your file is being read and its data is being loaded into the database.
                Please keep this page open and do not submit again.
              </p>

              {/* Progress indicator */}
              <div className="mt-5 flex items-center justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s`, opacity: 0.6 }}
                  />
                ))}
              </div>

              <p className="mt-4 text-xs text-accent">
                Working for {elapsedSeconds} second{elapsedSeconds === 1 ? "" : "s"}…
              </p>
            </div>
          </div>
        )}
      </form>

      {/* Export all data */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-white mb-1">Export All Database Data</h2>
            <p className="text-xs text-muted leading-5">
              Download all records currently in the database as a single Excel workbook.
              Each table becomes a separate sheet. Useful for backups or offline analysis.
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={downloading === "export" || totalRows === 0}
            className="shrink-0 border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent rounded-md px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading === "export" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download All Data (.xlsx)
              </>
            )}
          </button>
        </div>
        {totalRows > 0 && (
          <p className="mt-3 text-xs text-muted">
            {totalRows.toLocaleString()} total records available for export
          </p>
        )}
      </div>
    </div>
  );
}

