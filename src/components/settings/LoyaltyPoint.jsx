import React, { useState, useEffect } from 'react';
import api from '../../api/apiconfig';
import showToast from '../../utils/ToastNotification';

function LoyaltyPoint() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    isActive: false,
    minOrderAmount: 0,
    maxDiscountPercent: 0,
    tiers: [{ pointsRequired: 0, discountAmount: 0 }]
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/loyalty/rule');
      if (response.data) {
        setRules(response.data);
        setFormData({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/loyalty/rule', formData);
      showToast('Loyalty rules saved successfully!', 'success');
      await fetchRules(); // Refresh the data
    } catch (err) {
      showToast(err.response.data.message, 'success');
      console.error('Error saving rules:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete all loyalty rules?')) {
      return;
    }

    try {
      await api.delete('/api/loyalty/rule');
      showToast('Loyalty rules deleted successfully!', 'success');
      setRules(null);
      setFormData({
        isActive: false,
        minOrderAmount: 0,
        maxDiscountPercent: 0,
        tiers: [{ pointsRequired: 0, discountAmount: 0 }]
      });
    } catch (err) {
      showToast(err.response.data.message, 'error')
      console.error('Error deleting rules:', err);
    }
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = [...formData.tiers];
    newTiers[index][field] = Number(value);
    setFormData({ ...formData, tiers: newTiers });
  };

  const addTier = () => {
    setFormData({
      ...formData,
      tiers: [...formData.tiers, { pointsRequired: 0, discountAmount: 0 }]
    });
  };

  const removeTier = (index) => {
    if (formData.tiers.length > 1) {
      const newTiers = formData.tiers.filter((_, i) => i !== index);
      setFormData({ ...formData, tiers: newTiers });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" shadow-xl  overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r  px-6 py-4">
            <h1 className="text-2xl font-bold ">Loyalty Point Rules</h1>
            <p className=" mt-1">Configure your loyalty program settings</p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Loyalty Program</h3>
                  <p className="text-sm text-gray-600">Turn the loyalty program on or off</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Minimum Order Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 outline-none border border-gray-300 rounded-lg "
                      placeholder="Enter amount"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  </div>
                </div>

                {/* Max Discount Percent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.maxDiscountPercent}
                      onChange={(e) => setFormData({ ...formData, maxDiscountPercent: Number(e.target.value) })}
                      className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg  outline-none"
                      placeholder="Enter percentage"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
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
                  {formData.tiers.map((tier, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Tier {index + 1}</span>
                        {formData.tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTier(index)}
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
                          <input
                            type="number"
                            min="0"
                            value={tier.pointsRequired}
                            onChange={(e) => handleTierChange(index, 'pointsRequired', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                            placeholder="Points required"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount Amount
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={tier.discountAmount}
                              onChange={(e) => handleTierChange(index, 'discountAmount', e.target.value)}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg  outline-none"
                              placeholder="Discount amount"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
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