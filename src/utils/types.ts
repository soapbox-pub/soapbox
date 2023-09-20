/**
 * Resolve a type into a flat POJO interface if it's been wrapped by generics.
 * https://gleasonator.com/@alex/posts/AWfK4hyppMDCqrT2y8
 */
type Resolve<T> = Pick<T, keyof T>;

export type { Resolve };