import { toast } from "react-toastify";

const deleteConfirmTostNotification = (userName, onConfirm, action = "delete") => {
  const toastId = toast.warn(
    <div className="text-gray-800">
      <p className="font-semibold">Are you sure?</p>
      <p className="">Do you want to {action} {userName}?</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={async () => {
            try {
              await onConfirm();
            } catch (error) {
              console.error(error);
            } finally {
              toast.dismiss(toastId);
            }
          }}
          className="rounded button px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          {action}
        </button>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="rounded bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>,
    {
      autoClose: false,
      style: { backgroundColor: "#ffffff", color: "#1f2937" },
    }
  );
};

export default deleteConfirmTostNotification;
