import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import api from '../../api/apiconfig';
import showToast from '../../utils/ToastNotification';
import deleteConfirmTostNotification from '../../utils/deleteConfirmTostNotification';

function LoyaltyPoint() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // React Hook Form initialization
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      isActive: false,
      minOrderAmount: 0,
      maxDiscountPercent: 0,
      tiers: [{ pointsRequired: 0, discountAmount: 0 }]
    },
    mode: "onChange"
  });

  // For managing tier array fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tiers"
  });

  const watchIsActive = watch("isActive");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/loyalty/rule');
      if (response.data) {
        setRules(response.data);
        // Reset form with fetched data
        reset({
          isActive: response.data.isActive,
          minOrderAmount: response.data.minOrderAmount,
          maxDiscountPercent: response.data.maxDiscountPercent,
          tiers: response.data.tiers
        });
      }
    } catch (err) {
      setError('Failed to fetch loyalty rules');
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/loyalty/rule', data);
      showToast('Loyalty rules saved successfully!', 'success');
      await fetchRules(); // Refresh the data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save loyalty rules';
      showToast(errorMessage, 'error');
      console.error('Error saving rules:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {

    const onConfirm = async () => {
      try {
        await api.delete('/api/loyalty/rule');
        showToast('Loyalty rules deleted successfully!', 'success');
        setRules(null);
        reset({
          isActive: false,
          minOrderAmount: 0,
          maxDiscountPercent: 0,
          tiers: [{ pointsRequired: 0, discountAmount: 0 }]
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete loyalty rules';
        showToast(errorMessage, 'error');
        console.error('Error deleting rules:', err);
      }
    }

    deleteConfirmTostNotification("", onConfirm);
  };

  const addTier = () => {
    append({ pointsRequired: 0, discountAmount: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r px-6 py-4">
            <h1 className="text-2xl font-bold">Loyalty Point Rules</h1>
            <p className="mt-1">Configure your loyalty program settings</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Loyalty Program</h3>
                  <p className="text-sm text-gray-600">Turn the loyalty program on or off</p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  )}
                />
              </div>

              {/* Minimum Order Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Amount
                  </label>
                  <div className="relative">
                    <Controller
                      name="minOrderAmount"
                      control={control}
                      rules={{
                        required: "Minimum order amount is required",
                        min: {
                          value: 500,
                          message: "Minimum order amount must be at least ₹500"
                        }
                      }}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="number"
                            min="500"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-2 outline-none border border-gray-300 rounded-lg"
                            placeholder="Enter amount"
                          />
                          <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                        </>
                      )}
                    />
                    {errors.minOrderAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.minOrderAmount.message}</p>
                    )}
                  </div>
                </div>

                {/* Max Discount Percent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Discount Percentage
                  </label>
                  <div className="relative">
                    <Controller
                      name="maxDiscountPercent"
                      control={control}
                      rules={{
                        required: "Maximum discount percentage is required",
                        min: {
                          value: 0,
                          message: "Discount percentage cannot be negative"
                        },
                        max: {
                          value: 100,
                          message: "Discount percentage cannot exceed 100%"
                        }
                      }}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg outline-none"
                            placeholder="Enter percentage"
                          />
                          <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                        </>
                      )}
                    />
                    {errors.maxDiscountPercent && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxDiscountPercent.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tiers Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reward Tiers</h3>
                  <button
                    type="button"
                    onClick={addTier}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Tier {index + 1}</span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Points Required
                          </label>
                          <Controller
                            name={`tiers.${index}.pointsRequired`}
                            control={control}
                            rules={{
                              required: "Points required is mandatory",
                              min: {
                                value: 1,
                                message: "Points must be at least 1"
                              },
                              max: {
                                value: 1000000000,
                                message: "Points cannot exceed 1 billion"
                              }
                            }}
                            render={({ field }) => (
                              <>
                                <input
                                  {...field}
                                  type="number"
                                  min="1"
                                  max="1000000000"
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                                  placeholder="Points required"
                                />
                                {errors.tiers?.[index]?.pointsRequired && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.tiers[index].pointsRequired.message}
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount Amount
                          </label>
                          <div className="relative">
                            <Controller
                              name={`tiers.${index}.discountAmount`}
                              control={control}
                              rules={{
                                required: "Discount amount is required",
                                min: {
                                  value: 0,
                                  message: "Discount amount cannot be negative"
                                },
                                max: {
                                  value: 100,
                                  message: "Discount amount cannot exceed ₹100"
                                }
                              }}
                              render={({ field }) => (
                                <>
                                  <input
                                    {...field}
                                    type="number"
                                    min="0"
                                    max="100"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
                                    placeholder="Discount amount"
                                  />
                                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                  {errors.tiers?.[index]?.discountAmount && (
                                    <p className="mt-1 text-sm text-red-600">
                                      {errors.tiers[index].discountAmount.message}
                                    </p>
                                  )}
                                </>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Rules'
                  )}
                </button>

                {rules && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete All Rules
                  </button>
                )}
              </div>
            </form>

            {/* Current Rules Display */}
            {rules && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${rules.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {rules.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Min Order:</span>
                    <span className="ml-2">₹{rules.minOrderAmount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Max Discount:</span>
                    <span className="ml-2">{rules.maxDiscountPercent}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Tiers:</span>
                    <span className="ml-2">{rules.tiers?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoyaltyPoint;