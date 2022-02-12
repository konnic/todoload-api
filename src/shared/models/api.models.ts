import { Request } from 'express';

export interface RequestParams {
  todo_id: string;
  commment_id: string;
}

export interface TypedRequestWithParams<Body, RequestParams> extends Request {
  userId: string;
  body: Body;
  params: {
    [key: string]: string;
  } & RequestParams;
}

export interface TypedRequest<Body> extends Request {
  userId: string;
  body: Body;
}
