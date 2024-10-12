export class HTTPError extends Error {

  response: Response;
  request: Request;

  constructor(response: Response, request: Request) {
    super(response.statusText);
    this.response = response;
    this.request = request;
  }

}