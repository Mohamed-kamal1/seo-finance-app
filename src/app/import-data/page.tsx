import ExcelImportForm from "@/components/ExcelImportForm";

export default function ImportDataPage() {
  return <div className="p-8"><header className="mb-6"><h1 className="font-display text-2xl text-white">Import Excel data</h1><p className="text-sm text-muted mt-1">Upload one workbook. Each sheet is imported into the matching finance page.</p></header><ExcelImportForm /></div>;
}
