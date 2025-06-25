import { useState, useEffect } from "react"
import { Proforma, saveProforma } from "@/lib/session-storage"
import { formatCurrency } from '@/lib/utils'

interface UseSourcesUsesProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

export function useSourcesUses({ proforma, onProformaChange }: UseSourcesUsesProps) {
  const [newAdditionalCost, setNewAdditionalCost] = useState({ name: '', amount: '' })
  const [isLandCostDialogOpen, setIsLandCostDialogOpen] = useState(false)
  const [isHardCostDialogOpen, setIsHardCostDialogOpen] = useState(false)
  const [isSoftCostDialogOpen, setIsSoftCostDialogOpen] = useState(false)
  const [isAdditionalCostDialogOpen, setIsAdditionalCostDialogOpen] = useState(false)
  const [editingCostName, setEditingCostName] = useState<string | null>(null)
  const [editingCostType, setEditingCostType] = useState<'land' | 'hard' | 'soft' | null>(null)

  // Initialize state from proforma with proper type checking
  const [constructionCost, setConstructionCost] = useState<number>(proforma.uses.hardCosts.baseCost || 0)
  const [hardCostContingencyPct, setHardCostContingencyPct] = useState<number>(proforma.uses.hardCosts.contingencyPct || 0)
  const [softDev, setSoftDev] = useState<number>(proforma.uses.softCosts.development || 0)
  const [softConsultants, setSoftConsultants] = useState<number>(proforma.uses.softCosts.consultants || 0)
  const [adminMarketing, setAdminMarketing] = useState<number>(proforma.uses.softCosts.adminMarketing || 0)
  const [softCostContingencyPct, setSoftCostContingencyPct] = useState<number>(proforma.uses.softCosts.contingencyPct || 0)
  const [equityPct, setEquityPct] = useState(proforma.sources.equityPct || 30)
  const [debtPct, setDebtPct] = useState(proforma.sources.debtPct || 70)
  const [interestPct, setInterestPct] = useState(proforma.sources.financingCosts.interestPct || 0)
  const [brokerFeePct, setBrokerFeePct] = useState(proforma.sources.financingCosts.brokerFeePct || 0)

  // Land Costs specific state
  const [landCost, setLandCost] = useState(proforma.uses.landCosts.baseCost || 0);
  const [closingCostPercentage, setClosingCostPercentage] = useState(() => {
    const landCost = proforma.uses.landCosts.baseCost || 0;
    const closingCost = proforma.uses.landCosts.closingCost || 0;
    return landCost > 0 ? (closingCost / landCost * 100) : 0;
  });

  const additionalLandCosts = proforma.uses.landCosts.additionalCosts || [];
  const additionalHardCosts = proforma.uses.hardCosts.additionalCosts || [];
  const additionalSoftCosts = proforma.uses.softCosts.additionalCosts || [];

  // Calculate totals with safe array checks
  const landCosts = landCost + 
    Math.round(landCost * closingCostPercentage / 100) + 
    (Array.isArray(additionalLandCosts) ? additionalLandCosts.reduce((sum, c) => sum + (c.amount || 0), 0) : 0);
  
  const hardCostsTotal = constructionCost + 
    Math.round(constructionCost * (hardCostContingencyPct || 0) / 100) + 
    (Array.isArray(additionalHardCosts) ? additionalHardCosts.reduce((sum, c) => sum + (c.amount || 0), 0) : 0);
  
  const softCostsTotal = softDev + 
    softConsultants + 
    adminMarketing + 
    Math.round((softDev + softConsultants + adminMarketing) * (softCostContingencyPct || 0) / 100) + 
    (Array.isArray(additionalSoftCosts) ? additionalSoftCosts.reduce((sum, c) => sum + (c.amount || 0), 0) : 0);
  
  const totalProjectCost = landCosts + hardCostsTotal + softCostsTotal;
  const equityAmount = formatCurrency(Math.round((equityPct / 100) * totalProjectCost));
  const debtAmount = formatCurrency(Math.round((debtPct / 100) * totalProjectCost));
  const constructionDebtAmount = Math.round((debtPct / 100) * totalProjectCost);
  const projectLength = proforma?.projectLength || 0;
  const interestCostAmount = formatCurrency(Math.round((interestPct / 100 / 12) * projectLength * constructionDebtAmount));
  const brokerFeeAmount = formatCurrency(Math.round((brokerFeePct / 100) * constructionDebtAmount));

  // Update proforma and save to session storage when state changes
  useEffect(() => {
    // Calculate financing costs
    const interestCost = Math.round((interestPct / 100 / 12) * projectLength * constructionDebtAmount);
    const brokerFee = Math.round((brokerFeePct / 100) * constructionDebtAmount);
    const totalFinancingCost = interestCost + brokerFee;

    // Calculate total project cost including financing
    const totalProjectCostInclFinancing = totalProjectCost + totalFinancingCost;

    const updatedProforma: Proforma = {
      ...proforma,
      totalProjectCostInclFinancing,
      sources: {
        ...proforma.sources,
        equityPct,
        debtPct,
        financingCosts: {
          interestPct,
          brokerFeePct,
          interestCost,
          brokerFee,
          totalFinancingCost
        }
      },
      uses: {
        ...proforma.uses,
        landCosts: {
          baseCost: landCost,
          closingCost: Math.round(landCost * closingCostPercentage / 100),
          additionalCosts: additionalLandCosts
        },
        hardCosts: {
          baseCost: constructionCost,
          contingencyPct: hardCostContingencyPct,
          additionalCosts: additionalHardCosts
        },
        softCosts: {
          development: softDev,
          consultants: softConsultants,
          adminMarketing: adminMarketing,
          contingencyPct: softCostContingencyPct,
          additionalCosts: additionalSoftCosts
        }
      },
      totalExpenses: totalProjectCost
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
    equityPct,
    debtPct,
    interestPct,
    brokerFeePct,
    landCost,
    closingCostPercentage,
    totalProjectCost,
    additionalLandCosts,
    additionalHardCosts,
    additionalSoftCosts
  ]);

  const handleAddCost = (type: 'land' | 'hard' | 'soft') => {
    if (!newAdditionalCost.name || !newAdditionalCost.amount) return;

    const updatedProforma: Proforma = {
      ...proforma,
      uses: {
        ...proforma.uses,
        [type === 'land' ? 'landCosts' : type === 'hard' ? 'hardCosts' : 'softCosts']: {
          ...proforma.uses[type === 'land' ? 'landCosts' : type === 'hard' ? 'hardCosts' : 'softCosts'],
          additionalCosts: editingCostName
            ? proforma.uses[type === 'land' ? 'landCosts' : type === 'hard' ? 'hardCosts' : 'softCosts'].additionalCosts.map(cost => 
                cost.name === editingCostName
                  ? { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }
                  : cost
              )
            : [
                ...proforma.uses[type === 'land' ? 'landCosts' : type === 'hard' ? 'hardCosts' : 'softCosts'].additionalCosts,
                {
                  name: newAdditionalCost.name,
                  amount: parseInt(newAdditionalCost.amount) || 0
                }
              ]
        }
      }
    };

    onProformaChange(updatedProforma);
    saveProforma(proforma.projectId, updatedProforma);

    // Reset state
    setNewAdditionalCost({ name: '', amount: '' });
    setEditingCostName(null);
    setEditingCostType(null);
    setIsAdditionalCostDialogOpen(false);
    setIsLandCostDialogOpen(false);
    setIsHardCostDialogOpen(false);
    setIsSoftCostDialogOpen(false);
  };

  const handleDeleteAdditionalCost = (type: 'land' | 'hard' | 'soft', name: string) => {
    const updatedProforma: Proforma = {
      ...proforma,
      uses: {
        ...proforma.uses,
        [type === 'land' ? 'landCosts' : type === 'hard' ? 'hardCosts' : 'softCosts']: {
          ...proforma.uses[type === 'land' ? 'landCosts' : type === 'hard' ? 'hardCosts' : 'softCosts'],
          additionalCosts: proforma.uses[type === 'land' ? 'landCosts' : type === 'hard' ? 'hardCosts' : 'softCosts'].additionalCosts.filter(
            c => c.name !== name
          )
        }
      }
    };
    onProformaChange(updatedProforma);
    saveProforma(proforma.projectId, updatedProforma);
  };

  return {
    // State
    newAdditionalCost,
    setNewAdditionalCost,
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
    totalProjectCostInclFinancing: totalProjectCost + (proforma.sources?.financingCosts?.totalFinancingCost || 0),
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
    additionalHardCosts,
    additionalSoftCosts,
  }
} 