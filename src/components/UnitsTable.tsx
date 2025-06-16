
import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Search, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Unit {
  unitId: string;
  unitName: string;
  unitType: string;
  isDeployed: boolean;
  standardCategoryId: string;
  flowFactor: number;
  deviceId: string;
}

interface UnitsTableProps {
  units: Unit[];
  onEditUnit: (unit: Unit) => void;
}

export function UnitsTable({ units, onEditUnit }: UnitsTableProps) {
  const { hasFullAccess } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Unit>('unitName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (field: keyof Unit) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredAndSortedUnits.map((unit) => (
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
    </div>
  );
}
