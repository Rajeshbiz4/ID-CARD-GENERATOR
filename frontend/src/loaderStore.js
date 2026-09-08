const activeTokens = new Set();
const listeners = new Set();

function notify() {
  const state = {
    loading: activeTokens.size > 0,
    count: activeTokens.size,
  };

  listeners.forEach((listener) => {
    listener(state);
  });
}

export function beginLoading(source = "request") {
  const token =
    `${source}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

  activeTokens.add(token);
  notify();

  return token;
}

export function endLoading(token) {
  if (!token) return;

  activeTokens.delete(token);
  notify();
}

export function getLoadingState() {
  return {
    loading: activeTokens.size > 0,
    count: activeTokens.size,
  };
}

export function subscribeLoading(listener) {
  listeners.add(listener);

  listener(getLoadingState());

  return () => {
    listeners.delete(listener);
  };
}
