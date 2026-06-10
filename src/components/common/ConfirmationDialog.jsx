import { AlertCircle } from "lucide-react";

export default function ConfirmationDialog({
  isOpen,
  title = "Please Confirm",
  message = "Are you sure you want to continue?",
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[20px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#313166]/10">
            <AlertCircle className="h-7 w-7 text-[#313166]" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-[#313166]">{title}</h3>
          <p className="mb-8 text-sm text-gray-500">{message}</p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-6 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-[#CB376D] to-[#A72962] px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Please wait..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
