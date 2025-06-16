
import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Search, ArrowUpDown, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Unit {
  unitId: string;
  unitName: string;
  unitType: string;
  isDeployed: boolean;
  standardCategoryId: string;
  flowFactor: number;
  deviceId: string;
  // Add all the detailed properties that come from industry data
  unitThreshold?: number;
  alertEnabled?: any;
  interpoaltionDisabled?: boolean;
  height?: number;
  maxCapacity?: number;
  createdTime?: string;
  iothubConfig?: any;
  params?: string[];
  siUnit?: any;
  lowThreshold?: any;
  highThreshold?: any;
  min?: any;
  max?: any;
  meta?: any;
  manualMeterType?: string;
}

interface UnitsTableProps {
  units: Unit[];
  onEditUnit: (unit: Unit) => void;
}

export function UnitsTable({ units, onEditUnit }: UnitsTableProps) {
  const { hasFullAccess } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Unit>('unitName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const itemsPerPage = 10;

  const filteredAndSortedUnits = useMemo(() => {
    if (!units || units.length === 0) {
      return [];
    }

    let filtered = units.filter(unit => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (unit.unitId || '').toLowerCase().includes(searchLower) ||
        (unit.unitName || '').toLowerCase().includes(searchLower) ||
        (unit.unitType || '').toLowerCase().includes(searchLower) ||
        (unit.standardCategoryId || '').toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === 'asc' 
          ? (aVal === bVal ? 0 : aVal ? 1 : -1)
          : (aVal === bVal ? 0 : aVal ? -1 : 1);
      }
      
      return 0;
    });
  }, [units, searchTerm, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUnits = filteredAndSortedUnits.slice(startIndex, endIndex);

  const handleSort = (field: keyof Unit) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const fetchDetailedUnitData = async (unitId: string) => {
    try {
      const response = await fetch(
        `https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/unit/${unitId}/details`,
        {
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA'
          }
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        console.warn(`Failed to fetch detailed data for unit ${unitId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching detailed data for unit ${unitId}:`, error);
      return null;
    }
  };

  const handleDownloadExcel = async () => {
    if (!units || units.length === 0) {
      return;
    }

    setIsDownloading(true);
    
    try {
      toast({
        title: 'Preparing Download',
        description: 'Preparing complete unit data for export...',
      });

      // Use the complete unit data that's already available from industry details
      const excelData = units.map((unit) => {
        const baseData = {
          'Unit ID': unit.unitId,
          'Unit Name': unit.unitName,
          'Unit Type': unit.unitType || 'N/A',
          'Category': unit.standardCategoryId,
          'Status': unit.isDeployed ? 'Deployed' : 'Not Deployed',
          'Flow Factor': unit.flowFactor,
          'Device ID': unit.deviceId || 'N/A'
        };

        // Add IoT Hub configuration data
        if (unit.iothubConfig) {
          baseData['IoT Hub Device ID'] = unit.iothubConfig.iothubdeviceId || 'N/A';
          baseData['IoT Hub Device Type'] = unit.iothubConfig.iothubdeviceType || 'N/A';
          baseData['Slave ID'] = unit.iothubConfig.slaveId || 'N/A';
          baseData['Meter Type'] = unit.iothubConfig.metertype || 'N/A';
          baseData['Stream ID'] = unit.iothubConfig.streamId || 'N/A';
          
          // Add tank-specific settings
          if (unit.iothubConfig.tankHeight !== undefined) {
            baseData['Tank Height'] = unit.iothubConfig.tankHeight;
          }
          if (unit.iothubConfig.sensorHeight !== undefined) {
            baseData['Sensor Height'] = unit.iothubConfig.sensorHeight;
          }
        }

        // Add unit-specific settings
        if (unit.unitThreshold !== undefined) {
          baseData['Unit Threshold'] = unit.unitThreshold;
        }
        if (unit.alertEnabled !== undefined) {
          baseData['Alert Enabled'] = typeof unit.alertEnabled === 'object' 
            ? JSON.stringify(unit.alertEnabled)
            : unit.alertEnabled;
        }
        if (unit.interpoaltionDisabled !== undefined) {
          baseData['Interpolation Disabled'] = unit.interpoaltionDisabled;
        }
        if (unit.height !== undefined) {
          baseData['Height'] = unit.height;
        }
        if (unit.maxCapacity !== undefined) {
          baseData['Max Capacity'] = unit.maxCapacity;
        }
        if (unit.createdTime) {
          baseData['Created Time'] = unit.createdTime;
        }

        // Add quality parameters for quality units
        if (unit.params && Array.isArray(unit.params)) {
          baseData['Quality Parameters'] = unit.params.join(', ');
        }
        if (unit.siUnit && typeof unit.siUnit === 'object') {
          baseData['SI Units'] = JSON.stringify(unit.siUnit);
        }
        if (unit.lowThreshold && typeof unit.lowThreshold === 'object') {
          baseData['Low Thresholds'] = JSON.stringify(unit.lowThreshold);
        }
        if (unit.highThreshold && typeof unit.highThreshold === 'object') {
          baseData['High Thresholds'] = JSON.stringify(unit.highThreshold);
        }
        if (unit.min && typeof unit.min === 'object') {
          baseData['Min Values'] = JSON.stringify(unit.min);
        }
        if (unit.max && typeof unit.max === 'object') {
          baseData['Max Values'] = JSON.stringify(unit.max);
        }

        // Add virtual unit metadata
        if (unit.meta && typeof unit.meta === 'object') {
          if (unit.meta.units) {
            baseData['Virtual Units'] = Array.isArray(unit.meta.units) 
              ? unit.meta.units.join(', ')
              : unit.meta.units;
          }
          if (unit.meta.calculations) {
            baseData['Calculations'] = unit.meta.calculations;
          }
          if (unit.meta.subCategories) {
            baseData['Sub Categories'] = Array.isArray(unit.meta.subCategories)
              ? unit.meta.subCategories.join(', ')
              : unit.meta.subCategories;
          }
        }

        // Add manual meter type for manual units
        if (unit.manualMeterType) {
          baseData['Manual Meter Type'] = unit.manualMeterType;
        }

        return baseData;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Complete Units Data');

      // Generate filename with current timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `complete_units_data_${timestamp}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);

      toast({
        title: 'Download Complete',
        description: `Downloaded complete data for ${units.length} units with IoT hub and settings`,
      });

    } catch (error) {
      console.error('Error downloading Excel file:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the Excel file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const SortableHeader = ({ field, children }: { field: keyof Unit; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        className="h-auto p-0 font-medium hover:bg-transparent"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={sortField} onValueChange={(value) => setSortField(value as keyof Unit)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unitName">Unit Name</SelectItem>
            <SelectItem value="unitId">Unit ID</SelectItem>
            <SelectItem value="unitType">Unit Type</SelectItem>
            <SelectItem value="standardCategoryId">Category</SelectItem>
            <SelectItem value="flowFactor">Flow Factor</SelectItem>
            <SelectItem value="isDeployed">Status</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>
        <Button
          onClick={handleDownloadExcel}
          variant="outline"
          size="sm"
          disabled={!units || units.length === 0 || isDownloading}
          className="shrink-0"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download Complete Data'}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="unitId">Unit ID</SortableHeader>
              <SortableHeader field="unitName">Name</SortableHeader>
              <SortableHeader field="unitType">Type</SortableHeader>
              <SortableHeader field="standardCategoryId">Category</SortableHeader>
              <SortableHeader field="isDeployed">Status</SortableHeader>
              <SortableHeader field="flowFactor">Flow Factor</SortableHeader>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUnits.map((unit) => (
              <TableRow key={unit.unitId}>
                <TableCell className="font-medium">{unit.unitId}</TableCell>
                <TableCell>{unit.unitName}</TableCell>
                <TableCell>{unit.unitType}</TableCell>
                <TableCell>{unit.standardCategoryId}</TableCell>
                <TableCell>
                  <Badge variant={unit.isDeployed ? "default" : "secondary"}>
                    {unit.isDeployed ? "Deployed" : "Not Deployed"}
                  </Badge>
                </TableCell>
                <TableCell>{unit.flowFactor}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditUnit(unit)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSortedUnits.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No units found matching your search.' : 'No units found. Create your first unit to get started.'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedUnits.length)} of {filteredAndSortedUnits.length} units
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
