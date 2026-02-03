"use client";

import React from "react";

interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
  title?: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss, title = "Something went wrong" }) => {
  if (!message) return null;

  return (
    <div className="notification is-danger is-light" role="alert">
      <button className="delete" aria-label="Dismiss error" onClick={onDismiss} />
      <p className="has-text-weight-semibold mb-1">{title}</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorBanner;
