
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface Unit {
    unitId: string;
    unitName: string;
}

interface SearchableUnitSelectProps {
    units: Unit[];
    selectedUnitId: string;
    onUnitChange: (unitId: string) => void;
    placeholder?: string;
    label?: string;
    includeAllOption?: boolean;
}

export function SearchableUnitSelect({
    units,
    selectedUnitId,
    onUnitChange,
    placeholder = 'Choose a unit',
    label = 'Select Unit',
    includeAllOption = false,
}: SearchableUnitSelectProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Filter units based on search term
    const filteredUnits = units.filter(unit =>
        unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unitId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='space-y-2'>
            <Label htmlFor='unitSearch'>{label}</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <Input
                    id='unitSearch'
                    type="text"
                    placeholder="Search by unit name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            
            <Select
                value={selectedUnitId}
                onValueChange={onUnitChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <ScrollArea className="h-48">
                        {includeAllOption && (
                            <SelectItem value='ALL'>All Units</SelectItem>
                        )}
                        {filteredUnits.map((unit) => (
                            <SelectItem
                                key={unit.unitId}
                                value={unit.unitId}
                            >
                                {unit.unitName} ({unit.unitId})
                            </SelectItem>
                        ))}
                        {filteredUnits.length === 0 && (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                                No units found
                            </div>
                        )}
                    </ScrollArea>
                </SelectContent>
            </Select>
        </div>
    );
}
