import { Link } from "react-router-dom";

const Completion = ({ formData }) => {
  return (
    <div className="step-container text-center">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full  flex items-center justify-center">
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg> */}
          <img src="../assets/crown-icon.png" alt="" />
        </div>
      </div>

      <h2 className="text-[20px] font-bold mb-4 text-[#EC396F]">
        You're Successfully a Vadik Al Member!
      </h2>
      <p className="text-[18px] text-[#313166] mb-8 max-w-md mx-auto">
        Let's make today productive!
      </p>

      <div className="flex justify-center">
        <Link
          to="/dashboard"
          className="min-w-[200px] px-6 py-3 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-[10px] transition-all duration-200 ease-in-out"
        >
          Lets go!
        </Link>
      </div>
    </div>
  );
};

export default Completion;
