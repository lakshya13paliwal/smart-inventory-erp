import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useForecast(productId: number | null) {
  return useQuery({
    queryKey: [api.forecasts.get.path, productId],
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) throw new Error("No Product ID");
      const url = buildUrl(api.forecasts.get.path, { productId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return api.forecasts.get.responses[200].parse(await res.json());
    },
  });
}
