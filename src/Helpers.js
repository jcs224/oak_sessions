export async function parseFormParams(ctx) {
  const params = new Map
  
  if (await ctx.request.body().value) {
    const value = await ctx.request.body().value

    value.forEach((value, key) => {
      params.set(key, value)
    })
  }

  return params
}