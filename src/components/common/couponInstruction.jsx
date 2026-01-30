import { useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { FiEdit, FiTrash2, FiX, } from "react-icons/fi";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";


export default function CouponInstruction({ onClose }) {

    const [couponInstruction, setCouponInstruction] = useState(true)
    const [editing, setEditing] = useState("");
    const [defaultInsttruction, setDefaultInstruction] = useState()
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const defaultData = async () => {
            try {
                const res = await api.get("/api/coupon-instruction");
                const data = res.data.instructions;
                setDefaultInstruction(data)
                reset({
                    instructions: data,
                })

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false)
            }
        };

        defaultData();
    }, []);

    const instructionSchema = yup.object({
        instructions: yup
            .array()
            .of(
                yup.object({
                    instruction: yup
                        .string()
                        .required("Instruction is required")
                        .min(3, "Instruction must be at least 3 characters")
                        .max(50, "Instruction can't exceed 50 characters"),
                })
            )
            .min(1, "At least one instruction is required"),
    });


    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(instructionSchema),
        defaultValues: {
            instructions: []
        },
        mode: "OnChange",

    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "instructions"
    })


    const onSubmit = async (data) => {
        try {
            const res = await api.patch("/api/coupon-instruction", {
                instructions: data.instructions,
            });
            showToast("updated sucessfully", "success")
            setEditing(false);
            onClose()
        } catch (error) {
            console.error(
                "Update failed:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false)
        }
    };

    const addButton = () => {
        if (fields.length >= 3) {
            showToast("Cannot add more Instruction,Only 3 allowed", "error");
            return;
        }

        append({ instruction: "" });
    };
    const onDelete = () =>{
        if (fields.length === 1){
            showToast("Atleast one instruction should take place" ,"error")
            return                                
        }
        remove({ instruction:""}),
            showToast("deleted", "error")
    }





    return (

        <div className="p-2 w-full border border-gray-300 rounded-lg mb-6">
            <div className="p-4">
                <button
                    onClick={onClose}
                    className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
            </div>

            {/* <div className="flex gap-2 w-full p-2 items-center justify-between">
                <p className="text-lg font-semibold ">{editing ? "Edit coupon" : "Coupon Instruction"}</p>
                {!editing && (
                    <div className="flex  items-center gap-2 ">

                        <button
                            onClick={() => setEditing(!editing)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit coupon"
                        >
                            <FiEdit size={18} />
                        </button>
                    </div>
                )}
            </div> */}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    {fields.map((item, index) => (
                        <div className="grid grid-rows gap-1  items-center mb-4" key={item.id}>
                            <div className="p-2">
                                <p>Instruction {index + 1}</p>
                            </div>
                            <div className="flex gap-4 items-center ">
                                <input type="text" {...register(`instructions[${index}].instruction`)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300" />
                                
                                <button type="button" onClick={onDelete}><FiTrash2 size={18} /></button>
                            </div>
                            <div>
                                   {errors.instructions?.[index]?.instruction && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.instructions[index].instruction.message}
                                    </p>
                                )} 
                                </div>

                        </div>
                    ))}
                    <div className="flex p-2 items-center">
                        <button type="button" onClick={addButton} className={`flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors `}>Add Instruction +</button>
                    </div>
                    <div className="flex gap-2 items-center p-2 justify-end">
                        <button
                            onClick={onClose}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            <FiX className="mr-2" /> Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded hover:bg-pink-700 transition">Submit</button>
                    </div>
                </form>
            )}
        </div>
    )
}