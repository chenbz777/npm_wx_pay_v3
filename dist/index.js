"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxPayV3 = void 0;
// 导入uuid
const uuid_1 = require("uuid");
// 导入crypto
const crypto = require("crypto");
// 导入工具类
const utils_1 = require("./utils");
/**
 * [官方文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
 */
class WxPayV3 {
    constructor(config) {
        this.config = {
            appId: '',
            mchId: '',
            apiKeyV3: '',
            serialNo: '',
            privateKey: '',
            publicKey: '',
            payNotifyUrl: '',
            refundNotifyUrl: '', // 退款对调地址
        };
        this.config = config;
    }
    /**
     * @desc 生成签名
     * @param data {object} 需要加密的参数
     * @return string
     * @author chenbz
     * @date 2022-09-28
     */
    createSignature(data) {
        const { privateKey } = this.config;
        let signatureStr = '';
        for (const key in data) {
            signatureStr += `${data[key]}\n`;
        }
        ;
        const signatureBase64 = crypto.createSign('RSA-SHA256').update(signatureStr, 'utf-8').sign(privateKey, 'base64');
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
    getAuthorization(method = 'GET', url, body = '') {
        const { mchId, serialNo } = this.config;
        const timeStamp = utils_1.date.getTimestamp10();
        const nonceStr = utils_1.random.str(32);
        const signatureData = { method, url, timestamp: timeStamp, nonce_str: nonceStr };
        if (method === 'GET') {
            signatureData.body = '';
        }
        else {
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
    verifySignature(signature, timestamp, nonce, data) {
        const { publicKey } = this.config;
        const signatureStr = `${timestamp}\n${nonce}\n${JSON.stringify(data)}\n`;
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
    decryptAES(cipherText, add, iv) {
        const { apiKeyV3 } = this.config;
        cipherText = decodeURIComponent(cipherText);
        const ciphertext = Buffer.from(cipherText, 'base64');
        const authTag = ciphertext.slice(ciphertext.length - 16);
        const data = ciphertext.slice(0, ciphertext.length - 16);
        const decipher = crypto.createDecipheriv('aes-256-gcm', apiKeyV3, iv);
        decipher.setAuthTag(authTag);
        decipher.setAAD(Buffer.from(add));
        let decryptedText = decipher.update(data, undefined, 'utf-8');
        decryptedText += decipher.final();
        return JSON.parse(decryptedText);
    }
    /**
     * @desc 生成订单号(使用uuid确保唯一性)
     * @return string
     * @author chenbz
     * @date 2022-09-28
     */
    createOrderNo() {
        const newUuid = (0, uuid_1.v4)();
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
    jsApi(outTradeNo, payerOpenId, amountTotal, description, options) {
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
        const postData = Object.assign({}, data, options);
        const headers = {
            Authorization: this.getAuthorization('POST', url, postData),
        };
        return utils_1.request.post(url, data, headers);
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
    jsApiPay(outTradeNo, payerOpenId, amountTotal, description, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { appId } = this.config;
            const timeStamp = utils_1.date.getTimestamp10();
            const nonceStr = utils_1.random.str(32);
            const { prepay_id: prepayId } = yield this.jsApi(outTradeNo, payerOpenId, amountTotal, description, options);
            const signatureData = {
                appId,
                timeStamp,
                nonceStr,
                package: `prepay_id=${prepayId}`,
            };
            return {
                appId,
                timeStamp,
                nonceStr,
                package: `prepay_id=${prepayId}`,
                signType: 'RSA',
                paySign: this.createSignature(signatureData),
            };
        });
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
    wmpPay(outTradeNo, payerOpenId, amountTotal, description, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.jsApiPay(outTradeNo, payerOpenId, amountTotal, description, options);
        });
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
    h5Pay(outTradeNo, amountTotal, description, payerClientIp = '127.0.0.1', options) {
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
        const postData = Object.assign({}, data, options);
        const headers = {
            Authorization: this.getAuthorization('POST', url, postData),
        };
        return utils_1.request.post(url, data, headers);
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
    nativePay(outTradeNo, amountTotal, description, options) {
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
        const postData = Object.assign({}, data, options);
        const headers = {
            Authorization: this.getAuthorization('POST', url, postData),
        };
        return utils_1.request.post(url, data, headers);
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
    appPay(outTradeNo, amountTotal, description, options) {
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
        const postData = Object.assign({}, data, options);
        const headers = {
            Authorization: this.getAuthorization('POST', url, postData),
        };
        return utils_1.request.post(url, data, headers);
    }
    /**
     * @desc 根据微信支付订单号查询
     * @param transactionId {string} 微信支付订单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    getOrderByTransactionId(transactionId) {
        const { mchId } = this.config;
        const url = `/v3/pay/transactions/id/${transactionId}?mchid=${mchId}`;
        const headers = {
            Authorization: this.getAuthorization('GET', url),
        };
        return utils_1.request.get(url, {}, headers);
    }
    /**
     * @desc 根据商户订单号查询
     * @param outTradeNo {string} 商户订单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    getOrderByOutTradeNo(outTradeNo) {
        const { mchId } = this.config;
        const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${mchId}`;
        const headers = {
            Authorization: this.getAuthorization('GET', url),
        };
        return utils_1.request.get(url, {}, headers);
    }
    /**
     * @desc 关闭订单
     * @param outTradeNo {string} 商户订单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    closeOrderByOutTradeNo(outTradeNo) {
        const { mchId } = this.config;
        const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}/close`;
        const postData = {
            mchid: mchId
        };
        const headers = {
            Authorization: this.getAuthorization('POST', url, postData),
        };
        return utils_1.request.post(url, postData, headers);
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
    refundDomestic(refundWay, outRefundNo, amountTotal, amountRefund, options) {
        const { refundNotifyUrl } = this.config;
        const url = '/v3/refund/domestic/refunds';
        const data = Object.assign(Object.assign({}, refundWay), { out_refund_no: outRefundNo, notify_url: refundNotifyUrl, amount: {
                refund: amountRefund,
                total: amountTotal,
                currency: 'CNY'
            } });
        const postData = Object.assign({}, data, options);
        const headers = {
            Authorization: this.getAuthorization('POST', url, postData),
        };
        return utils_1.request.post(url, data, headers);
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
    refundDomesticByTransactionId(transactionId, outRefundNo, amountTotal, amountRefund, options) {
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
    refundDomesticByOutTradeNo(outTradeNo, outRefundNo, amountTotal, amountRefund, options) {
        return this.refundDomestic({ out_trade_no: outTradeNo }, outRefundNo, amountRefund, amountTotal, options);
    }
    /**
     * @desc 查询单笔退款
     * @param outRefundNo {string} 商户退款单号
     * @return object
     * @author chenbz
     * @date 2022-09-28
     */
    getRefundDomesticByOutRefundNo(outRefundNo) {
        const url = `/v3/refund/domestic/refunds/${outRefundNo}`;
        const headers = {
            Authorization: this.getAuthorization('GET', url),
        };
        return utils_1.request.get(url, {}, headers);
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
    getTradeBill(billDate, billType = 'ALL', tarType = 'GZIP') {
        const url = `/v3/bill/tradebill?bill_date=${billDate}&bill_type=${billType}&tar_type=${tarType}`;
        const headers = {
            Authorization: this.getAuthorization('GET', url),
        };
        return utils_1.request.get(url, {}, headers);
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
    getFundFlowBill(billDate, accountType = 'BASIC', tarType = 'GZIP') {
        const url = `/v3/bill/fundflowbill?bill_date=${billDate}&account_type=${accountType}&tar_type=${tarType}`;
        const headers = {
            Authorization: this.getAuthorization('GET', url),
        };
        return utils_1.request.get(url, {}, headers);
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
    downloadTradeBill(billDate, billType = 'ALL', tarType = 'GZIP') {
        return __awaiter(this, void 0, void 0, function* () {
            const tradeBill = yield this.getTradeBill(billDate, billType, tarType);
            const { download_url: downloadUrl } = tradeBill;
            const url = downloadUrl.replace('https://api.mch.weixin.qq.com', '');
            const headers = {
                Authorization: this.getAuthorization('GET', url),
            };
            return utils_1.request.get(url, {}, headers);
        });
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
    downloadFundFlowBill(billDate, accountType = 'BASIC', tarType = 'GZIP') {
        return __awaiter(this, void 0, void 0, function* () {
            const fundFlowBill = yield this.getFundFlowBill(billDate, accountType, tarType);
            const { download_url: downloadUrl } = fundFlowBill;
            const url = downloadUrl.replace('https://api.mch.weixin.qq.com', '');
            const headers = {
                Authorization: this.getAuthorization('GET', url),
            };
            return utils_1.request.get(url, {}, headers);
        });
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
    transferBatches(outBatchNo, batchName, batchRemark, transferDetailList, options) {
        const { appId, mchId, payNotifyUrl } = this.config;
        const url = '/v3/transfer/batches';
        const totalNum = transferDetailList.length;
        let totalAmount = 0;
        transferDetailList.forEach((transferDetail) => {
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
        const postData = Object.assign({}, data, options);
        const headers = {
            Authorization: this.getAuthorization('POST', url, postData),
        };
        return utils_1.request.post(url, data, headers);
    }
}
exports.WxPayV3 = WxPayV3;
