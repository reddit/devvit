import type { ParamsDictionary, Query } from '@types/express-serve-static-core';
import type { Request, Response } from 'express';

/** Express request with unknowns instead of anys to require good typing. */
export type HttpReq<
  QueryParams = ParamsDictionary,
  RspBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> = Request<QueryParams, RspBody, ReqBody, ReqQuery, Locals>;

/** Express response with unknowns instead of anys to require good typing. */
export type HttpRsp<
  RspBody = unknown,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> = Response<RspBody, Locals>;
