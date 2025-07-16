'use client';
import { IRootState } from '@/store';
import React from 'react';
import { useSelector } from 'react-redux';

const MainContainer = ({ children }: { children: React.ReactNode }) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    return <div className={`main-container min-h-screen w-full text-black dark:text-white-dark`} style={{ padding: '15px' }}>{children}</div>;
};

export default MainContainer;
