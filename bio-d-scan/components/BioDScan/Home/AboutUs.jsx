import React from 'react';

const AboutUsSection = () => {
    return (
        <section className="container mx-auto px-4 py-12">
            {/* Top content (heading, subheading, button) */}
            <div className="mt-[50px] md:mt-0 flex flex-col md:flex-row items-start md:items-center mb-10">
                {/* Left Text Content */}
                <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">We Collect Vital Data to Protect Bees & Ecosystems</h2>
                    <p className="text-gray-600 mb-6 text-base md:text-lg">
                        Our platform continuously monitors various bee species in the field, tracking their population levels and calculating biodiversity indexes. By also recording temperature and
                        moisture data, we gain crucial insights into the environmental conditions that affect hive health and overall pollinator well-being.
                    </p>
                    <button className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600">About Us</button>
                </div>

                {/* Right Paragraph (optional) */}
                <div className="hidden md:block w-full md:w-1/2">
                    <p className="text-gray-500 text-base md:text-lg">
                        With accurate, real-time information, researchers and conservationists can devise strategies to protect bee populations and maintain ecological balance. Our mission is to
                        empower communities, beekeepers, and environmental organizations with the data they need to support healthy pollinator habitats.
                    </p>
                </div>
            </div>


            {/* Image & Card Section */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Beekeeper Image */}
                <div className="w-full md:w-1/2">
                    <img src="/assets/images/HomePage/beekeeper-working-on-beehive.jpg" alt="Beekeeper inspecting hive" className="w-full h-auto rounded shadow" />
                </div>

                {/* "100% Organic" Card (you can rename or repurpose this section) */}
                <div className="w-full md:w-1/2 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md flex flex-col justify-center shadow">
                    <div className="flex items-center mb-4">
                        {/* Icon */}
                        <div className="text-yellow-500 text-3xl mr-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l6 6-6 6M21 7l-6 6 6 6" />
                            </svg>
                        </div>
                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-800">Accurate Data Collection</h3>
                    </div>
                    <p className="text-gray-600">
                        Using advanced sensors and field observations, we gather precise data on bee populations and environmental factors. This allows us to provide actionable insights to
                        stakeholders, ensuring the long-term health of both pollinators and the ecosystems they support.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;
