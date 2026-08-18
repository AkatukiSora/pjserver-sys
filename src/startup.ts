/** Keeps REST command deployment isolated from Discord Client construction. */
export async function deployBeforeClient<T>(
  deploy: () => Promise<void>,
  createClient: () => T,
): Promise<T> {
  await deploy();
  return createClient();
}
