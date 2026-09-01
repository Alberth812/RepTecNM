export const getServerSideURL = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

const isDOMAvailable = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export const getClientSideURL = () => {
  if (isDOMAvailable) {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;

    return `${protocol}//${domain}${port ? `:${port}` : ""}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "";
};
