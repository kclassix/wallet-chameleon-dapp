
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from '@/components/ui/use-toast';

export function WalletConnect() {
  const { currentWallet, isConnecting, error, connectMetaMask, disconnect } = useWallet();

  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error,
      });
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {!currentWallet ? (
        <Button 
          onClick={connectMetaMask} 
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-slate-50">
            <h3 className="font-semibold">Connected Wallet</h3>
            <p className="text-sm truncate">Address: {currentWallet.address}</p>
            <p className="text-sm">Balance: {currentWallet.balance} ETH</p>
            <p className="text-sm">Network ID: {currentWallet.chainId}</p>
          </div>
          <Button 
            onClick={disconnect} 
            variant="outline" 
            className="w-full"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
