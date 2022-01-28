/**
 * 数据对象基础模型
 */
export interface StorageModel {
  /**
   * 主键UUID，字符串UUID或数值型
   * @type {string|number}
   */
  uuid?: string|number;

  /**
   * 名称
   * @type {string}
   */
  name?: string;

  /**
   * 备注信息
   * @type {string}
   */
  description?: string;

  /**
   * 创建时间，可为空
   * @type {Date}
   */
  createdAt?: Date;

  /**
   * 更新时间，可为空
   * @type {Date}
   */
  updatedAt?: Date;
}

/**
 * API数据对象接口
 */
export interface ApiData extends StorageModel {
  /**
   * 名称
   * @type {string}
   */
  name: string;

  /**
   * 文档所属项目主键ID
   *
   * @type {string|number}
   */
  projectID?: string | number;

  /**
   * 文档所属分组主键ID
   *
   * @type {string|number}
   */
  groupID: string | number;

  /**
   * 请求地址
   *
   * @type {string}
   */
  uri: string;
}

/**
 * 环境对象接口
 */
export interface Environment extends StorageModel {
  /**
   * 名称
   * @type {string}
   */
  name: string;

  /**
   * 项目主键ID
   * @type {string|number}
   */
  projectID: string|number;

  /**
   * 前置url
   * @type {string}
   */
  hostUri: string;

  /**
   * 环境变量（可选）
   * @type {object}
   */
  parameters?: object;
}


/**
 * 分组对象接口
 */
export interface Group extends StorageModel {
  /**
   * 名称
   * @type {string}
   */
  name: string;

  /**
   * 项目主键ID
   * @type {string|number}
   */
  projectID: string|number;

  /**
   * 上级分组主键，最顶层是0
   * @type {string|number}
   */
  parentID?: string|number;

  /**
   * 分组排序号
   * @type {number}
   */
  weight?: number;
}

/**
 * 项目对象接口
 */
export interface Project extends StorageModel {
  /**
   * 名称
   * @type {string}
   */
  name: string;
}

export interface ApiTestHistoryFrame {
  /**
   * General indicators
   * @type {object}
   */
  general: {
    downloadRate: string;
    downloadSize: number;
    redirectTimes: number;
    time: string;
    timingSummary: {
      dnsTiming: string;
      tcpTiming: string;
      /**
       * SSL/TSL
       */
      tlsTiming: string;
      /**
       * The request is being sent until recieve firstByte
       */
      requestSentTiming: string;
      /**
       * Content download
       */
      contentDeliveryTiming: string;
      /**
       * Waiting (TTFB) - Time To First Byte
       */
      firstByteTiming: string;
      /**
       * Total Time
       */
      responseTiming: string;
    }[];
  };

  /**
   * HTTP Request
   * @type {object}
   */
  request: {
    uri: string;
    protocol: string;
    method: string;
    requestHeaders: any | object[];
    requestBodyJsonType: JsonRootType | string;
    requestBodyType: string | 'formData' | 'raw';
    requestBody: any | object[] | string;
  };

  /**
   * HTTP response
   * @type {object}
   */
  response: {
    headers: object[];
    statusCode: number;
    body: string;
    contentType: string;
    responseType: 'text' | 'longText' | 'stream';
    responseLength: number;
    testDeny: string;
    /**
     * Inject Code println
     */
    reportList: string[] | object[];
  };
}
/**
 * API测试历史对象接口
 */
export interface ApiTestHistory extends ApiTestHistoryFrame, StorageModel {
  /**
   * Project primary key ID
   * @type {string|number}
   */
  projectID: string | number;

  /**
   * Bind API primary key ID
   * @type {string|number}
   */
  apiDataID: string | number;
}

export enum ApiBodyType {
  'Form-data' = 'formData',
  JSON = 'json',
  XML = 'xml',
  Raw = 'raw',
  // Binary = 'binary',
}
/**
 * Json Root Type
 *
 * @description body type is json,set root type of object/array
 */
export enum JsonRootType {
  Object = 'object',
  Array = 'array',
}

export enum RequestMethod {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
}
export enum RequestProtocol {
  HTTP = 'http',
  HTTPS = 'https',
}

/**
 * API数据对象接口
 */
export interface ApiData extends StorageModel {
  /**
   * 名称
   * @type {string}
   */
  name: string;

  /**
   * 文档所属项目主键ID
   *
   * @type {string|number}
   */
  projectID?: string | number;

  /**
   * 文档所属分组主键ID
   *
   * @type {string|number}
   */
  groupID: string | number;

  /**
   * 请求地址
   *
   * @type {string}
   */
  uri: string;
  /**
   * API协议 [http, https, ...]
   *
   * @type {RequestProtocol|string}
   */
  protocol: RequestProtocol | string;

  /**
   * 请求方法 [POST, GET, PUT, ...]
   *
   * @type {RequestMethod|string}
   */
  method: RequestMethod | string;

  /**
   * 分组排序号
   *
   * @type {number}
   */
  weight?: number;

  /**
   * 请求的参数类型
   *
   * @type {ApiBodyType|string}
   */
  requestBodyType?: ApiBodyType | string;

  /**
   * 请求头数据，数据用json存储
   *
   * @type {object}
   */
  requestHeaders?: ApiEditHeaders[];

  /**
   * 请求的json参数根类型
   *
   * @type {JsonRootType|string}
   */
  requestBodyJsonType?: JsonRootType | string;

  /**
   * 请求参数(多层结构)，数据用json存储
   *
   * @type {object}
   */
  requestBody?: ApiEditBody[] | string;

  /**
   * get请求参数，数据用json存储
   *
   * @type {object[]}
   */
  queryParams?: object[];

  /**
   * rest请求参数，数据用json存储
   *
   * @type {object[]}
   */
  restParams?: object[];

  /**
   * 返回头数据，数据用json存储
   *
   * @type {object}
   */
  responseHeaders?: ApiEditHeaders[];

  /**
   * 返回参数(多层结构)，数据用json存储
   *
   * @type {ApiEditBody[] | string}
   */
  responseBody?: ApiEditBody[] | string;

  /**
   * 返回的参数类型
   *
   * @type {ApiBodyType|string}
   */
  responseBodyType?: ApiBodyType | string;

  /**
   * 返回参数json根类型
   *
   * @type {JsonRootType|string}
   */
  responseBodyJsonType?: JsonRootType | string;
}

/**
 * API body FormData param type
 */
export enum ApiParamsTypeFormData {
  string = 'string',
  file = 'file',
  json = 'json',
  int = 'int',
  float = 'float',
  double = 'double',
  date = 'date',
  datetime = 'datetime',
  boolean = 'boolean',
  byte = 'byte',
  short = 'short',
  long = 'long',
  array = 'array',
  object = 'object',
  number = 'number',
  null = 'null',
}

/**
 * API body Json or xml param type
 */
export enum ApiParamsTypeJsonOrXml {
  string = 'string',
  array = 'array',
  object = 'object',
  number = 'number',
  json = 'json',
  int = 'int',
  float = 'float',
  double = 'double',
  date = 'date',
  datetime = 'datetime',
  boolean = 'boolean',
  short = 'short',
  long = 'long',
  char = 'char',
  null = 'null',
}

export interface ParamsEnum {
  /**
   * is default param value
   */
  default: boolean;
  /**
   * param value
   */
  value: string;
  /**
   * param value description
   */
  description: string;
}
export interface BasiApiEditParams {
  /**
   * 参数名
   */
  name: string;
  /**
   * is response/request must contain param
   */
  required: boolean;
  /**
   * param example
   */
  example: string;
  /**
   * 说明
   */
  description: string;
  /**
   * 值可能性
   */
  enum?: ParamsEnum[];
}
export type ApiEditHeaders = BasiApiEditParams;
export type ApiEditQuery = BasiApiEditParams;
export type ApiEditRest = BasiApiEditParams;
export interface ApiEditBody extends BasiApiEditParams {
  /**
   * 参数类型
   */
  type: ApiParamsTypeFormData | ApiParamsTypeJsonOrXml | string;
  /**
   * 最小值
   */
  minimum?: number;
  /**
   * 最大值
   */
  maximum?: number;
  /**
   * 最小长度
   */
  minLength?: number;
  /**
   * 最大长度
   */
  maxLength?: number;
  /**
   * XML attribute
   */
  attribute?: string;
  /**
   * 子参数
   */
  children?: ApiEditBody[];
}
