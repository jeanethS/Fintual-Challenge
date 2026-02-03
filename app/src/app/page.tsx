"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Portfolio, PortfolioStock, RebalanceAction } from "@/lib/Portfolio";
import ErrorBanner from "@/components/ErrorBanner";
import HoldingsTable, { HoldingRow } from "@/components/HoldingsTable";
import AddStockForm from "@/components/AddStockForm";
import RebalanceActionsCard from "@/components/RebalanceActionsCard";
import PortfolioMetricsHeader from "@/components/PortfolioMetricsHeader";
import ThemeToggle from "@/components/ThemeToggle";

const peso = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number) => peso.format(value);
const formatNumber = (value: number) => value.toFixed(2);
const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

const mockPrices: Record<string, number> = {
  AAPL: 145.2,
  TSLA: 215.18,
  GOOG: 2800.5,
};

export default function Home() {
  const pricesRef = useRef<Record<string, number>>(mockPrices);
  const [prices, setPrices] = useState<Record<string, number>>(mockPrices);
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>(() => [
    {
      stock: {
        symbol: "AAPL",
        getCurrentPrice: () => pricesRef.current["AAPL"] ?? 0,
      },
      sharesOwned: 50,
      targetAllocation: 0.4,
    },
    {
      stock: {
        symbol: "TSLA",
        getCurrentPrice: () => pricesRef.current["TSLA"] ?? 0,
      },
      sharesOwned: 12,
      targetAllocation: 0.2,
    },
    {
      stock: {
        symbol: "GOOG",
        getCurrentPrice: () => pricesRef.current["GOOG"] ?? 0,
      },
      sharesOwned: 8,
      targetAllocation: 0.4,
    },
  ]);
  const [threshold, setThreshold] = useState(0.01);
  const [autoNormalizeTargets, setAutoNormalizeTargets] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  const getPrice = (symbol: string) => prices[symbol] ?? 0;

  const allocationSum = useMemo(
    () => portfolioStocks.reduce((sum, item) => sum + item.targetAllocation, 0),
    [portfolioStocks]
  );

  const normalizedStocks = useMemo(() => {
    if (autoNormalizeTargets && allocationSum > 0) {
      return portfolioStocks.map((item) => ({
        ...item,
        targetAllocation: item.targetAllocation / allocationSum,
      }));
    }
    return portfolioStocks;
  }, [allocationSum, autoNormalizeTargets, portfolioStocks]);

  const isAllocationValid = autoNormalizeTargets || Math.abs(allocationSum - 1) < 0.00001;
  const isOverAllocated = allocationSum > 1 + 0.00001;

  useEffect(() => {
    if (!autoNormalizeTargets && Math.abs(allocationSum - 1) > 0.00001) {
      setUiError(`Target allocations must add up to 100%. Current total: ${formatPercent(allocationSum)}`);
    } else {
      setUiError(null);
    }
  }, [allocationSum, autoNormalizeTargets]);

  const totalValue = useMemo(
    () => portfolioStocks.reduce((sum, item) => sum + item.sharesOwned * getPrice(item.stock.symbol), 0),
    [portfolioStocks, prices]
  );

  const portfolioRows = useMemo<HoldingRow[]>(() => {
    return portfolioStocks.map((item) => {
      const price = getPrice(item.stock.symbol);
      const value = price * item.sharesOwned;
      const currentPercent = totalValue > 0 ? value / totalValue : 0;
      return {
        symbol: item.stock.symbol,
        sharesOwned: item.sharesOwned,
        price,
        value,
        currentPercent,
        targetAllocation:
          autoNormalizeTargets && allocationSum > 0
            ? item.targetAllocation / allocationSum
            : item.targetAllocation,
      };
    });
  }, [allocationSum, autoNormalizeTargets, portfolioStocks, totalValue]);

  const distribution = useMemo(
    () =>
      portfolioRows
        .filter((row) => row.value > 0 && totalValue > 0)
        .map((row) => ({ symbol: row.symbol, percent: row.value / totalValue })),
    [portfolioRows, totalValue]
  );

  const rebalanceActions = useMemo(() => {
    if (!isAllocationValid || totalValue === 0) return [] as RebalanceAction[];

    const percentBySymbol = new Map(
      portfolioRows.map((row) => [row.symbol, { current: row.currentPercent, target: row.targetAllocation }])
    );

    try {
      const portfolio = new Portfolio(normalizedStocks);
      return portfolio
        .rebalance()
        .filter((action) => {
          const percentInfo = percentBySymbol.get(action.symbol);
          if (!percentInfo) return false;
          const diff = Math.abs(percentInfo.target - percentInfo.current);
          return diff >= threshold;
        })
        .map((action) => ({
          ...action,
          shares: Number(formatNumber(action.shares)),
          value: Number(formatNumber(action.value)),
        }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rebalance failed.";
      setUiError(message);
      return [] as RebalanceAction[];
    }
  }, [isAllocationValid, normalizedStocks, portfolioRows, threshold, totalValue]);

  const handleAddStock = (payload: { symbol: string; sharesOwned: number; targetAllocation: number; price: number }) => {
    setPrices((prev) => ({ ...prev, [payload.symbol]: payload.price }));
    setPortfolioStocks((prev) => [
      ...prev,
      {
        stock: {
          symbol: payload.symbol,
          getCurrentPrice: () => pricesRef.current[payload.symbol] ?? 0,
        },
        sharesOwned: payload.sharesOwned,
        targetAllocation: payload.targetAllocation,
      },
    ]);
  };

  const handleChangeShares = (symbol: string, next: number) => {
    if (Number.isNaN(next) || next < 0) {
      setUiError("Shares must be a non-negative number.");
      return;
    }
    setPortfolioStocks((prev) => prev.map((item) => (item.stock.symbol === symbol ? { ...item, sharesOwned: next } : item)));
  };

  const handleChangePrice = (symbol: string, next: number) => {
    if (Number.isNaN(next) || next < 0) {
      setUiError("Price must be a non-negative number.");
      return;
    }
    setPrices((prev) => ({ ...prev, [symbol]: next }));
  };

  const handleChangeTarget = (symbol: string, next: number) => {
    if (Number.isNaN(next) || next < 0) {
      setUiError("Target allocation must be non-negative.");
      return;
    }
    setPortfolioStocks((prev) => {
      const otherTotal = prev.reduce((sum, item) => {
        if (item.stock.symbol === symbol) return sum;
        return sum + item.targetAllocation;
      }, 0);
      const maxAllowed = Math.max(0, 1 - otherTotal);
      const clampedNext = Math.min(next, maxAllowed);

      if (next > maxAllowed + 0.00001) {
        setUiError(`Target allocations cannot exceed 100%. Max allowed for ${symbol}: ${formatPercent(maxAllowed)}`);
      }

      return prev.map((item) =>
        item.stock.symbol === symbol ? { ...item, targetAllocation: clampedNext } : item
      );
    });
  };

  const handleRemove = (symbol: string) => {
    setPortfolioStocks((prev) => prev.filter((item) => item.stock.symbol !== symbol));
  };

  const handleExecute = () => {
    if (!isAllocationValid || rebalanceActions.length === 0) return;

    const actionMap = new Map(rebalanceActions.map((action) => [action.symbol, action]));

    setPortfolioStocks((prev) =>
      prev.map((item) => {
        const action = actionMap.get(item.stock.symbol);
        if (!action) return item;
        const delta = action.action === "BUY" ? action.shares : -action.shares;
        return { ...item, sharesOwned: Math.max(0, item.sharesOwned + delta) };
      })
    );
  };

  return (
    <section className="section" style={{ minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="mb-6">
          <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
            <div>
              <h1 className="title is-2 mb-1">Portfolio Overview</h1>
              <p className="subtitle is-6 has-text-grey">Track and rebalance your holdings.</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <ErrorBanner message={uiError} onDismiss={() => setUiError(null)} />

        <PortfolioMetricsHeader
          totalValue={totalValue}
          activeCount={portfolioStocks.length}
          allocationValid={isAllocationValid}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          distribution={distribution}
        />

        <AddStockForm
          onAdd={handleAddStock}
          existingSymbols={portfolioStocks.map((p) => p.stock.symbol)}
          allocationTotal={allocationSum}
        />

        <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <label className="checkbox">
            <input
              type="checkbox"
              className="mr-2"
              checked={autoNormalizeTargets}
              onChange={(event) => setAutoNormalizeTargets(event.target.checked)}
            />
            Auto-normalize target allocations
          </label>
          <span className="has-text-grey is-size-7">When enabled, targets are scaled to sum to 100% automatically.</span>
        </div>

        <HoldingsTable
          rows={portfolioRows}
          targetTotal={allocationSum}
          autoNormalize={autoNormalizeTargets}
          onChangeShares={handleChangeShares}
          onChangePrice={handleChangePrice}
          onChangeTarget={handleChangeTarget}
          onRemove={handleRemove}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          formatNumber={formatNumber}
        />

        <RebalanceActionsCard
          threshold={threshold}
          onChangeThreshold={setThreshold}
          actions={rebalanceActions}
          canExecute={!isOverAllocated && isAllocationValid && rebalanceActions.length > 0}
          onExecute={handleExecute}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      </div>
    </section>
  );
}
