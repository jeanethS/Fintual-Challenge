interface Stock {
    symbol: string;
    getCurrentPrice: () => number;
}

interface PortfolioStock {
    stock: Stock;
    sharesOwned: number;
    targetAllocation: number;
}

interface RebalanceAction {
    symbol: string;
    action: 'BUY' | 'SELL';
    shares: number;
    value: number
}

class Portfolio {
    constructor(private stocks: PortfolioStock[]) {
        this.validateAllocations();
    }
    private validateAllocations(): void {
        const sum = this.stocks.reduce((s, stock) => s + stock.targetAllocation, 0);
        if (Math.abs(sum - 1.0) > 0.00001) {
            throw new Error(`Total must be 100%, but total is ${(sum * 100).toFixed(1)}%`);
        }
    }

    public rebalance(): RebalanceAction[] {
        const totalValue = this.calculateTotalValue();


         let rebalancedPortfolio: RebalanceAction[] = this.stocks
            .map(portfolioStock => {
                const price = portfolioStock.stock.getCurrentPrice();
                const currentValue = portfolioStock.sharesOwned * price;
                const targetValue = totalValue * portfolioStock.targetAllocation;
                const valueGap = targetValue - currentValue;
                const action: RebalanceAction["action"] = valueGap > 0 ? 'BUY' : 'SELL';
                return { 
                    symbol: portfolioStock.stock.symbol,
                    action,
                    shares: Math.abs(valueGap) / price,
                    value: Math.abs(valueGap)
                };
            }).filter((action)=> action !== null);
            return rebalancedPortfolio;
    }

    private calculateTotalValue(): number {
        return this.stocks.reduce((total, s) => {
            return total + (s.sharesOwned * s.stock.getCurrentPrice());
        }, 0);
    }
}