import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  callMeteredEndpointWithX402,
  X402PaymentError,
} from "@/lib/x402Client";
import { BudgetExceededError, getAgentBudgetInfo } from "@/lib/data/budget";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

/**
 * Verify that the current user owns the agent.
 */
async function verifyAgentOwnership(agentId: string, userId: string) {
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      project: {
        userId,
      },
    },
    include: {
      project: true,
    },
  });

  return agent;
}

/**
 * POST /api/agents/[agentId]/x402-call
 * 
 * Make a metered API call with x402 payment handling.
 * 
 * Body: {
 *   url: string;        // The URL to call
 *   method?: string;    // HTTP method (default: "GET")
 *   body?: object;      // Request body (for POST/PUT/PATCH)
 *   headers?: object;   // Additional headers
 * }
 * 
 * Returns:
 * - The upstream response data
 * - Whether a payment was made
 * - Payment details if payment was made
 * - Updated spend information
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agentId } = await context.params;

    // Verify ownership
    const agent = await verifyAgentOwnership(agentId, user.id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Parse body
    const requestBody = await request.json();
    const { url, method = "GET", body, headers } = requestBody;

    // Validate input
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "url is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Make the x402 call
    const result = await callMeteredEndpointWithX402({
      agentId,
      projectId: agent.projectId,
      url,
      method,
      body,
      headers,
    });

    // Try to parse the response as JSON
    let responseData: unknown;
    const contentType = result.response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      responseData = await result.response.json();
    } else {
      responseData = await result.response.text();
    }

    // Get updated budget info
    const budgetInfo = await getAgentBudgetInfo(agentId);

    return NextResponse.json({
      success: true,
      statusCode: result.response.status,
      data: responseData,
      paymentMade: result.paymentMade,
      paymentDetails: result.paymentDetails
        ? {
            amountUsd: result.paymentDetails.amountUsd,
            txSignature: result.paymentDetails.txSignature,
            token: result.paymentDetails.token,
          }
        : null,
      budget: {
        currentMonthSpendUsd: budgetInfo.currentMonthSpendUsd.toNumber(),
        monthlyBudgetUsd: budgetInfo.budget?.monthlyBudgetUsd.toNumber() ?? null,
        remainingBudgetUsd: budgetInfo.budget
          ? budgetInfo.budget.monthlyBudgetUsd
              .minus(budgetInfo.currentMonthSpendUsd)
              .toNumber()
          : null,
      },
    });
  } catch (error) {
    console.error("Error in x402 call:", error);

    // Handle budget exceeded error
    if (error instanceof BudgetExceededError) {
      return NextResponse.json(
        {
          success: false,
          error: "BUDGET_EXCEEDED",
          message: error.message,
          details: error.toJSON(),
        },
        { status: 402 }
      );
    }

    // Handle x402 payment errors
    if (error instanceof X402PaymentError) {
      return NextResponse.json(
        {
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        },
        { status: 502 }
      );
    }

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          error: "NETWORK_ERROR",
          message: "Failed to connect to the upstream service",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

