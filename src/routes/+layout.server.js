export async function load({ locals }) {
  return {
    loggedIn: !!locals.user
  };
}