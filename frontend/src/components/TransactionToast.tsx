import { ExternalLink, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react'

export interface TxToastState {
  isOpen: boolean
  status: 'idle' | 'submitting' | 'mining' | 'success' | 'error'
  txHash?: string
  message?: string
  errorMessage?: string
}

interface TransactionToastProps {
  toast: TxToastState
  onClose: () => void
}

export default function TransactionToast({ toast, onClose }: TransactionToastProps) {
  if (!toast.isOpen || toast.status === 'idle') return null

  const explorerUrl = toast.txHash ? `https://testnet.monadexplorer.com/tx/${toast.txHash}` : null
  const truncatedHash = toast.txHash ? `${toast.txHash.slice(0, 10)}...${toast.txHash.slice(-8)}` : null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full">
      <div className="relative rounded-xl border-4 border-black bg-[#FFFDF5] p-4 shadow-[6px_6px_0px_0px_#000] text-black">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md border-2 border-black bg-[#FF5252] p-1 text-black hover:bg-[#FF0000] hover:text-white shadow-[2px_2px_0px_0px_#000] transition-colors"
        >
          <X className="h-4 w-4 stroke-[3]" />
        </button>

        {/* Submitting / Mining */}
        {(toast.status === 'submitting' || toast.status === 'mining') && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg border-2 border-black bg-[#00E5FF] text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-black">
                {toast.status === 'submitting' ? 'Confirm in Wallet...' : 'Mining on Monad (0.3s)...'}
              </h4>
              <p className="text-xs font-bold text-black mt-0.5">
                {toast.message || 'Executing smart contract transaction on Monad Testnet.'}
              </p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-black uppercase text-black bg-[#00E5FF] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] hover:underline"
                >
                  <span>Tx: {truncatedHash}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Success */}
        {toast.status === 'success' && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg border-2 border-black bg-[#CCFF00] text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <CheckCircle2 className="h-5 w-5 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-black">
                Transaction Confirmed! 🎉
              </h4>
              <p className="text-xs font-bold text-black mt-0.5">
                {toast.message || 'Smart contract state updated live on Monad Blockchain.'}
              </p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#CCFF00] px-2.5 py-1 text-[11px] font-black uppercase text-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#00E5FF] transition-all"
                >
                  <span>View on Explorer ({truncatedHash})</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {toast.status === 'error' && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg border-2 border-black bg-[#FF5252] text-white shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-black">Transaction Failed</h4>
              <p className="text-xs font-bold text-black mt-0.5 line-clamp-2">
                {toast.errorMessage || 'Transaction was rejected or failed on Monad Testnet.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
