import { useState, useEffect } from "react"
import { Proforma, Unit, UnitType, saveProforma } from "@/lib/session-storage"

interface UseUnitMixProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

interface NewUnitType {
  name: string;
  description: string;
}

interface NewUnit {
  name: string;
  area: string;
  value: string;
  quantity: string;
}

interface EditingUnitGroup {
  unitTypeId: string;
  groupKey: string;
}

export function useUnitMix({ proforma, onProformaChange }: UseUnitMixProps) {
  const [newUnitType, setNewUnitType] = useState<NewUnitType>({ name: '', description: '' })
  const [newUnit, setNewUnit] = useState<NewUnit>({ 
    name: '', 
    area: '', 
    value: '', 
    quantity: '1' 
  })
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<string | null>(null)
  const [isUnitTypeDialogOpen, setIsUnitTypeDialogOpen] = useState(false)
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false)
  const [expandedUnitTypes, setExpandedUnitTypes] = useState<Record<string, boolean>>(() => {
    // Initialize with all unit types expanded
    return proforma.unitMix.reduce((acc, unitType) => {
      acc[unitType.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  })
  const [editingUnitGroup, setEditingUnitGroup] = useState<EditingUnitGroup | null>(null)
  const [unitDialogMode, setUnitDialogMode] = useState<'add' | 'edit'>('add')

  // Add useEffect to save changes to session storage
  useEffect(() => {
    onProformaChange(proforma);
    saveProforma(proforma.projectId, proforma);
  }, [proforma.unitMix]);

  const handleAddUnitType = () => {
    const newUnitTypeObj: UnitType = {
      id: Date.now().toString(),
      name: newUnitType.name,
      description: newUnitType.description,
      units: []
    }
    const updatedProforma: Proforma = {
      ...proforma,
      unitMix: [...proforma.unitMix, newUnitTypeObj]
    }
    onProformaChange(updatedProforma)
    setNewUnitType({ name: '', description: '' })
    setIsUnitTypeDialogOpen(false)
  }

  const handleAddUnits = (unitTypeId: string) => {
    if (editingUnitGroup && editingUnitGroup.unitTypeId === unitTypeId) {
      // Edit mode: update all units in the group
      const updatedProforma: Proforma = {
        ...proforma,
        unitMix: proforma.unitMix.map(ut => {
          if (ut.id !== unitTypeId) return ut;
          const groupKey = editingUnitGroup.groupKey;
          const filteredUnits = ut.units.filter(u => `${u.name}|${u.area}|${u.value}` !== groupKey);
          const newUnits = Array.from({ length: parseInt(newUnit.quantity) || 1 }, (_, i) => ({
            id: `${unitTypeId}-${Date.now()}-${i}`,
            name: newUnit.name,
            area: parseInt(newUnit.area) || 0,
            value: parseInt(newUnit.value) || 0
          }));
          return { ...ut, units: [...filteredUnits, ...newUnits] };
        })
      };
      onProformaChange(updatedProforma)
      setEditingUnitGroup(null);
    } else {
      // Add mode: add new units as before
      const unitType = proforma.unitMix.find(ut => ut.id === unitTypeId);
      if (!unitType) return;
      const newUnits = Array.from({ length: parseInt(newUnit.quantity) || 1 }, (_, i) => ({
        id: `${unitTypeId}-${Date.now()}-${i}`,
        name: newUnit.name,
        area: parseInt(newUnit.area) || 0,
        value: parseInt(newUnit.value) || 0
      }));
      const updatedProforma: Proforma = {
        ...proforma,
        unitMix: proforma.unitMix.map(ut => 
          ut.id === unitTypeId 
            ? { ...ut, units: [...ut.units, ...newUnits] }
            : ut
        )
      };
      onProformaChange(updatedProforma)
    }
    setExpandedUnitTypes(prev => ({ ...prev, [unitTypeId]: true }));
    setNewUnit({ name: '', area: '', value: '', quantity: '1' });
    setIsUnitDialogOpen(false);
  }

  const toggleUnitType = (unitTypeId: string) => {
    setExpandedUnitTypes(prev => ({
      ...prev,
      [unitTypeId]: !prev[unitTypeId]
    }))
  }

  const handleDeleteUnit = (unitTypeId: string, unitId: string) => {
    // Find the unit to get its properties
    const unitType = proforma.unitMix.find(ut => ut.id === unitTypeId);
    if (!unitType) return;
    
    const unitToDelete = unitType.units.find(u => u.id === unitId);
    if (!unitToDelete) return;

    // Create the group key for the unit to delete
    const groupKey = `${unitToDelete.name}|${unitToDelete.area}|${unitToDelete.value}`;

    // Remove all units that match this group key
    const updatedProforma: Proforma = {
      ...proforma,
      unitMix: proforma.unitMix.map(ut => 
        ut.id === unitTypeId 
          ? {
              ...ut,
              units: ut.units.filter(u => `${u.name}|${u.area}|${u.value}` !== groupKey)
            }
          : ut
      )
    };
    onProformaChange(updatedProforma)
  }

  // Helper to collate units by name, area, value
  const collateUnits = (units: Unit[]): Array<Unit & { quantity: number; ids: string[], groupKey: string }> => {
    const map = new Map<string, Unit & { quantity: number; ids: string[], groupKey: string }>();
    units.forEach((unit: Unit) => {
      const key = `${unit.name}|${unit.area}|${unit.value}`;
      if (map.has(key)) {
        map.get(key)!.quantity += 1;
        map.get(key)!.ids.push(unit.id);
      } else {
        map.set(key, { ...unit, quantity: 1, ids: [unit.id], groupKey: key });
      }
    });
    return Array.from(map.values());
  }

  return {
    newUnitType,
    setNewUnitType,
    newUnit,
    setNewUnit,
    selectedUnitTypeId,
    setSelectedUnitTypeId,
    isUnitTypeDialogOpen,
    setIsUnitTypeDialogOpen,
    isUnitDialogOpen,
    setIsUnitDialogOpen,
    expandedUnitTypes,
    editingUnitGroup,
    setEditingUnitGroup,
    unitDialogMode,
    setUnitDialogMode,
    handleAddUnitType,
    handleAddUnits,
    toggleUnitType,
    handleDeleteUnit,
    collateUnits
  }
} 