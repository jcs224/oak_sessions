export async function parseFormParams(ctx) {
  const params = new Map

  if (ctx.request.hasBody) {

    const requestBody = ctx.request.body()

    switch(requestBody.type) {
      case 'json':
        const jsonPayload = await requestBody.value

        for (const prop in jsonPayload) {
          params.set(prop, jsonPayload[prop])
        }
        break;
      case 'form':
        const formPayload = await requestBody.value
        formPayload.forEach((value, key) => {
          params.set(key, value)
        })
        break;
      case 'form-data':
        const formDataPayload = requestBody.value
        const formData = await formDataPayload.read()
        const fields = formData.fields
        console.log(fields)

        for (const prop in fields) {
          params.set(prop, fields[prop])
        }
    }
  }

  return params
}