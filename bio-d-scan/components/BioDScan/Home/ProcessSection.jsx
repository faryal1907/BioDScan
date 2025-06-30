import React from 'react';

const ProcessSection = () => {
    return (
        <section
            className="
        relative 
        w-full 
        h-[600px] 
        bg-[url('/assets/images/HomePage/beekeeper-working-collect-honey-2.jpg')] 
        bg-cover 
        bg-center 
        bg-no-repeat
        mb-16
      "
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            {/* Text content above overlay */}
            <div className="relative container mx-auto px-4 py-16 flex flex-col justify-center h-full z-10">
                {/* Optional small label */}
                <span className="text-yellow-500 font-semibold mb-2 uppercase tracking-widest">Our Method</span>

                {/* Main heading */}
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How We Gather & Analyze Bee Data</h2>

                {/* Description */}
                <p className="text-gray-200 mb-6 max-w-xl">
                    From field observations to sensor-based tracking, our process ensures accurate data collection on various bee species, their population dynamics, and the environmental factors that
                    influence them. By continuously monitoring temperature, moisture levels, and habitat conditions, we generate valuable insights to support sustainable pollinator management.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center space-x-4">
                    {/* Learn More button */}
                    <button className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600">Learn More</button>

                    {/* "Play Video" button */}
                    <button className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-300">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        <span className="font-semibold">Watch Process Video</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
