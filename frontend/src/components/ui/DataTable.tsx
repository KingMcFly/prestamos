import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchable?: boolean;
}

export function DataTable<T extends { id: string }>({ 
  data, 
  columns, 
  searchPlaceholder = "Buscar...",
  searchable = true
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    
    return data.filter((item) => {
      return Object.values(item as any).some((val) => 
        String(val).toLowerCase().includes(lowerTerm)
      );
    });
  }, [data, searchTerm]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || typeof column.accessor === 'function') return;

    const key = column.accessor as string;
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-full max-w-xs relative">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <input
               className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
               placeholder={searchPlaceholder}
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setCurrentPage(1); // Reset page on search
               }}
             />
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
            Mostrando {paginatedData.length} de {filteredData.length} registros
          </div>
        </div>
      )}

      {/* Wrapper principal con overflow-hidden para bordes redondeados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Wrapper interno con overflow-x-auto para scroll horizontal */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-800 text-white">
              <tr>
                {columns.map((col, idx) => (
                  <th 
                    key={idx}
                    className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors hover:bg-slate-700 whitespace-nowrap ${col.className || ''}`}
                    onClick={() => handleSort(col)}
                  >
                    <div className={`flex items-center gap-2 ${col.className?.includes('text-right') ? 'justify-end' : col.className?.includes('text-center') ? 'justify-center' : ''}`}>
                      {col.header}
                      {sortConfig.key === col.accessor && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${col.className || ''}`}>
                        {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <Button 
              size="sm" 
              variant="secondary" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página <span className="font-bold">{currentPage}</span> de {totalPages}
            </span>
            <Button 
              size="sm" 
              variant="secondary" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}