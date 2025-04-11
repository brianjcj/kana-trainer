import React from "react";
import KanaTrainer from "./KanaTrainer";

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean }> {
    state = { hasError: false };
  
    static getDerivedStateFromError() {
      return { hasError: true };
    }
  
    render() {
      if (this.state.hasError) {
        return <h1>发生错误，请刷新页面。</h1>;
      }
      return this.props.children;
    }
  }
  
  export default () => (
    <ErrorBoundary>
      <KanaTrainer />
    </ErrorBoundary>
  );