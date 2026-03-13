

export class ApiRequest {

    private static key: string = process.env.API_KEY || "";;

    constructor() {

    }

    static async get(url: string) {
    }

    static async post(url: string, data: any) {
        const response = await fetch(url, { method: "POST", body: JSON.stringify(data), headers: { "Authorization": `Bearer ${this.key}` } })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
    }
}

