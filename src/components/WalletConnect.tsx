
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useBalance,
  useChainId
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

  return (
    <div className="flex flex-col gap-4 p-4">
      {!isConnected ? (
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
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-slate-50">
            <h3 className="font-semibold">Connected Wallet</h3>
            <p className="text-sm truncate">Address: {address}</p>
            <p className="text-sm">Balance: {balance ? `${balance.formatted} ${balance.symbol}` : 'Loading...'}</p>
            <p className="text-sm">Network: {getNetworkName(chainId)}</p>
            <p className="text-sm">Connector: {connector?.name || 'Unknown'}</p>
          </div>
          <Button 
            onClick={() => disconnect()} 
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
