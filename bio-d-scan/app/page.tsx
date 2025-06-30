// import ComponentsDashboardAnalytics from '@/components/dashboard/components-dashboard-analytics';
import AboutUsSection from '@/components/BioDScan/Home/AboutUs';
import Footer from '@/components/BioDScan/Home/Footer';
import Header from '@/components/BioDScan/Home/Header';
import Hero from '@/components/BioDScan/Home/HeroSection';
import ProcessSection from '@/components/BioDScan/Home/ProcessSection';
// import { Metadata } from 'next';
import React from 'react';
// import { redirect } from 'next/navigation';

// export const metadata: Metadata = {
//     title: 'Analytics Admin',
// };

const Home = () => {
    // redirect('/dashboard');
    return (
        <div>
            <Header />
            <Hero />
            <AboutUsSection />
            <ProcessSection />
            <Footer />
        </div>
    );
};

export default Home;
