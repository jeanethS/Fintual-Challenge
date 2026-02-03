export interface Stock {
    symbol: string;
    getCurrentPrice: () => number;
}

/** * Represents a stock in a specific user's portfolio, including how much they own and target allocation */
export interface PortfolioStock {
    stock: Stock;
    sharesOwned: number;
    targetAllocation: number;
}

/** I decided to opt for a interface here instead of a class since it's just a data structure that will
 * represent an action to take during portfolio rebalancing */
export interface RebalanceAction {
    symbol: string;
    action: 'BUY' | 'SELL';
    shares: number;
    value: number;
}

export class Portfolio {
    constructor(private stocks: PortfolioStock[]) {
        // Validate that allocations sum to 100%
        this.validateAllocations();
    }

    /** Because we acept fractions for targetAllocation (e.g., 0.25 for 25%), we need to ensure they sum to 1.0 
     * use a small epsilon for floating point precision issues that arised when testing
    */
    private validateAllocations(): void {
        const sum = this.stocks.reduce((s, stock) => s + stock.targetAllocation, 0);
        if (Math.abs(sum - 1.0) > 0.00001) {
            throw new Error(`Total must be 100%, but total is ${(sum * 100).toFixed(1)}%`);
        }
    }

    // Basically compares current holdings vs. target goals and generates trades.
    public rebalance(): RebalanceAction[] {
        // Get total cash value of the entire portfolio
        const totalValue = this.calculateTotalValue();

        // Map over each stock to know if it's over or under target allocation
        let rebalancedPortfolio: RebalanceAction[] = this.stocks
            .map(portfolioStock => {
                const price = portfolioStock.stock.getCurrentPrice();
                
                // Money currently in this stock
                const currentValue = portfolioStock.sharesOwned * price;
                
                // Money we want in this stock
                const targetValue = totalValue * portfolioStock.targetAllocation;
                
                // Difference between what we want and what we have
                const valueGap = targetValue - currentValue;
                
                //If the gap is more than 0 so we buy, else sell
                const action: RebalanceAction["action"] = valueGap > 0 ? 'BUY' : 'SELL';
                // Return the action to take show in an array
                return { 
                    symbol: portfolioStock.stock.symbol,
                    action,
                    // Calculate shares to buy/sell based on price, example: $500 gap / $50 price = 10 shares
                    shares: Math.abs(valueGap) / price,
                    // Absolute value of the gap in dollars
                    value: Math.abs(valueGap)
                };
            })
            // Safety filter to remove any null entries
            .filter((action)=> action !== null);

        return rebalancedPortfolio;
    }

    // Calculate the total cash value of the portfolio based on current stock prices and shares owned
    private calculateTotalValue(): number {
        return this.stocks.reduce((total, s) => {
            return total + (s.sharesOwned * s.stock.getCurrentPrice());
        }, 0);
    }
}