import { api } from "@/services/api";

const PAGE_LIMIT = 100;

const unwrapData = (response) => response?.data?.data;

async function fetchPaginated(path, collectionKey, params = {}) {
  const first = await api.get(path, {
    params: { ...params, page: 1, limit: PAGE_LIMIT },
  });
  const firstData = unwrapData(first) ?? {};
  const items = firstData[collectionKey] ?? [];
  const pages = Number(firstData.pages ?? 1);

  if (pages <= 1) return items;

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      api.get(path, {
        params: { ...params, page: index + 2, limit: PAGE_LIMIT },
      }),
    ),
  );

  return rest.reduce((all, response) => {
    const data = unwrapData(response) ?? {};
    return all.concat(data[collectionKey] ?? []);
  }, items);
}

export const overviewApi = {
  async getClients() {
    const response = await api.get("/clients");
    return unwrapData(response) ?? [];
  },

  getInvoices() {
    return fetchPaginated("/invoices", "invoices", {
      includeCancelled: "true",
    });
  },

  getPayments() {
    return fetchPaginated("/payments", "payments");
  },

  async getSubscription() {
    const response = await api.get("/subscriptions/me");
    return unwrapData(response);
  },

  async getOverviewData() {
    const [clients, invoices, payments, subscription] = await Promise.all([
      this.getClients(),
      this.getInvoices(),
      this.getPayments(),
      this.getSubscription(),
    ]);

    return { clients, invoices, payments, subscription };
  },
};
