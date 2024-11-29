import React, { useEffect, useState } from 'react';


function HeroSection() {
    // State to control the visibility of the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const openModal = () => {
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
    };
  
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-xl font-bold">ScheduleSmart</h1>
            <p className="py-12"></p>
            <button className="btn btn-info btn-lg p-5 text-xl flex justify-center items-center w-full h-full" onClick={openModal}>Help</button>
          </div>
        </div>
  
        {/* Modal for instructions */}
        {isModalOpen && (
          <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
            <div className="modal-box relative">
              <label htmlFor="my-modal" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={closeModal}>✕</label>
              <h3 className="text-4xl font-bold">Instructions</h3>
              <p className="py-5 text-xl">Here are the steps to use this system efficiently:</p>
              <ul className="list-disc list-inside">
                <li className="text-xl">Navigate to Manage All Test Lines to add or edit test line details.</li>
                <li className="text-xl">Go to Manage All Tools to view and manage your inventory.</li>
                <li className="text-xl">For help, contact help@tamu.edu</li>
              </ul>
              <div className="modal-action">
                <button className="btn btn-info btn-lg p-5 text-xl flex justify-center items-center w-full h-full" onClick={closeModal}>Got it!</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default HeroSection
  