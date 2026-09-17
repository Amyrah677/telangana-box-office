export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "Telangana Box Office collector is working!"
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
