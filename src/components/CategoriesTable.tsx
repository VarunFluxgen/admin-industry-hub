
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Folder } from "lucide-react";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { useAuth } from "@/contexts/AuthContext";

interface CategoriesTableProps {
  categories: any;
  allUnits: any[];
  industryId: string;
  onRefresh: () => void;
}

export function CategoriesTable({ categories, allUnits, industryId, onRefresh }: CategoriesTableProps) {
  const { hasFullAccess } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const handleEditCategory = (category: any, subCategory: any) => {
    // Only allow editing if user has full access
    if (hasFullAccess()) {
      setSelectedCategory(category);
      setSelectedSubCategory(subCategory);
      setShowEditDialog(true);
    }
  };

  const categoryEntries = Object.entries(categories || {});

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Sub-Category</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>SI Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryEntries.map(([categoryId, category]: [string, any]) => 
              category.subCategories?.map((subCategory: any) => (
                <TableRow key={`${categoryId}-${subCategory.id}`}>
                  <TableCell className="font-medium">{category.displayName}</TableCell>
                  <TableCell>{subCategory.displayName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {subCategory.units?.length > 0 ? (
                        <>
                          {subCategory.units.slice(0, 2).map((unitId: string) => (
                            <Badge key={unitId} variant="outline" className="text-xs">
                              {unitId}
                            </Badge>
                          ))}
                          {subCategory.units.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{subCategory.units.length - 2} more
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No units</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{category.siUnit}</TableCell>
                  <TableCell>
                    <Badge variant={category.enabled ? "default" : "secondary"}>
                      {category.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCategory(category, subCategory)}
                      disabled={!hasFullAccess()}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {categoryEntries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="mx-auto h-8 w-8 mb-2" />
            No categories found. Create your first category to get started.
          </div>
        )}
      </div>

      {hasFullAccess() && (
        <EditCategoryDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          category={selectedCategory}
          subCategory={selectedSubCategory}
          allUnits={allUnits}
          industryId={industryId}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
