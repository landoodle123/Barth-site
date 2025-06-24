export async function POST({ cookies }) {
  cookies.set('session', '', {
    path: '/',
    expires: new Date(0)
  });
  return new Response(null, { status: 204 });
}