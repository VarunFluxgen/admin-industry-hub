
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Settings } from "lucide-react";

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
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Flow Factor</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
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
      {units.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No units found. Create your first unit to get started.
        </div>
      )}
    </div>
  );
}
