import React from "react";

interface State {
  err?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = {};

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[Kaloriya] app crashed", err, info);
  }

  reset = () => {
    this.setState({ err: undefined });
  };

  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 text-center gap-4 max-w-md mx-auto">
        <div className="text-5xl">🛠</div>
        <div className="font-display text-xl">Ilova qayta ishlashi kerak</div>
        <div className="text-dim text-sm">
          Bir noaniq xatolik yuz berdi. Sahifani yangilang. Ma'lumotlaringiz
          xavfsiz saqlangan.
        </div>
        <pre className="w-full text-left text-[11px] text-mute bg-elev2 rounded-xl p-3 overflow-auto max-h-40">
          {this.state.err.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-3 bg-cal text-bg rounded-xl font-semibold"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }
}
