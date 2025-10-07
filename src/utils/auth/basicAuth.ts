import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Basic Auth credentials - in production, these should be environment variables
const USERNAME = "admin";
const PASSWORD = "123456";

/**
 * Validates basic authentication credentials from the request
 * @param request - The NextRequest object
 * @returns NextResponse if authentication fails, null if authentication succeeds
 */
export function validateBasicAuth(request: NextRequest): NextResponse | null {
  // Get the Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    // No auth header or not Basic auth - return 401 with WWW-Authenticate header
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
        "Content-Type": "text/plain",
      },
    });
  }

  try {
    // Extract and decode credentials
    const credentials = authHeader.substring(6); // Remove 'Basic ' prefix
    const decodedCredentials = Buffer.from(credentials, "base64").toString(
      "utf-8"
    );
    const [username, password] = decodedCredentials.split(":");

    // Validate credentials
    if (username === USERNAME && password === PASSWORD) {
      // Authentication successful - return null to indicate success
      return null;
    } else {
      // Invalid credentials - return 401
      return new NextResponse("Invalid credentials", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
          "Content-Type": "text/plain",
        },
      });
    }
  } catch {
    // Malformed credentials - return 401
    return new NextResponse("Invalid authentication format", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
        "Content-Type": "text/plain",
      },
    });
  }
}
