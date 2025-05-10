import React from 'react'

function InfoSection() {
  return (
    <section className="mt-20">
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="font-bold text-3xl text-center mb-10">
        Your Trusted Platform for Vehicle Trading
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="max-w-lg md:max-w-none">
            <p className="text-gray-700 text-lg">
              Whether you're looking to buy your dream car or sell your current vehicle, 
              we provide a secure and efficient marketplace. With our extensive selection 
              of new and pre-owned vehicles, advanced search features, and verified sellers, 
              finding the perfect match has never been easier.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#eef0fc] p-6 rounded-xl hover:shadow-md transition-all">
                <h3 className="font-semibold text-xl text-primary mb-2">Verified Sellers</h3>
                <p className="text-gray-600">All our sellers are verified for your peace of mind</p>
              </div>
              <div className="bg-[#eef0fc] p-6 rounded-xl hover:shadow-md transition-all">
                <h3 className="font-semibold text-xl text-primary mb-2">Secure Transactions</h3>
                <p className="text-gray-600">Safe and secure platform for all your dealings</p>
              </div>
            </div>
          </div>
        </div>
  
        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2670&auto=format&fit=crop"
            className="rounded-xl shadow-lg w-full object-cover max-h-[400px] mb-10" 
            alt="Luxury car showroom"
          />
        </div>
      </div>
    </div>
  </section>
  )
}

export default InfoSection
