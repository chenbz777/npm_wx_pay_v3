import { IConfig, IKey, IRefundWay, ITransferDetailItem } from './interfaceData';
/**
 * [官方文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
 */
export declare class WxPayV3 {
    constructor(config: IConfig);
    config: IConfig;
    /**
     * @desc 生成签名
     * @param data {object} 需要加密的参数
     * @return string
     * @author chenbz
     * @date 2022-09-28
     */
    createSignature(data: IKey): string;
    /**
     * @desc 获取请求头token
     * @param method {string} 请求类型
     * @param url {string} 请求路径
     * @param body {object} 请求参数
     * @return promise
     * @author chenbz
     * @date 2022-09-28
     */
    getAuthorization(method: string | undefined, url: string, body?: string | object): string;
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
    verifySignature(signature: string, timestamp: string, nonce: string, data: object): boolean;
    /**
     * @desc 解密AES
     * @param cipherText {string} 密文
     * @param add {string} associated_data字符串
     * @param iv {string} nonce字符串
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    decryptAES(cipherText: string, add: string, iv: string): object;
    /**
     * @desc 生成订单号(使用uuid确保唯一性)
     * @return string
     * @author chenbz
     * @date 2022-09-28
     */
    createOrderNo(): string;
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
    jsApi(outTradeNo: string, payerOpenId: string, amountTotal: number, description: string, options?: any): Promise<any>;
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
    jsApiPay(outTradeNo: string, payerOpenId: string, amountTotal: number, description: string, options?: any): Promise<{
        appId: string;
        timeStamp: string;
        nonceStr: string;
        package: string;
        signType: string;
        paySign: string;
    }>;
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
    wmpPay(outTradeNo: string, payerOpenId: string, amountTotal: number, description: string, options?: any): Promise<{
        appId: string;
        timeStamp: string;
        nonceStr: string;
        package: string;
        signType: string;
        paySign: string;
    }>;
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
    h5Pay(outTradeNo: string, amountTotal: number, description: string, payerClientIp?: string, options?: any): Promise<{
        h5_url: string;
    }>;
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
    nativePay(outTradeNo: string, amountTotal: number, description: string, options?: any): Promise<{
        code_url: string;
    }>;
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
    appPay(outTradeNo: string, amountTotal: number, description: string, options?: any): Promise<{
        prepay_id: string;
    }>;
    /**
     * @desc 根据微信支付订单号查询
     * @param transactionId {string} 微信支付订单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    getOrderByTransactionId(transactionId: string): Promise<any>;
    /**
     * @desc 根据商户订单号查询
     * @param outTradeNo {string} 商户订单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    getOrderByOutTradeNo(outTradeNo: string): Promise<any>;
    /**
     * @desc 关闭订单
     * @param outTradeNo {string} 商户订单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    closeOrderByOutTradeNo(outTradeNo: string): Promise<any>;
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
    refundDomestic(refundWay: IRefundWay, outRefundNo: string, amountTotal: number, amountRefund: number, options?: any): Promise<any>;
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
    refundDomesticByTransactionId(transactionId: string, outRefundNo: string, amountTotal: number, amountRefund: number, options?: any): Promise<any>;
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
    refundDomesticByOutTradeNo(outTradeNo: string, outRefundNo: string, amountTotal: number, amountRefund: number, options?: any): Promise<any>;
    /**
     * @desc 查询单笔退款
     * @param outRefundNo {string} 商户退款单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    getRefundDomesticByOutRefundNo(outRefundNo: string): Promise<any>;
    /**
     * @desc 获取申请交易账单
     * @param billDate {string} 账单日期
     * @param billType {string} 账单类型 => [ALL：返回当日所有订单信息（不含充值退款订单）] [SUCCESS：返回当日成功支付的订单（不含充值退款订单）] [REFUND：返回当日退款订单（不含充值退款订单）]
     * @param tarType {string} 压缩类型
     * @return object
     * @author chenbz
     * @date 2022-09-29
     */
    getTradeBill(billDate: string, billType?: string, tarType?: string): Promise<any>;
    /**
     * @desc 获取申请资金账单
     * @param billDate {string} 账单日期
     * @param accountType {string} 资金账户类型 => [BASIC：基本账户] [OPERATION：运营账户] [FEES：手续费账户]
     * @param tarType {string} 压缩类型
     * @return object
     * @author chenbz
     * @date 2022-09-29
     */
    getFundFlowBill(billDate: string, accountType?: string, tarType?: string): Promise<any>;
    /**
     * @desc 下载申请交易账单
     * @param billDate {string} 账单日期
     * @param billType {string} 账单类型
     * @param tarType {string} 压缩类型
     * @return 账单文件的数据流
     * @author chenbz
     * @date 2022-09-29
     */
    downloadTradeBill(billDate: string, billType?: string, tarType?: string): Promise<any>;
    /**
     * @desc 下载申请资金账单
     * @param billDate {string} 账单日期
     * @param accountType {string} 资金账户类型 => [BASIC：基本账户] [OPERATION：运营账户] [FEES：手续费账户]
     * @param tarType {string} 压缩类型
     * @return 账单文件的数据流
     * @author chenbz
     * @date 2022-09-29
     */
    downloadFundFlowBill(billDate: string, accountType?: string, tarType?: string): Promise<any>;
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
    transferBatches(outBatchNo: string, batchName: string, batchRemark: string, transferDetailList: ITransferDetailItem[], options?: any): Promise<any>;
    /**
     * @desc 获取平台证书列表
     * @return object
     * @author chenbz
     * @date 2022-09-30
     */
    getCertificates(): Promise<any>;
}
