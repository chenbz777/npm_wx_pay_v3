export interface IConfig {
  appId: string;  // 应用ID
  h5AppId?: string; // h5AppId
  wmpAppId?: string; // wmpAppId
  appAppId?: string; // appAppId
  mchId: string; // 商户ID
  apiKeyV3: string; // API_v3密钥
  serialNo: string; // API证书序列号
  privateKey: string; // API证书私钥
  publicKey: string; // API证书公钥
  payNotifyUrl: string; // 支付回调地址
  refundNotifyUrl: string; // 退款回调地址
}

export interface IKey {
  [key: string]: string;
}

export interface IRefundWay {
  transaction_id?: string;  // 微信订单号
  out_trade_no?: string;  // 商户内部订单号
}

export interface ITransferDetailItem {
  out_detail_no: string;  // 商家明细单号 => 可调用"createOrderNo()"方法生成
  transfer_amount: number;  // 转账金额(单位:分)
  transfer_remark: string;  // 转账备注
  openid: string;  // openid是微信用户在公众号appid下的唯一用户标识
  user_name?: string;  // 收款用户姓名, 明细转账金额 >= 2,000元，收款用户姓名必填
}
