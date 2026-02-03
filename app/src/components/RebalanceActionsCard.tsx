import React from "react";
import { RebalanceAction } from "@/lib/Portfolio";

interface RebalanceActionsCardProps {
  threshold: number;
  onChangeThreshold: (next: number) => void;
  actions: RebalanceAction[];
  canExecute: boolean;
  onExecute: () => void;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

const RebalanceActionsCard: React.FC<RebalanceActionsCardProps> = ({
  threshold,
  onChangeThreshold,
  actions,
  canExecute,
  onExecute,
  formatCurrency,
  formatNumber,
}) => {
  return (
    <div className="box">
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <h2 className="title is-4 mb-0">Rebalance Actions</h2>
        <div className="select is-small">
          <select value={threshold} onChange={(event) => onChangeThreshold(Number(event.target.value))}>
            <option value={0.005}>Threshold: 0.5%</option>
            <option value={0.01}>Threshold: 1.0%</option>
            <option value={0.02}>Threshold: 2.0%</option>
            <option value={0.05}>Threshold: 5.0%</option>
          </select>
        </div>
      </div>
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Action</th>
              <th className="has-text-right">Shares</th>
              <th className="has-text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {actions.length === 0 && (
              <tr>
                <td colSpan={4} className="has-text-centered has-text-grey">
                  No actions exceed the threshold.
                </td>
              </tr>
            )}
            {actions.map((action) => (
              <tr key={`${action.symbol}-${action.action}`}>
                <td className="has-text-weight-semibold">{action.symbol}</td>
                <td>
                  <span
                    className={`tag ${action.action === "BUY" ? "is-success is-light" : "is-danger is-light"}`}
                  >
                    {action.action}
                  </span>
                </td>
                <td className="has-text-right">{formatNumber(action.shares)}</td>
                <td className="has-text-right">{formatCurrency(action.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="has-text-centered mt-5">
        <button className="button is-dark" onClick={onExecute} disabled={!canExecute}>
          Execute Rebalance
        </button>
      </div>
    </div>
  );
};

export default RebalanceActionsCard;
