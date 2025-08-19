import { Link, useNavigate } from "react-router-dom";

const Completion = ({ formData }) => {

  const navigate = useNavigate();

  const handleNavigate = () => {
     navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md mx-auto  rounded-xl  overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24  flex items-center justify-center">
            {/* For the crown icon, you should import it properly or use a public URL */}
            <img
              src="../assets/crown-icon.png" // Make sure this path is correct or use an absolute URL
              alt="Success crown icon"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-[#EC396F]">
          You're Successfully a Vadik Al Member!
        </h2>
        <p className="text-lg text-[#313166] mb-8">
          Let's make today productive!
        </p>

        <div className="w-full flex justify-center" onClick={handleNavigate}>
          <Link
            // to="/dashboard"
            className="min-w-[200px] px-6 py-3 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-[10px] hover:opacity-90 transition-opacity duration-200 text-center"
          >
            Let's go!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Completion;
