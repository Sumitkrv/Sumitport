import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{ fallback?: ReactNode }>;

// An optional WebGL scene (or its lazy chunk) must not take down page content.
export default class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Optional 3D scene unavailable", error.message, info.componentStack);
  }

  render() { return this.state.failed ? this.props.fallback ?? null : this.props.children; }
}
