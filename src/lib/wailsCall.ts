export type WailsResponse<T = any> = {
  status: number;
  msg: string;
  data: T;
};

export async function wailsCall<T = any>(
  fn: (...args: any[]) => Promise<WailsResponse<T>>,
  ...args: any[]
): Promise<WailsResponse<T>> {
  const res = await fn(...args);
  if (!res || typeof res.status !== "number") {
    throw new Error("Resposta inválida do backend.");
  }
  if (res.status >= 200 && res.status < 300) return res;
  throw new Error(res.msg || `Falha (status ${res.status})`);
}
