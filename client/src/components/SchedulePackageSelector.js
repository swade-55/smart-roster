const SchedulePackageSelector = ({ onPackageSelect, selectedPackage }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Select Schedule Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => onPackageSelect('7-day')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPackage === '7-day' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <h4 className="font-bold mb-2">7-Day Package</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>7 days of operation</li>
              <li>Mix of 4 and 5-day employee schedules</li>
              <li>Flexible staffing options</li>
            </ul>
          </button>
  
          <button 
            onClick={() => onPackageSelect('6-day')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPackage === '6-day' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <h4 className="font-bold mb-2">6-Day Package</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>6 days of operation</li>
              <li>4-day employee schedules only</li>
              <li>One guaranteed off day</li>
            </ul>
          </button>
        </div>
      </div>
    );
  };
  
  export default SchedulePackageSelector;