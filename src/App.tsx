import { useState, useEffect } from "react"
import { DSPSelectionModal } from "./components/campaign/dsp-selection-modal"
import { AccountSelectionModal } from "./components/campaign/account-selection-modal"
import { CampaignWorkspace } from "./components/campaign/campaign-workspace"
import { fetchActiveDSPs, fetchAccounts } from "./lib/config-loader"
import { useCampaignStore } from "./lib/store"
import type { DSP } from "./lib/types"

export default function App() {
  const [step, setStep] = useState<"dsp" | "account" | "workspace">("dsp")
  const [dsps, setDsps] = useState<DSP[]>([])
  const [popupHeading, setPopupHeading] = useState("Select Account")
  
  // Zustand Store
  const { 
    platform, 
    setPlatform, 
    availableAccounts, 
    setAvailableAccounts,
    all_selected_accounts,
    current_active_account
  } = useCampaignStore()

  useEffect(() => {
    fetchActiveDSPs().then((data) => setDsps(data.dsps))
  }, [])

  const handleDSPSelect = async (dspId: string) => {
    const dsp = dsps.find((d) => d.id === dspId)
    if (dsp) {
      setPlatform(dsp)
      // Fetch accounts for the selected platform
      const response = await fetchAccounts(dspId)
      setAvailableAccounts(response.data.accounts)
      setPopupHeading(response.data.popup_heading)
      setStep("account")
    }
  }

  const handleAccountSelect = () => {
    // The modal already handles setting all_selected_accounts and current_active_account
    setStep("workspace")
  }

  const handleBackToDSP = () => {
    setStep("dsp")
    setPlatform(null)
    setAvailableAccounts([])
  }

  return (
    <main className="min-h-screen bg-background">
      {step === "workspace" && platform && current_active_account ? (
        <CampaignWorkspace
          dspId={platform.id}
          dspName={platform.name}
          account={current_active_account}
          allAccounts={all_selected_accounts}
        />
      ) : (
        <>
          <DSPSelectionModal isOpen={step === "dsp"} dsps={dsps} onSelect={handleDSPSelect} onClose={() => {}} />
          <AccountSelectionModal
            isOpen={step === "account"}
            title={popupHeading}
            accounts={availableAccounts}
            platformId={platform?.id || ""}
            onSelect={handleAccountSelect}
            onBack={handleBackToDSP}
            onClose={() => {}}
          />
        </>
      )}
    </main>
  )
}
