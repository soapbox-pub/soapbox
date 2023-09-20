const isHTMLElement = (x: unknown): x is HTMLElement => x instanceof HTMLElement;

export default isHTMLElement;
export { isHTMLElement };
