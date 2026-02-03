import React from "react";

export interface HoldingRow {
  symbol: string;
  sharesOwned: number;
  price: number;
  value: number;
  currentPercent: number;
  targetAllocation: number;
}

interface HoldingsTableProps {
  rows: HoldingRow[];
  targetTotal: number;
  autoNormalize: boolean;
  onChangeShares: (symbol: string, next: number) => void;
  onChangePrice: (symbol: string, next: number) => void;
  onChangeTarget: (symbol: string, next: number) => void;
  onRemove: (symbol: string) => void;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  formatNumber: (value: number) => string;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({
  rows,
  targetTotal,
  autoNormalize,
  onChangeShares,
  onChangePrice,
  onChangeTarget,
  onRemove,
  formatCurrency,
  formatPercent,
  formatNumber,
}) => {
  return (
    <div className="box mb-5">
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <h2 className="title is-4 mb-0">Holdings</h2>
      </div>
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Stock</th>
              <th className="has-text-right">Shares</th>
              <th className="has-text-right">Price</th>
              <th className="has-text-right">Value</th>
              <th className="has-text-right">Current %</th>
              <th className="has-text-right">Target %</th>
              <th className="has-text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol}>
                <td className="has-text-weight-semibold">{row.symbol}</td>
                <td className="has-text-right" style={{ minWidth: 120 }}>
                  <input
                    className="input has-text-right"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formatNumber(row.sharesOwned)}
                    onChange={(e) => onChangeShares(row.symbol, Number(e.target.value))}
                  />
                </td>
                <td className="has-text-right" style={{ minWidth: 120 }}>
                  <input
                    className="input has-text-right"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formatNumber(row.price)}
                    onChange={(e) => onChangePrice(row.symbol, Number(e.target.value))}
                  />
                </td>
                <td className="has-text-right">{formatCurrency(row.value)}</td>
                <td className="has-text-right">{formatPercent(row.currentPercent)}</td>
                <td className="has-text-right" style={{ minWidth: 140 }}>
                  <div className="field has-addons is-justify-content-flex-end">
                    <p className="control is-expanded">
                      <input
                        className="input has-text-right"
                        type="number"
                        step="0.0001"
                        min="0"
                        max={Math.max(0, 1 - (targetTotal - row.targetAllocation))}
                        value={formatNumber(row.targetAllocation)}
                        onChange={(e) => onChangeTarget(row.symbol, Number(e.target.value))}
                      />
                    </p>
                    <p className="control">
                      <span className="button is-static">{formatPercent(row.targetAllocation)}</span>
                    </p>
                  </div>
                </td>
                <td className="has-text-right" style={{ minWidth: 110 }}>
                  <button className="button is-small is-danger is-light" onClick={() => onRemove(row.symbol)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="is-flex is-justify-content-space-between is-align-items-center mt-2">
        <p className="has-text-weight-semibold">Target total: {formatPercent(targetTotal)}</p>
      </div>
    </div>
  );
};

export default HoldingsTable;
