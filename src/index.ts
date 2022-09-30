// 导入uuid
import { v4 as uuid } from 'uuid';
// 导入crypto
import * as crypto from 'crypto';
// 导入工具类
import { random, request, date } from "./utils";
// 导入接口
import { IConfig, IKey, IRefundWay, ITransferDetailItem, } from './interfaceData';


/**
 * [官方文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
 */
export class WxPayV3 {

  constructor(config: IConfig) {

    this.config = config;
  }

  config: IConfig = {
    appId: '',  // 应用ID
    mchId: '', // 商户ID
    apiKeyV3: '', // API_v3密钥
    serialNo: '', // API证书序列号
    privateKey: '', // API证书私钥
    publicKey: '', // API证书公钥
    payNotifyUrl: '', // 支付回调地址
    refundNotifyUrl: '', // 退款对调地址
  };


  /**
   * @desc 生成签名
   * @param data {object} 需要加密的参数
   * @return string
   * @author chenbz
   * @date 2022-09-28
   */
  createSignature(data: IKey): string {

    const { privateKey } = this.config;

    let signatureStr = '';

    for (const key in data) {
      signatureStr += `${data[key]}\n`
    };

    const signatureBase64 = crypto.createSign('RSA-SHA256').update(signatureStr, 'utf-8').sign(privateKey, 'base64')

    return signatureBase64;
  }

  /**
   * @desc 获取请求头token
   * @param method {string} 请求类型
   * @param url {string} 请求路径
   * @param body {object} 请求参数
   * @return promise
   * @author chenbz
   * @date 2022-09-28
   */
  getAuthorization(method: string = 'GET', url: string, body: string | object = ''): string {
    const { mchId, serialNo } = this.config;

    const timeStamp = date.getTimestamp10();
    const nonceStr = random.str(32);

    const signatureData: IKey = { method, url, timestamp: timeStamp, nonce_str: nonceStr };

    if (method === 'GET') {
      signatureData.body = '';
    } else {
      signatureData.body = JSON.stringify(body);
    }

    const signature = this.createSignature(signatureData);

    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timeStamp}",serial_no="${serialNo}"`;
  }

  /**
   * @desc 验证签名
   * @param signature {string} 签名 => http请求头['wechatpay-signature']
   * @param timestamp {string} 时间戳 => http请求头['wechatpay-timestamp']
   * @param nonce {string} 随机字符串 => http请求头['wechatpay-nonce']
   * @param data {object} 回调数据 => 应答主体
   * @return boolean
   * @author chenbz
   * @date 2022-09-28
   */
  verifySignature(signature: string, timestamp: string, nonce: string, data: object): boolean {
    const { publicKey } = this.config;

    const signatureStr: string = `${timestamp}\n${nonce}\n${JSON.stringify(data)}\n`;

    return crypto.createVerify('RSA-SHA256')
      .update(signatureStr)
      .verify(publicKey, signature, 'base64');
  }

  /**
   * @desc 解密AES
   * @param cipherText {string} 密文
   * @param add {string} associated_data字符串
   * @param iv {string} nonce字符串
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  decryptAES(cipherText: string, add: string, iv: string): object {
    const { apiKeyV3 } = this.config;

    cipherText = decodeURIComponent(cipherText);

    const ciphertext = Buffer.from(cipherText, 'base64');

    const authTag = ciphertext.slice(ciphertext.length - 16);
    const data = ciphertext.slice(0, ciphertext.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', apiKeyV3, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(add));

    let decryptedText: any = decipher.update(data, undefined, 'utf-8');
    decryptedText += decipher.final();

    return JSON.parse(decryptedText);
  }

  /**
   * @desc 生成订单号(使用uuid确保唯一性)
   * @return string
   * @author chenbz
   * @date 2022-09-28
   */
  createOrderNo(): string {
    const newUuid: any = uuid();

    const outTradeNo = newUuid.replaceAll("-", "");

    return outTradeNo;
  }

  /**
   * @desc jsAPI
   * @param outTradeNo {string} 商户订单号 => 可调用"createOrderNo()"方法生成
   * @param payerOpenId {string} 用户在直连商户appId下的唯一标识 => openId
   * @param amountTotal {number} 订单总金额(单位:分)
   * @param description {string} 商品描述
   * @param options {any} 选项 => 可覆盖已有参数
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  jsApi(outTradeNo: string, payerOpenId: string, amountTotal: number, description: string, options?: any): Promise<{ prepay_id: string }> {

    const { appId, mchId, payNotifyUrl } = this.config;

    const url = '/v3/pay/transactions/jsapi';

    const data = {
      appid: appId,
      mchid: mchId,
      out_trade_no: outTradeNo,
      description,
      notify_url: payNotifyUrl,
      amount: {
        total: amountTotal,
        currency: 'CNY'
      },
      payer: {
        openid: payerOpenId,
      }
    };

    const postData = Object.assign({}, data, options)

    const headers = {
      Authorization: this.getAuthorization('POST', url, postData),
    }

    return request.post(url, data, headers);
  }

  /**
   * @desc jsApi支付
   * @param outTradeNo {string} 商户订单号 => 可调用"createOrderNo()"方法生成
   * @param payerOpenId {string} 用户在直连商户appId下的唯一标识 => openId
   * @param amountTotal {number} 订单总金额(单位:分)
   * @param description {string} 商品描述
   * @param options {any} 选项 => 可覆盖已有参数
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  async jsApiPay(outTradeNo: string, payerOpenId: string, amountTotal: number, description: string, options?: any) {
    const { appId } = this.config;

    const timeStamp = date.getTimestamp10();
    const nonceStr = random.str(32);

    const { prepay_id: prepayId } = await this.jsApi(outTradeNo, payerOpenId, amountTotal, description, options);

    const signatureData = {
      appId,
      timeStamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
    }

    return {
      appId,
      timeStamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'RSA',
      paySign: this.createSignature(signatureData),
    }
  }

  /**
   * @desc 微信小程序支付
   * @param outTradeNo {string} 商户订单号 => 可调用"createOrderNo()"方法生成
   * @param payerOpenId {string} 用户在直连商户appId下的唯一标识 => openId
   * @param amountTotal {number} 订单总金额(单位:分)
   * @param description {string} 商品描述
   * @param options {any} 选项 => 可覆盖已有参数
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  async wmpPay(outTradeNo: string, payerOpenId: string, amountTotal: number, description: string, options?: any) {

    return this.jsApiPay(outTradeNo, payerOpenId, amountTotal, description, options);
  }

  /**
   * @desc h5支付
   * @param outTradeNo {string} 商户订单号 => 可调用"createOrderNo()"方法生成
   * @param amountTotal {number} 订单总金额(单位:分)
   * @param description {string} 商品描述
   * @param payerClientIp {string} 用户的客户端IP,支持IPv4和IPv6两种格式的IP地址。
   * @param options {any} 选项 => 可覆盖已有参数
   * @return string
   * @author chenbz
   * @date 2022-09-28
   */
  h5Pay(outTradeNo: string, amountTotal: number, description: string, payerClientIp: string = '127.0.0.1', options?: any): Promise<{ h5_url: string }> {

    const { appId, mchId, payNotifyUrl } = this.config;

    const url = '/v3/pay/transactions/h5';

    const data = {
      appid: appId,
      mchid: mchId,
      out_trade_no: outTradeNo,
      description,
      notify_url: payNotifyUrl,
      amount: {
        total: amountTotal,
        currency: 'CNY'
      },
      scene_info: {
        payer_client_ip: payerClientIp,
        h5_info: {
          type: 'Wap'
        }
      }
    };

    const postData = Object.assign({}, data, options)

    const headers = {
      Authorization: this.getAuthorization('POST', url, postData),
    }

    return request.post(url, data, headers);
  }

  /**
   * @desc native支付
   * @param outTradeNo {string} 商户订单号 => 可调用"createOrderNo()"方法生成
   * @param amountTotal {number} 订单总金额(单位:分)
   * @param description {string} 商品描述
   * @param options {any} 选项 => 可覆盖已有参数
   * @return string
   * @author chenbz
   * @date 2022-09-28
   */
  nativePay(outTradeNo: string, amountTotal: number, description: string, options?: any): Promise<{ code_url: string }> {

    const { appId, mchId, payNotifyUrl } = this.config;

    const url = '/v3/pay/transactions/native';

    const data = {
      appid: appId,
      mchid: mchId,
      out_trade_no: outTradeNo,
      description,
      notify_url: payNotifyUrl,
      amount: {
        total: amountTotal,
        currency: 'CNY'
      },
    };

    const postData = Object.assign({}, data, options)

    const headers = {
      Authorization: this.getAuthorization('POST', url, postData),
    }

    return request.post(url, data, headers);
  }

  /**
   * @desc app支付
   * @param outTradeNo {string} 商户订单号 => 可调用"createOrderNo()"方法生成
   * @param amountTotal {number} 订单总金额(单位:分)
   * @param description {string} 商品描述
   * @param options {any} 选项 => 可覆盖已有参数
   * @return string
   * @author chenbz
   * @date 2022-09-28
   */
  appPay(outTradeNo: string, amountTotal: number, description: string, options?: any): Promise<{ prepay_id: string }> {

    const { appId, mchId, payNotifyUrl } = this.config;

    const url = '/v3/pay/transactions/app';

    const data = {
      appid: appId,
      mchid: mchId,
      out_trade_no: outTradeNo,
      description,
      notify_url: payNotifyUrl,
      amount: {
        total: amountTotal,
        currency: 'CNY'
      },
    };

    const postData = Object.assign({}, data, options)

    const headers = {
      Authorization: this.getAuthorization('POST', url, postData),
    }

    return request.post(url, data, headers);
  }

  /**
   * @desc 根据微信支付订单号查询
   * @param transactionId {string} 微信支付订单号
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  getOrderByTransactionId(transactionId: string): Promise<any> {
    const { mchId } = this.config;

    const url = `/v3/pay/transactions/id/${transactionId}?mchid=${mchId}`;

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }

    return request.get(url, {}, headers);
  }

  /**
   * @desc 根据商户订单号查询
   * @param outTradeNo {string} 商户订单号
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  getOrderByOutTradeNo(outTradeNo: string): Promise<any> {
    const { mchId } = this.config;

    const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${mchId}`;

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }

    return request.get(url, {}, headers);
  }

  /**
   * @desc 关闭订单
   * @param outTradeNo {string} 商户订单号
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  closeOrderByOutTradeNo(outTradeNo: string): Promise<any> {
    const { mchId } = this.config;

    const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}/close`;

    const postData = {
      mchid: mchId
    }

    const headers = {
      Authorization: this.getAuthorization('POST', url, postData),
    }

    return request.post(url, postData, headers);
  }

  /**
   * @desc 退款
   * @param refundWay {IRefundWay} 退款方式 => 微信支付订单号 || 商户订单号
   * @param outRefundNo {string} 商户退款单号 => 可调用"createOrderNo()"方法生成
   * @param amountRefund {number} 退款金额
   * @param amountTotal {number} 原订单金额
   * @param options {any} 选项 => 可覆盖已有参数
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  refundDomestic(refundWay: IRefundWay, outRefundNo: string, amountTotal: number, amountRefund: number, options?: any): Promise<any> {

    const { refundNotifyUrl } = this.config;

    const url = '/v3/refund/domestic/refunds';

    const data = {
      ...refundWay,
      out_refund_no: outRefundNo,
      notify_url: refundNotifyUrl,
      amount: {
        refund: amountRefund,
        total: amountTotal,
        currency: 'CNY'
      },
    }

    const postData = Object.assign({}, data, options)

    const headers = {
      Authorization: this.getAuthorization('POST', url, postData),
    }

    return request.post(url, data, headers);
  }

  /**
   * @desc 根据"微信支付订单号"退款
   * @param transactionId {string} 微信支付订单号
   * @param outRefundNo {string} 商户退款单号 => 可调用"createOrderNo()"方法生成
   * @param amountRefund {number} 退款金额
   * @param amountTotal {number} 原订单金额
   * @param options {any} 选项 => 可覆盖已有参数
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  refundDomesticByTransactionId(transactionId: string, outRefundNo: string, amountTotal: number, amountRefund: number, options?: any): Promise<any> {

    return this.refundDomestic({ transaction_id: transactionId }, outRefundNo, amountRefund, amountTotal, options);
  }

  /**
   * @desc 根据"商户订单号"退款
   * @param outTradeNo {string} 商户订单号
   * @param outRefundNo {string} 商户退款单号 => 可调用"createOrderNo()"方法生成
   * @param amountRefund {number} 退款金额
   * @param amountTotal {number} 原订单金额
   * @param options {any} 选项 => 可覆盖已有参数
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  refundDomesticByOutTradeNo(outTradeNo: string, outRefundNo: string, amountTotal: number, amountRefund: number, options?: any): Promise<any> {

    return this.refundDomestic({ out_trade_no: outTradeNo }, outRefundNo, amountRefund, amountTotal, options);
  }

  /**
   * @desc 查询单笔退款
   * @param outRefundNo {string} 商户退款单号
   * @return object
   * @author chenbz
   * @date 2022-09-28
   */
  getRefundDomesticByOutRefundNo(outRefundNo: string): Promise<any> {

    const url = `/v3/refund/domestic/refunds/${outRefundNo}`;

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }

    return request.get(url, {}, headers);
  }

  /**
   * @desc 获取申请交易账单
   * @param billDate {string} 账单日期
   * @param billType {string} 账单类型 => [ALL：返回当日所有订单信息（不含充值退款订单）] [SUCCESS：返回当日成功支付的订单（不含充值退款订单）] [REFUND：返回当日退款订单（不含充值退款订单）]
   * @param tarType {string} 压缩类型
   * @return object
   * @author chenbz
   * @date 2022-09-29
   */
  getTradeBill(billDate: string, billType: string = 'ALL', tarType: string = 'GZIP'): Promise<any> {
    const url = `/v3/bill/tradebill?bill_date=${billDate}&bill_type=${billType}&tar_type=${tarType}`;

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }


    return request.get(url, {}, headers);
  }

  /**
   * @desc 获取申请资金账单
   * @param billDate {string} 账单日期
   * @param accountType {string} 资金账户类型 => [BASIC：基本账户] [OPERATION：运营账户] [FEES：手续费账户]
   * @param tarType {string} 压缩类型
   * @return object
   * @author chenbz
   * @date 2022-09-29
   */
  getFundFlowBill(billDate: string, accountType: string = 'BASIC', tarType: string = 'GZIP'): Promise<any> {
    const url = `/v3/bill/fundflowbill?bill_date=${billDate}&account_type=${accountType}&tar_type=${tarType}`;

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }


    return request.get(url, {}, headers);
  }

  /**
   * @desc 下载申请交易账单
   * @param billDate {string} 账单日期
   * @param billType {string} 账单类型
   * @param tarType {string} 压缩类型
   * @return 账单文件的数据流
   * @author chenbz
   * @date 2022-09-29
   */
  async downloadTradeBill(billDate: string, billType: string = 'ALL', tarType: string = 'GZIP'): Promise<any> {
    const tradeBill = await this.getTradeBill(billDate, billType, tarType);

    const { download_url: downloadUrl } = tradeBill;

    const url = downloadUrl.replace('https://api.mch.weixin.qq.com', '');

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }

    return request.get(url, {}, headers);
  }

  /**
   * @desc 下载申请资金账单
   * @param billDate {string} 账单日期
   * @param accountType {string} 资金账户类型 => [BASIC：基本账户] [OPERATION：运营账户] [FEES：手续费账户]
   * @param tarType {string} 压缩类型
   * @return 账单文件的数据流
   * @author chenbz
   * @date 2022-09-29
   */
  async downloadFundFlowBill(billDate: string, accountType: string = 'BASIC', tarType: string = 'GZIP'): Promise<any> {
    const fundFlowBill = await this.getFundFlowBill(billDate, accountType, tarType);

    const { download_url: downloadUrl } = fundFlowBill;

    const url = downloadUrl.replace('https://api.mch.weixin.qq.com', '');

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }

    return request.get(url, {}, headers);
  }

  /**
   * @desc 发起商户转账
   * @param outBatchNo {string} 商户批次单号 => 可调用"createOrderNo()"方法生成
   * @param batchName {string} 批次名称
   * @param batchRemark {string} 批次备注
   * @param transferDetailList {ITransferDetailItem} 转账明细列表
   * @param options {any} 选项 => 可覆盖已有参数
   * @return object
   * @author chenbz
   * @date 2022-09-29
   */
  transferBatches(outBatchNo: string, batchName: string, batchRemark: string, transferDetailList: ITransferDetailItem[], options?: any): Promise<any> {
    const { appId, mchId, payNotifyUrl } = this.config;

    const url = '/v3/transfer/batches';

    const totalNum = transferDetailList.length;

    let totalAmount: number = 0;

    transferDetailList.forEach((transferDetail: ITransferDetailItem) => {
      totalAmount += Number(transferDetail.transfer_amount);
    });

    const data = {
      appid: appId,
      mchid: mchId,
      out_batch_no: outBatchNo,
      batch_name: batchName,
      batch_remark: batchRemark,
      total_amount: totalAmount,
      total_num: totalNum,
      notify_url: payNotifyUrl,
      transfer_detail_list: transferDetailList
    };

    const postData = Object.assign({}, data, options)

    const headers = {
      Authorization: this.getAuthorization('POST', url, postData),
    }

    return request.post(url, data, headers);
  }

  /**
   * @desc 获取平台证书列表
   * @return object
   * @author chenbz
   * @date 2022-09-30
   */
  getCertificates(): Promise<any> {

    const url = '/v3/certificates';

    const headers = {
      Authorization: this.getAuthorization('GET', url),
    }

    return request.get(url, {}, headers);
  }

}
