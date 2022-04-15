export async function sleep (period: number) {
  return await new Promise((resolve, reject) => setTimeout(resolve, period));
}
