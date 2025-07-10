import React from 'react';

const Hero = () => {
    return (
        <section
            className="
                relative
                w-full
                h-[800px]
                bg-[url('/assets/images/HomePage/beekeeper-working-collect-honey.jpg')]
                bg-cover
                bg-top
                bg-no-repeat
            "
        >
            {/* Backdrop overlay */}
            <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

            {/* Content positioned above the overlay */}
            <div className="relative container mx-auto px-4 pt-32 pb-12 md:pt-40 md:pb-24 flex flex-col md:flex-row items-start z-10">
                {/* Left Text Content */}
                <div className="w-full md:w-1/2 md:pr-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Welcome to Bio D Scan</h1>
                    <p className="text-gray-200 mb-6 text-lg">
                        We gather vital data on various bee species, monitor their populations, and analyze biodiversity indexes—all while producing organic. By tracking temperature and moisture
                        levels, we ensure a sustainable environment for our hives and a superior product for you.
                    </p>
                    <div className="flex space-x-4">
                        <button className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600">Learn More</button>
                        <button className="border border-yellow-500 text-yellow-500 px-6 py-3 rounded-md hover:bg-yellow-500 hover:text-white">Watch Video</button>
                    </div>
                </div>
            </div>

            <div className="my-[50px] md:my-0 relative container mx-auto px-4 py-12 flex flex-row flex-nowrap overflow-x-auto justify-start gap-4 z-10">
                <div className="w-1/2 min-w-[220px] lg:w-1/4 bg-white bg-opacity-30 backdrop-blur-lg p-3 lg:p-6 rounded-md">
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        <div className="text-yellow-500 text-2xl lg:text-4xl">
                            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L15 12l-5.25-5"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-sm lg:text-xl font-semibold mb-1 text-white">High Technology</h3>
                            <p className="text-xs lg:text-base text-white">We employ cutting-edge sensors and data analytics to track bee activity, population trends, and environmental conditions in real time.</p>
                        </div>
                    </div>
                </div>
                <div className="w-1/2 min-w-[220px] lg:w-1/4 bg-white bg-opacity-30 backdrop-blur-lg p-3 lg:p-6 rounded-md">
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        <div className="text-yellow-500 text-2xl lg:text-4xl">
                            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L15 12l-5.25-5"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-sm lg:text-xl font-semibold mb-1 text-white">Quality Product</h3>
                            <p className="text-xs lg:text-base text-white">All our honey comes from carefully monitored hives, ensuring top-tier taste and nutrition while preserving biodiversity and healthy ecosystems.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
