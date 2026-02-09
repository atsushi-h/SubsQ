/**
 * Health check endpoint for Cloud Run and monitoring systems.
 *
 * This endpoint is used by:
 * - Cloud Run health checks
 * - GitHub Actions deployment verification
 * - External monitoring services
 *
 * Returns 200 OK if the application is running.
 */
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 })
}
