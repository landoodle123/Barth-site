export async function load({ locals }) {
  if (!locals.user) {
    return {
      status: 302,
      redirect: '/login'
    };
  }
  return {};
}