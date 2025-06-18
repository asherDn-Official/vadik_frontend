import { FaSearch } from 'react-icons/fa';

function SearchBar({ placeholder = 'Search here', onSearch }) {
  const handleSearch = (e) => {
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="py-2 px-10 border border-gray-300 rounded-md w-full"
        onChange={handleSearch}
      />
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default SearchBar;