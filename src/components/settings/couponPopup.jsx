import { useEffect, useState } from "react"
import {
    X,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    CheckCircle,
    Play,
} from "lucide-react";

export default function CouponPopup({ isOpen, onClose }) {

    const [currentIndex, setCurrentIndex] = useState(0)
    const Instructions = [
        {
            id: 1,
            title: "Go to quick search",
            image: "/assets/quick-search.png",
            description: "navigate to the quick search tab from the left sidebar after login to the dashboard"
        },
        {
            id: 2,
            title: "Search by customer id",
            image: "/assets/SearchBy.png",
            description: "You can see a search bar in top,enter the customer id and click on search icon to search"
        }
        , {
            id: 3,
            title: "Scroll to availble coupons",
            image: "/assets/coupon-claim.png",
            description: "After searching the customer id, scroll down to the section named available coupons to the list of coupons"
        }
    ]
    const currentInstruction = Instructions[currentIndex]
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0)
        }
    }, [isOpen])
    const handleGetGuidance = () => {
    console.log("Get guidance for step:", currentIndex);
  };

    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center">
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden  flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Instructions to claim coupon</h2>
              <p className="text-sm text-gray-500">
                step {currentIndex + 1} of {Instructions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

                <div className="flex-1 overflow-y-auto p-6">

                    <p className="text-xl font-bold text-gray-900 mb-4">{currentInstruction.title}</p>
                    <div className="mb-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                        <img  
                        className="w-full max-h-64 object-contain bg-white"
                        src={currentInstruction.image} alt="" />
                    </div>
                    
                     <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentInstruction.description}
                </p>
              </div>
                    <div className="border-t border-gray-200 bg-white ">
                        <div className="flex flex-row gap-3 px-10 items-center">
                            <button
                             disabled={currentIndex === 0} 
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  currentIndex === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                }`}
                             onClick={() => setCurrentIndex((prev) => (prev - 1) % Instructions.length)}>previous</button>
                              <button
                onClick={handleGetGuidance}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300 text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                Guidance
              </button>
                            <div className="flex gap-1.5 flex-1 max-w-[200px] min-w-[120px] overflow-hidden justify-center">
                                {Instructions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                            ? "bg-blue-600 w-6"
                                            : "bg-gray-300 hover:bg-gray-400"
                                            }`}
                                        aria-label={`Go to step ${index + 1}`}
                                    />
                                ))}
                            </div>
                            {currentIndex === Instructions.length - 1 ? (
                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm bg-blue-600 text-white hover:bg-blue-700"

                                >
                                    Finish
                                </button>
                            ) : (
                                <button
                                    disabled={currentIndex === Instructions.length - 1} onClick={() => setCurrentIndex((prev) => (prev + 1) % Instructions.length)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Next

                                </button>
                            )}
                        </div>
                    </div>



                </div>


            </div>
        </div>
    )
}