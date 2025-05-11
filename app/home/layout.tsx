import React from 'react';
import Navbar from '@/components/layout/Navbar';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>

    </>
  );
}