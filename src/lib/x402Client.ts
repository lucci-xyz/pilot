import { prisma } from "@/lib/db";
import { processX402PaymentSolana, X402PaymentDetails, LAMPORTS_PER_SOL } from "@/lib/solana";
import { assertAgentWithinBudget, recordAgentTransaction, BudgetExceededError } from "@/lib/data/budget";
import { Prisma } from "@/generated/prisma/client";

type Decimal = Prisma.Decimal;
const Decimal = Prisma.Decimal;

// Re-export for external use
export { BudgetExceededError };

/**
 * Error thrown when x402 payment processing fails.
 */
export class X402PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "X402PaymentError";
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Input arguments for callMeteredEndpointWithX402
 */
export type X402CallArgs = {
  agentId: string;
  projectId: string;
  url: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Result of an x402 call
 */
export type X402CallResult = {
  response: Response;
  paymentMade: boolean;
  paymentDetails?: {
    amountUsd: number;
    txSignature: string;
    token: string;
  };
};

/**
 * Parse x402 payment details from a 402 response.
 * The x402 protocol typically includes payment info in headers or JSON body.
 */
async function parseX402PaymentDetails(response: Response): Promise<X402PaymentDetails | null> {
  // Try to get payment details from headers first (x402 standard)
  const paymentHeader = response.headers.get("X-Payment-Required");

  if (paymentHeader) {
    try {
      return JSON.parse(paymentHeader);
    } catch {
      // Fall through to body parsing
    }
  }

  // Try to parse from response body
  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const body = await response.clone().json();

      // Look for x402 payment details in various common formats
      if (body.x402 || body.payment || body.paymentRequired) {
        const paymentData = body.x402 || body.payment || body.paymentRequired;
        return {
          payTo: paymentData.payTo || paymentData.address || paymentData.recipient,
          amount: String(paymentData.amount),
          token: paymentData.token || paymentData.currency || "SOL",
          network: paymentData.network || "solana-devnet",
          amountUsd: paymentData.amountUsd || paymentData.usdAmount,
          expires: paymentData.expires || paymentData.expiration,
        };
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}

/**
 * Convert token amount to USD.
 * For devnet, we use approximate prices. In production, you'd use an oracle or price feed.
 */
function tokenAmountToUsd(amount: string, token: string): number {
  const numAmount = parseFloat(amount);

  switch (token.toUpperCase()) {
    case "SOL":
      // Convert lamports to SOL, then to USD (using approximate devnet price ~$150)
      const solAmount = numAmount / Number(LAMPORTS_PER_SOL);
      return solAmount * 150; // Approximate SOL price in USD
    case "USDC":
      // USDC is 1:1 with USD, but has 6 decimals
      return numAmount / 1_000_000;
    default:
      // For unknown tokens, assume 1:1 with USD
      return numAmount;
  }
}

/**
 * Make an HTTP request that may require x402 payment.
 * 
 * Flow:
 * 1. Make the initial HTTP request
 * 2. If response is not 402, return it
 * 3. If 402 Payment Required:
 *    - Parse payment details from response
 *    - Check agent budget
 *    - Process payment using agent's Solana wallet
 *    - Record transaction
 *    - Retry request with payment proof header
 * 
 * @param args - The call arguments
 * @returns The response and payment info
 * @throws X402PaymentError on payment failures
 * @throws BudgetExceededError if agent budget would be exceeded
 */
export async function callMeteredEndpointWithX402(args: X402CallArgs): Promise<X402CallResult> {
  const { agentId, projectId, url, method = "GET", body, headers = {} } = args;

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET" && method !== "HEAD") {
    requestOptions.body = JSON.stringify(body);
  }

  // Make the initial request
  const initialResponse = await fetch(url, requestOptions);

  // If not 402, return the response as-is
  if (initialResponse.status !== 402) {
    return {
      response: initialResponse,
      paymentMade: false,
    };
  }

  // Parse x402 payment details
  const paymentDetails = await parseX402PaymentDetails(initialResponse);

  if (!paymentDetails) {
    throw new X402PaymentError(
      "Received 402 response but could not parse payment details",
      "INVALID_PAYMENT_DETAILS",
      { url, status: 402 }
    );
  }

  // Calculate USD amount
  const amountUsd = paymentDetails.amountUsd ?? tokenAmountToUsd(paymentDetails.amount, paymentDetails.token);

  // Check if payment is expired
  if (paymentDetails.expires && Date.now() > paymentDetails.expires) {
    throw new X402PaymentError(
      "Payment request has expired",
      "PAYMENT_EXPIRED",
      { expires: paymentDetails.expires }
    );
  }

  // Check agent budget (throws BudgetExceededError if exceeded)
  await assertAgentWithinBudget(agentId, amountUsd);

  // Get the agent's vault with encrypted private key
  const wallet = await prisma.vault.findUnique({
    where: { agentId },
  });

  if (!wallet) {
    throw new X402PaymentError(
      "Agent does not have a configured wallet",
      "NO_WALLET",
      { agentId }
    );
  }

  // Process the payment
  let txSignature: string;
  try {
    txSignature = await processX402PaymentSolana(
      wallet.encryptedPrivateKey,
      paymentDetails
    );
  } catch (error) {
    throw new X402PaymentError(
      `Payment transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "PAYMENT_FAILED",
      { error: error instanceof Error ? error.message : String(error) }
    );
  }

  // Record the transaction
  await recordAgentTransaction({
    agentId,
    projectId,
    amountUsd: new Decimal(amountUsd),
    token: paymentDetails.token,
    txSignature,
    description: `x402 payment for ${url}`,
    status: "confirmed",
  });

  // Retry the request with payment proof header
  const retryResponse = await fetch(url, {
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      "X-Payment": txSignature,
      "X-Payment-Token": paymentDetails.token,
      "X-Payment-Network": paymentDetails.network,
    } as Record<string, string>,
  });

  return {
    response: retryResponse,
    paymentMade: true,
    paymentDetails: {
      amountUsd,
      txSignature,
      token: paymentDetails.token,
    },
  };
}

/**
 * Simplified version that returns JSON directly.
 */
export async function callMeteredEndpointWithX402Json<T = unknown>(
  args: X402CallArgs
): Promise<{
  data: T;
  paymentMade: boolean;
  paymentDetails?: {
    amountUsd: number;
    txSignature: string;
    token: string;
  };
}> {
  const result = await callMeteredEndpointWithX402(args);

  const contentType = result.response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new X402PaymentError(
      "Expected JSON response but got " + contentType,
      "INVALID_RESPONSE_TYPE"
    );
  }

  const data = await result.response.json();

  return {
    data: data as T,
    paymentMade: result.paymentMade,
    paymentDetails: result.paymentDetails,
  };
}

