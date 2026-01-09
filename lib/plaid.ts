import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

let plaidClient: PlaidApi | null = null

export function getPlaidClient(): PlaidApi {
  if (!plaidClient) {
    const configuration = new Configuration({
      basePath:
        process.env.PLAID_ENV === "production"
          ? PlaidEnvironments.production
          : process.env.PLAID_ENV === "development"
          ? PlaidEnvironments.development
          : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
          "PLAID-SECRET": process.env.PLAID_SECRET!,
        },
      },
    })

    plaidClient = new PlaidApi(configuration)
  }

  return plaidClient
}

