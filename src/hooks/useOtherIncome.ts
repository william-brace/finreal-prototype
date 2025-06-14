import { useState, useEffect } from "react"
import { Proforma, OtherIncome, saveProforma } from "@/lib/session-storage"

interface UseOtherIncomeProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

interface NewOtherIncome {
  name: string;
  description: string;
  value: string;
  unitType: string;
  numberOfUnits: string;
  valuePerUnit: string;
  customUnitType: string;
}

export function useOtherIncome({ proforma, onProformaChange }: UseOtherIncomeProps) {
  const [newOtherIncome, setNewOtherIncome] = useState<NewOtherIncome>({ 
    name: '', 
    description: '', 
    value: '',
    unitType: '',
    numberOfUnits: '1',
    valuePerUnit: '',
    customUnitType: ''
  })
  const [isOtherIncomeDialogOpen, setIsOtherIncomeDialogOpen] = useState(false)
  const [editingOtherIncomeDialog, setEditingOtherIncomeDialog] = useState<OtherIncome | null>(null)

  const unitTypeDisplayNames: Record<string, string> = {
    parking: 'Parking Space',
    storage: 'Storage Unit',
    retail: 'Retail Space',
  };

  // Add useEffect to save changes to session storage
  useEffect(() => {
    onProformaChange(proforma);
    saveProforma(proforma.projectId, proforma);
  }, [proforma.otherIncome]);

  const handleAddOrEditOtherIncome = () => {
    const unitType = newOtherIncome.unitType === 'other' ? newOtherIncome.customUnitType : newOtherIncome.unitType;
    const totalValue = parseInt(newOtherIncome.numberOfUnits) * parseInt(newOtherIncome.valuePerUnit);

    const newOtherIncomeObj: OtherIncome = {
      id: editingOtherIncomeDialog ? editingOtherIncomeDialog.id : Date.now().toString(),
      name: newOtherIncome.name,
      description: newOtherIncome.description,
      value: totalValue,
      unitType: unitType || '',
      numberOfUnits: parseInt(newOtherIncome.numberOfUnits),
      valuePerUnit: parseInt(newOtherIncome.valuePerUnit)
    }
    const updatedProforma: Proforma = {
      ...proforma,
      otherIncome: editingOtherIncomeDialog
        ? proforma.otherIncome.map(item => item.id === editingOtherIncomeDialog.id ? newOtherIncomeObj : item)
        : [...proforma.otherIncome, newOtherIncomeObj]
    };
    onProformaChange(updatedProforma)
    setNewOtherIncome({ 
      name: '', 
      description: '', 
      value: '',
      unitType: '',
      numberOfUnits: '1',
      valuePerUnit: '',
      customUnitType: ''
    })
    setIsOtherIncomeDialogOpen(false)
    setEditingOtherIncomeDialog(null)
  }

  const openEditOtherIncomeDialog = (item: OtherIncome) => {
    setNewOtherIncome({
      name: item.name,
      description: item.description,
      value: item.value.toString(),
      unitType: ['parking','storage','retail'].includes(item.unitType) ? item.unitType : 'other',
      numberOfUnits: item.numberOfUnits.toString(),
      valuePerUnit: item.valuePerUnit.toString(),
      customUnitType: ['parking','storage','retail'].includes(item.unitType) ? '' : item.unitType
    })
    setEditingOtherIncomeDialog(item)
    setIsOtherIncomeDialogOpen(true)
  }

  const handleDeleteOtherIncome = (id: string) => {
    const updatedProforma: Proforma = {
      ...proforma,
      otherIncome: proforma.otherIncome.filter(item => item.id !== id)
    };
    onProformaChange(updatedProforma)
  }

  return {
    newOtherIncome,
    setNewOtherIncome,
    isOtherIncomeDialogOpen,
    setIsOtherIncomeDialogOpen,
    editingOtherIncomeDialog,
    setEditingOtherIncomeDialog,
    unitTypeDisplayNames,
    handleAddOrEditOtherIncome,
    openEditOtherIncomeDialog,
    handleDeleteOtherIncome
  }
} 