import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Wallet, FileSignature } from 'lucide-react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useBalance,
  useChainId,
  useSignMessage
} from 'wagmi';
import { metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';

export function WalletConnect() {
  const { address, isConnected, connector } = useAccount();
  const { connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });
  const chainId = useChainId();
  const { signMessage, isPending: isSignPending } = useSignMessage();
  
  // Track connected connectors
  const [connectedWallets, setConnectedWallets] = useState<Array<{name: string, address: string}>>([]);
  const [activeWalletIndex, setActiveWalletIndex] = useState<number>(0);
  const [signatureResults, setSignatureResults] = useState<Record<string, string>>({});
  
  // Map chainId to network name
  const getNetworkName = (id: number | undefined) => {
    if (!id) return 'Unknown';
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia',
      // Add more networks as needed
    };
    return networks[id] || `Chain ID: ${id}`;
  };

  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message,
      });
    }
  }, [error]);

  // Update connected wallets when a new wallet is connected
  React.useEffect(() => {
    if (isConnected && address && connector) {
      // Check if this wallet is already in our list
      const walletExists = connectedWallets.some(wallet => wallet.address === address);
      
      if (!walletExists) {
        const newWallet = {
          name: connector.name || 'Unknown',
          address: address
        };
        setConnectedWallets(prev => [...prev, newWallet]);
        setActiveWalletIndex(connectedWallets.length);
      }
    }
  }, [isConnected, address, connector, connectedWallets]);

  const handleConnectMetaMask = () => {
    connect({ connector: metaMask() });
  };

  const handleConnectCoinbase = () => {
    connect({ connector: coinbaseWallet() });
  };

  const handleConnectWalletConnect = () => {
    connect({ connector: walletConnect({
      projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID',
    }) });
  };

  const handleSwitchWallet = (index: number) => {
    setActiveWalletIndex(index);
  };

  const handleDisconnectWallet = (index: number) => {
    // Only disconnect if this is the active wallet
    if (index === activeWalletIndex) {
      disconnect();
    }
    
    // Remove from our list
    setConnectedWallets(prev => prev.filter((_, i) => i !== index));
    
    // Adjust active index if needed
    if (index === activeWalletIndex) {
      setActiveWalletIndex(connectedWallets.length > 1 ? 0 : -1);
    } else if (index < activeWalletIndex) {
      setActiveWalletIndex(prev => prev - 1);
    }
  };

  const handleSignMessage = async (walletAddress: string, index: number) => {
    try {
      // Only sign with active wallet
      if (index !== activeWalletIndex) {
        handleSwitchWallet(index);
        toast({
          title: "Wallet Switched",
          description: "Now using this wallet. Please try signing again.",
        });
        return;
      }

      const message = `Hello from my DApp! Signing this message proves you own the address: ${walletAddress}. Timestamp: ${Date.now()}`;
      
      const signature = await signMessage({ message });
      
      if (signature) {
        setSignatureResults(prev => ({
          ...prev,
          [walletAddress]: signature
        }));
        
        toast({
          title: "Signature Successful",
          description: "Message was successfully signed.",
        });
      }
    } catch (signError: any) {
      toast({
        variant: "destructive",
        title: "Signature Failed",
        description: signError?.message || "Failed to sign message",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <Button 
          onClick={handleConnectMetaMask} 
          disabled={isPending}
          className="w-full"
        >
          {isPending ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
        <Button 
          onClick={handleConnectCoinbase} 
          disabled={isPending}
          variant="outline"
          className="w-full"
        >
          {isPending ? 'Connecting...' : 'Connect Coinbase Wallet'}
        </Button>
        <Button 
          onClick={handleConnectWalletConnect} 
          disabled={isPending}
          variant="secondary"
          className="w-full"
        >
          {isPending ? 'Connecting...' : 'Connect WalletConnect'}
        </Button>
      </div>
      
      {connectedWallets.length > 0 && (
        <div className="space-y-4 mt-4">
          <h3 className="font-semibold text-lg">Connected Wallets</h3>
          
          <div className="space-y-2">
            {connectedWallets.map((wallet, index) => (
              <div 
                key={wallet.address}
                className={`p-4 border rounded-md ${index === activeWalletIndex ? 'bg-slate-100 border-primary' : 'bg-slate-50'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <h4 className="font-semibold">{wallet.name}</h4>
                  </div>
                  <div className="flex gap-2">
                    {index !== activeWalletIndex && (
                      <Button 
                        onClick={() => handleSwitchWallet(index)} 
                        variant="outline" 
                        size="sm"
                      >
                        Switch
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDisconnectWallet(index)} 
                      variant="destructive" 
                      size="sm"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
                <p className="text-sm truncate">Address: {wallet.address}</p>
                {index === activeWalletIndex && (
                  <>
                    <p className="text-sm">Balance: {balance ? `${balance.formatted} ${balance.symbol}` : 'Loading...'}</p>
                    <p className="text-sm">Network: {getNetworkName(chainId)}</p>
                  </>
                )}
                
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    onClick={() => handleSignMessage(wallet.address, index)}
                    variant="default"
                    size="sm"
                    disabled={isSignPending}
                    className="flex items-center gap-2"
                  >
                    <FileSignature className="h-4 w-4" />
                    {isSignPending && index === activeWalletIndex ? 'Signing...' : 'Sign Message'}
                  </Button>
                  
                  {signatureResults[wallet.address] && (
                    <p className="text-xs text-green-600">✓ Signed</p>
                  )}
                </div>
                
                {signatureResults[wallet.address] && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 break-all">
                      <span className="font-semibold">Signature:</span> 
                      <span className="ml-1">{`${signatureResults[wallet.address].substring(0, 20)}...`}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
