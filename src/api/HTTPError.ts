export class HTTPError extends Error {

  response: Response;

  constructor(response: Response) {
    super(response.statusText);
    this.response = response;
  }

}