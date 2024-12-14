import { MastodonResponse } from 'soapbox/api/MastodonResponse.ts';

export class HTTPError extends Error {

  response: MastodonResponse;
  request: Request;

  constructor(response: MastodonResponse, request: Request) {
    super(response.statusText);
    this.response = response;
    this.request = request;
  }

}