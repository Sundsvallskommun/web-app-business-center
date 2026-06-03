export function titleCase(st?: string) {
  return (
    st
      ?.toLowerCase()
      ?.split(' ')
      ?.reduce((s, c) => s + '' + (c.charAt(0).toUpperCase() + c.slice(1) + ' '), '') ?? st
  );
}
