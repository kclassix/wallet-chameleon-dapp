
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { WalletConnect } from "@/components/WalletConnect";

function App() {
  return (
    <div className="container mx-auto p-4 max-w-md">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-center">Multi-Wallet DApp</h1>
      </header>
      
      <main>
        <WalletConnect />
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
