export async function sleep(period: number) {
  return await new Promise((resolve) => setTimeout(resolve, period));
}
