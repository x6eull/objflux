import React from 'react';

export default class ErrorBoundary extends React.PureComponent<{ children: React.ReactNode }, { errorNode?: React.ReactNode }> {
  static getDerivedStateFromError(error: any) {
    return { errorNode: <>子组件出错: {error?.message ?? '未知错误'}</> };
  }

  public state: { errorNode?: React.ReactNode } = {};
  render() {
    return <>{this.state.errorNode ?? this.props.children}</>;
  }
}