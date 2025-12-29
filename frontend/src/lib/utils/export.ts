/**
 * Export report data to CSV format
 * @param data Report data object
 * @param reportType Type of report (summary, performance, etc.)
 * @param projectName Name of the project
 */
export const exportReportToCSV = (
  data: any,
  reportType: string,
  projectName: string
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${projectName}_${reportType}_${timestamp}.csv`;
  
  // Convert data to array format for CSV
  let csvData: any[] = [];
  
  if (Array.isArray(data)) {
    csvData = data;
  } else if (typeof data === 'object') {
    // Flatten object into rows
    csvData = Object.entries(data).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
    }));
  }
  
  exportToCSV(csvData, filename);
};

/**
 * Export data to CSV format
 * @param data Array of objects to export
 * @param filename Name of the file to download
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        
        // Convert to string
        let strValue = String(value);
        
        // Escape quotes and commas
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          strValue = `"${strValue.replace(/"/g, '""')}"`;
        }
        
        return strValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format date for CSV export
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDateForCSV = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Format number for CSV export
 * @param num Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export const formatNumberForCSV = (num: number | null | undefined, decimals = 2): string => {
  if (num === null || num === undefined) return '';
  return num.toFixed(decimals);
};

/**
 * Export data to PDF (placeholder - not yet implemented)
 * @param projectName Name of the project
 * @param metrics Metrics data
 * @param data Table data to export
 */
export const exportToPDF = (projectName: string, metrics: any, data: any) => {
  console.warn('PDF export not yet implemented');
  // TODO: Implement PDF export using jsPDF or similar library
};

/**
 * Export data to Excel (placeholder - not yet implemented)
 * @param projectName Name of the project
 * @param metrics Metrics data
 * @param data Table data to export
 */
export const exportToExcel = (projectName: string, metrics: any, data: any) => {
  console.warn('Excel export not yet implemented');
  // TODO: Implement Excel export using xlsx library
};
