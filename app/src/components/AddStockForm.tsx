import React, { useMemo, useState } from "react";

interface AddStockFormProps {
  onAdd: (payload: { symbol: string; sharesOwned: number; targetAllocation: number; price: number }) => void;
  existingSymbols?: string[];
  allocationTotal: number;
}

const AddStockForm: React.FC<AddStockFormProps> = ({ onAdd, existingSymbols = [], allocationTotal }) => {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("10");
  const [target, setTarget] = useState("0.05");
  const [price, setPrice] = useState("100");
  const symbolsSet = useMemo(() => new Set(existingSymbols.map((s) => s.toUpperCase())), [existingSymbols]);
  const parsedTarget = Number(target);
  const exceedsAllocation =
    !Number.isNaN(parsedTarget) && allocationTotal + parsedTarget > 1 + 0.00001;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = symbol.trim().toUpperCase();
    const nextShares = Number(shares);
    const nextTarget = Number(target);
    const nextPrice = Number(price);

    if (!trimmed) {
      return;
    }
    if (symbolsSet.has(trimmed)) {
      return;
    }
    if ([nextShares, nextTarget, nextPrice].some((n) => Number.isNaN(n) || n < 0)) {
      return;
    }
    if (allocationTotal + nextTarget > 1 + 0.00001) {
      return;
    }

    onAdd({ symbol: trimmed, sharesOwned: nextShares, targetAllocation: nextTarget, price: nextPrice });
    setSymbol("");
    setShares("10");
    setTarget("0.05");
    setPrice("100");
  };

  return (
    <div className="box mb-5">
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <h2 className="title is-4 mb-0">Add Stock</h2>
        <button
          className="button is-link is-light"
          type="submit"
          form="add-stock-form"
          disabled={exceedsAllocation}
          title={exceedsAllocation ? "Target allocation would exceed 100%." : undefined}
        >
          Add
        </button>
      </div>
      <form id="add-stock-form" onSubmit={handleSubmit}>
        <div className="columns is-variable is-3 is-multiline">
          <div className="column is-half-tablet is-one-quarter-desktop">
            <label className="label">Symbol</label>
            <div className="control">
              <input
                className="input"
                placeholder="AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
          </div>
          <div className="column is-half-tablet is-one-quarter-desktop">
            <label className="label">Shares Owned</label>
            <div className="control">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
              />
            </div>
          </div>
          <div className="column is-half-tablet is-one-quarter-desktop">
            <label className="label">Target Allocation</label>
            <div className="control">
              <input
                className="input"
                type="number"
                min="0"
                step="0.0001"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <p className="help">Enter as decimal (e.g., 0.25 for 25%).</p>
          </div>
          <div className="column is-half-tablet is-one-quarter-desktop">
            <label className="label">Price</label>
            <div className="control">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStockForm;
