
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { WalletConnect } from "@/components/WalletConnect";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi-config';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="container mx-auto p-4 max-w-md">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-center">Multi-Wallet DApp</h1>
          </header>
          
          <main>
            <WalletConnect />
          </main>
          
          <Toaster />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
