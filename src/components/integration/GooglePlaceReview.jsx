import { useState, useEffect } from 'react';
import api from '../../api/apiconfig';
import showToast from '../../utils/ToastNotification';


const GooglePlaceReview = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    // Check if user already has a place_id stored
    useEffect(() => {
        const placeId = localStorage.getItem('place_id');
        if (placeId) {
            fetchPlaceDetails(placeId);
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await api.get(`/api/integrationManagement/search?search="${searchQuery}"`);
            if (response.data.status) {
                setSearchResults(response.data.data);
            } else {
                setError('No results found. Please try a different search term.');
            }
        } catch (err) {
            setError('Failed to fetch search results. Please try again.');
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlaceDetails = async (placeId) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/integrationManagement/businessDetails?placeId=${placeId}`);
            if (response.data.status) {
                setSelectedPlace({
                    ...response.data.data,
                    place_id: placeId
                });
            }
        } catch (err) {
            console.error('Error fetching place details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPlace = (place) => {
        localStorage.setItem('place_id', place.place_id);
        setSelectedPlace(place);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleUpdatePlace = async () => {
        if (!selectedPlace) return;

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/api/integrationManagement/placeId', {
                placeId: selectedPlace.place_id
            });

            if (response.data.status) {
                showToast('Business location updated successfully!', "success");
            } else {
                showToast('Failed to update business location. Please try again.', "error");
            }
        } catch (err) {
            showToast(err.response.data.message, "error")
        } finally {
            setIsLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedPlace(null);
        localStorage.removeItem('place_id');
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Business Location Setup</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {success}
                </div>
            )}

            {selectedPlace ? (
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Selected Business</h3>
                        <button
                            onClick={clearSelection}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Change
                        </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-800">{selectedPlace?.name}</h4>
                        <p className="text-gray-600 mt-1">{selectedPlace?.formatted_address}</p>

                        <button
                            onClick={handleUpdatePlace}
                            disabled={isLoading}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Confirm Business Location'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="mb-4">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search for your business
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter your business name"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !searchQuery.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
                            <div className="space-y-3">
                                {searchResults.map((place) => (
                                    <div
                                        key={place.place_id}
                                        onClick={() => handleSelectPlace(place)}
                                        className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
                                    >
                                        <h4 className="font-medium text-gray-800">{place.structured_formatting.main_text}</h4>
                                        <p className="text-sm text-gray-600">{place.structured_formatting.secondary_text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GooglePlaceReview;