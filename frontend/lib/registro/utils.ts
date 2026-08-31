export function emptyToNull(value: string | undefined | null): string | null {
  return value && value.trim() !== "" ? value : null;
}
