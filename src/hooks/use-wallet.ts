
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export type Wallet = {
  address: string;
  provider: ethers.BrowserProvider;
  chainId: number;
  balance: string;
  name: string;
};

export function useWallet() {
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Create ethers provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get network information
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Get balance
      const balance = ethers.formatEther(
        await provider.getBalance(address)
      );
      
      setCurrentWallet({
        address,
        provider,
        chainId,
        balance,
        name: 'MetaMask'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to connect to wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setCurrentWallet(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnect();
        } else if (currentWallet && accounts[0] !== currentWallet.address) {
          // User switched accounts, reconnect
          connectMetaMask();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [currentWallet]);

  return {
    currentWallet,
    isConnecting,
    error,
    connectMetaMask,
    disconnect
  };
}
