import { useState, useEffect } from "react"
import { Proforma, saveProforma } from "@/lib/session-storage"

interface UseSourcesUsesProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

export function useSourcesUses({ proforma, onProformaChange }: UseSourcesUsesProps) {
  const [newAdditionalCost, setNewAdditionalCost] = useState({ name: '', amount: '' })
  const [newHardCost, setNewHardCost] = useState({ name: '', amount: '' })
  const [newSoftCost, setNewSoftCost] = useState({ name: '', amount: '' })
  const [isLandCostDialogOpen, setIsLandCostDialogOpen] = useState(false)
  const [isHardCostDialogOpen, setIsHardCostDialogOpen] = useState(false)
  const [isSoftCostDialogOpen, setIsSoftCostDialogOpen] = useState(false)
  const [isAdditionalCostDialogOpen, setIsAdditionalCostDialogOpen] = useState(false)
  const [editingCostName, setEditingCostName] = useState<string | null>(null)
  const [editingCostType, setEditingCostType] = useState<'land' | 'hard' | 'soft' | null>(null)

  // Initialize state from proforma with proper type checking
  const [hardCosts, setHardCosts] = useState<{ name: string; amount: number }[]>(
    Array.isArray(proforma.uses.hardCosts) ? proforma.uses.hardCosts : []
  )
  const [softCosts, setSoftCosts] = useState<{ name: string; amount: number }[]>(
    Array.isArray(proforma.uses.softCosts) ? proforma.uses.softCosts : []
  )
  const [constructionCost, setConstructionCost] = useState<number>(proforma.uses.constructionCost || 0)
  const [hardCostContingencyPct, setHardCostContingencyPct] = useState<number>(proforma.uses.hardCostContingencyPct || 0)
  const [softDev, setSoftDev] = useState<number>(proforma.uses.softDev || 0)
  const [softConsultants, setSoftConsultants] = useState<number>(proforma.uses.softConsultants || 0)
  const [adminMarketing, setAdminMarketing] = useState<number>(proforma.uses.adminMarketing || 0)
  const [softCostContingencyPct, setSoftCostContingencyPct] = useState<number>(proforma.uses.softCostContingencyPct || 0)
  const [equityPct, setEquityPct] = useState(proforma.sources.equityPct || 30)
  const [debtPct, setDebtPct] = useState(proforma.sources.debtPct || 70)
  const [interestPct, setInterestPct] = useState(proforma.sources.interestPct || 0)
  const [brokerFeePct, setBrokerFeePct] = useState(proforma.sources.brokerFeePct || 0)

  // Land Costs specific state
  const [landCost, setLandCost] = useState(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0);
  const [closingCostPercentage, setClosingCostPercentage] = useState(() => {
    const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
    const closingCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('closing'))?.amount || 0;
    return landCost > 0 ? (closingCost / landCost * 100) : 0;
  });

  const additionalLandCosts = proforma.uses.additionalCosts?.filter(cost => 
    !cost.name.toLowerCase().includes('land') && 
    !cost.name.toLowerCase().includes('closing')
  ) || [];

  // Update proforma and save to session storage when state changes
  useEffect(() => {
    const newCosts = [...(proforma.uses.additionalCosts || [])];
    
    // Update land cost
    const landCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('land'));
    if (landCostIndex >= 0) {
      newCosts[landCostIndex].amount = landCost;
    } else {
      newCosts.push({ name: 'Land Cost', amount: landCost });
    }

    // Update closing cost
    const closingCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('closing'));
    const closingCostAmount = Math.round(landCost * closingCostPercentage / 100);
    if (closingCostIndex >= 0) {
      newCosts[closingCostIndex].amount = closingCostAmount;
    } else {
      newCosts.push({ name: 'Closing Costs', amount: closingCostAmount });
    }

    const updatedProforma: Proforma = {
      ...proforma,
      sources: {
        ...proforma.sources,
        equityPct,
        debtPct,
        interestPct,
        brokerFeePct,
      },
      uses: {
        ...proforma.uses,
        constructionCost,
        hardCostContingencyPct,
        softDev,
        softConsultants,
        adminMarketing,
        softCostContingencyPct,
        hardCosts: Array.isArray(hardCosts) ? hardCosts : [],
        softCosts: Array.isArray(softCosts) ? softCosts : [],
        additionalCosts: newCosts,
      }
    };
    onProformaChange(updatedProforma);
    saveProforma(proforma.projectId, updatedProforma);
  }, [
    constructionCost,
    hardCostContingencyPct,
    softDev,
    softConsultants,
    adminMarketing,
    softCostContingencyPct,
    hardCosts,
    softCosts,
    equityPct,
    debtPct,
    interestPct,
    brokerFeePct,
    landCost,
    closingCostPercentage,
  ]);

  const handleAddCost = (type: 'land' | 'hard' | 'soft') => {
    if (!newAdditionalCost.name || !newAdditionalCost.amount) return;

    switch (type) {
      case 'land':
        const updatedProforma: Proforma = {
          ...proforma,
          uses: {
            ...proforma.uses,
            additionalCosts: editingCostName
              ? proforma.uses.additionalCosts.map(cost => 
                  cost.name === editingCostName
                    ? { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }
                    : cost
                )
              : [
                  ...proforma.uses.additionalCosts,
                  {
                    name: newAdditionalCost.name,
                    amount: parseInt(newAdditionalCost.amount) || 0
                  }
                ]
          }
        };
        onProformaChange(updatedProforma);
        saveProforma(proforma.projectId, updatedProforma);
        break;

      case 'hard':
        setHardCosts(prev => {
          const currentCosts = Array.isArray(prev) ? prev : [];
          if (editingCostName) {
            return currentCosts.map(cost => 
              cost.name === editingCostName
                ? { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }
                : cost
            );
          }
          return [...currentCosts, { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }];
        });
        break;

      case 'soft':
        setSoftCosts(prev => {
          const currentCosts = Array.isArray(prev) ? prev : [];
          if (editingCostName) {
            return currentCosts.map(cost => 
              cost.name === editingCostName
                ? { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }
                : cost
            );
          }
          return [...currentCosts, { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }];
        });
        break;
    }

    // Reset state
    setNewAdditionalCost({ name: '', amount: '' });
    setEditingCostName(null);
    setEditingCostType(null);
    setIsAdditionalCostDialogOpen(false);
    setIsLandCostDialogOpen(false);
    setIsHardCostDialogOpen(false);
    setIsSoftCostDialogOpen(false);
  };

  const handleDeleteAdditionalCost = (name: string) => {
    const updatedProforma: Proforma = {
      ...proforma,
      uses: {
        ...proforma.uses,
        additionalCosts: proforma.uses.additionalCosts.filter(
          c => c.name !== name || ['land cost', 'closing costs'].includes(c.name.toLowerCase())
        )
      }
    };
    onProformaChange(updatedProforma);
    saveProforma(proforma.projectId, updatedProforma);
  };

  // Calculate totals with safe array checks
  const landCosts = Array.isArray(proforma?.uses?.additionalCosts) 
    ? proforma.uses.additionalCosts.reduce((sum, c) => sum + (c.amount || 0), 0) 
    : 0;
  
  const hardCostsTotal = constructionCost + 
    Math.round(constructionCost * (hardCostContingencyPct || 0) / 100) + 
    (Array.isArray(hardCosts) ? hardCosts.reduce((sum, c) => sum + (c.amount || 0), 0) : 0);
  
  const softCostsTotal = softDev + 
    softConsultants + 
    adminMarketing + 
    Math.round((softDev + softConsultants + adminMarketing) * (softCostContingencyPct || 0) / 100) + 
    (Array.isArray(softCosts) ? softCosts.reduce((sum, c) => sum + (c.amount || 0), 0) : 0);
  
  const totalProjectCost = landCosts + hardCostsTotal + softCostsTotal;
  const equityAmount = Math.round((equityPct / 100) * totalProjectCost).toLocaleString();
  const debtAmount = Math.round((debtPct / 100) * totalProjectCost).toLocaleString();
  const constructionDebtAmount = Math.round((debtPct / 100) * totalProjectCost);
  const projectLength = proforma?.projectLength || 0;
  const interestCostAmount = Math.round((interestPct / 100 / 12) * projectLength * constructionDebtAmount).toLocaleString();
  const brokerFeeAmount = Math.round((brokerFeePct / 100) * constructionDebtAmount).toLocaleString();

  return {
    // State
    newAdditionalCost,
    setNewAdditionalCost,
    newHardCost,
    setNewHardCost,
    newSoftCost,
    setNewSoftCost,
    isLandCostDialogOpen,
    setIsLandCostDialogOpen,
    isHardCostDialogOpen,
    setIsHardCostDialogOpen,
    isSoftCostDialogOpen,
    setIsSoftCostDialogOpen,
    isAdditionalCostDialogOpen,
    setIsAdditionalCostDialogOpen,
    editingCostName,
    setEditingCostName,
    editingCostType,
    setEditingCostType,
    hardCosts,
    setHardCosts,
    softCosts,
    setSoftCosts,
    constructionCost,
    setConstructionCost,
    hardCostContingencyPct,
    setHardCostContingencyPct,
    softDev,
    setSoftDev,
    softConsultants,
    setSoftConsultants,
    adminMarketing,
    setAdminMarketing,
    softCostContingencyPct,
    setSoftCostContingencyPct,
    equityPct,
    setEquityPct,
    debtPct,
    setDebtPct,
    interestPct,
    setInterestPct,
    brokerFeePct,
    setBrokerFeePct,

    // Handlers
    handleAddCost,
    handleDeleteAdditionalCost,

    // Calculated values
    landCosts,
    hardCostsTotal,
    softCostsTotal,
    totalProjectCost,
    equityAmount,
    debtAmount,
    constructionDebtAmount,
    projectLength,
    interestCostAmount,
    brokerFeeAmount,

    // Land Costs specific values
    landCost,
    setLandCost,
    closingCostPercentage,
    setClosingCostPercentage,
    additionalLandCosts,
  }
} 