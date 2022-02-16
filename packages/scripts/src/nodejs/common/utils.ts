 

export async function sleep(period: number) {
    return await new Promise((r) => setTimeout(r, period));
}
