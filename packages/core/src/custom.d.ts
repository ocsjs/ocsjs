export { };

declare global {
  // eslint-disable-next-line no-unused-vars
  declare interface Window {
    OCS: typeof import('../index')
  }

}
