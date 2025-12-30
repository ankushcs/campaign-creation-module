import { useState, useEffect } from "react"
import { DSPSelectionModal } from "@/components/campaign/dsp-selection-modal"
import { AccountSelectionModal } from "@/components/campaign/account-selection-modal"
import { CampaignWorkspace } from "@/components/campaign/campaign-workspace"
import { loadDSPConfig, loadAccounts } from "@/lib/config-loader"
import type { DSP, Account } from "@/lib/types"

export default function App() {
  const [step, setStep] = useState<"dsp" | "account" | "workspace">("dsp")
  const [dsps, setDsps] = useState<DSP[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedDSP, setSelectedDSP] = useState<DSP | null>(null)
  const [selectedAccounts, setSelectedAccounts] = useState<Account[]>([])

  useEffect(() => {
    loadDSPConfig().then((data) => setDsps(data.dsps))
    loadAccounts().then((data) => setAccounts(data.accounts))
  }, [])

  const handleDSPSelect = (dspId: string) => {
    const dsp = dsps.find((d) => d.id === dspId)
    if (dsp) {
      setSelectedDSP(dsp)
      setStep("account")
    }
  }

  const handleAccountSelect = (accountIds: string[]) => {
    const selected = accounts.filter((a) => accountIds.includes(a.id))
    setSelectedAccounts(selected)
    setStep("workspace")
  }

  const handleBackToDSP = () => {
    setStep("dsp")
    setSelectedDSP(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {step === "workspace" && selectedDSP && selectedAccounts[0] ? (
        <CampaignWorkspace
          dspId={selectedDSP.id}
          dspName={selectedDSP.name}
          account={selectedAccounts[0]}
          allAccounts={selectedAccounts}
        />
      ) : (
        <>
          <DSPSelectionModal isOpen={step === "dsp"} dsps={dsps} onSelect={handleDSPSelect} onClose={() => {}} />
          <AccountSelectionModal
            isOpen={step === "account"}
            accounts={accounts}
            onSelect={handleAccountSelect}
            onBack={handleBackToDSP}
            onClose={() => {}}
          />
        </>
      )}
    </main>
  )
}
