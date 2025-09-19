import { Component, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; err?: any };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any) {
    return { hasError: true, err };
  }

  componentDidCatch(err: any, info: any) {
    console.error('ErrorBoundary', err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-700">
          Đã xảy ra lỗi khi hiển thị trang.
        </div>
      );
    }

    return this.props.children;
  }
}
