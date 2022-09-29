# wx_pay_v3说明文档

## 前言

暂时对接了部分使用频率比较高的接口，如果在使用中发现问题，可`📮wx.open@qq.com`邮箱联系我

<br />

## 安装

```bash
npm install @chenbz/wx_pay_v3
```

<br />

## 实例化

```js
const { WxPayV3 } = require('@chenbz/wx_pay_v3');

const payConfig = {
    appId: '', // 应用ID
    mchId: '', // 商户ID
    apiKeyV3: '', // API_v3密钥
    serialNo: '', // API证书序列号
    privateKey: '', // API证书私钥
    publicKey: '', // API证书公钥
    payNotifyUrl: '', // 支付回调地址
    refundNotifyUrl: '', // 退款回调地址
  };

const pay = new WxPayV3(payConfig);
```

<br />

## 必填参数说明

| 属性            | 描述          | 指引                                                         |
| --------------- | ------------- | ------------------------------------------------------------ |
| appId           | 应用ID        | [🌈 直达链接](https://pay.weixin.qq.com/index.php/extend/merchant_appid/mapay_platform/account_manage) |
| mchId           | 商户号ID      | [🌈 直达链接](https://pay.weixin.qq.com/index.php/extend/pay_setting) |
| apiKeyV3        | API_v3密钥    | [🌈 直达链接](https://pay.weixin.qq.com/index.php/core/cert/api_cert) |
| serialNo        | API证书序列号 | [🌈 官方教程](https://kf.qq.com/faq/161222NneAJf161222U7fARv.html) |
| privateKey      | API证书私钥   | [🌈 官方教程](https://kf.qq.com/faq/161222NneAJf161222U7fARv.html) |
| publicKey       | API证书公钥   | [🌈 官方教程](https://kf.qq.com/faq/161222NneAJf161222U7fARv.html) |
| payNotifyUrl    | 支付回调地址  | 开发者自行开发                                               |
| refundNotifyUrl | 退款回调地址  | 开发者自行开发                                               |

<br />

## 函数列表

| 函数名称                       | 描述                             |
| ------------------------------ | -------------------------------- |
| createSignature                | 生成签名                         |
| getAuthorization               | 请求头token                      |
| verifySignature                | 验证签名（用于验证回调消息签名） |
| decryptAES                     | 解密AES（用于解密回调消息主体）  |
| createOrderNo                  | 生成订单号（使用uuid确保唯一性） |
| jsApi                          | jsApi                            |
| jsApiPay                       | jsApi支付                        |
| wmpPay                         | 微信小程序支付                   |
| h5Pay                          | h5支付                           |
| nativePay                      | native支付                       |
| appPay                         | app支付                          |
| getOrderByTransactionId        | 根据微信支付订单号查询           |
| getOrderByOutTradeNo           | 根据商户订单号查询               |
| closeOrderByOutTradeNo         | 关闭订单                         |
| refundDomesticByTransactionId  | 根据"微信支付订单号"退款         |
| refundDomesticByOutTradeNo     | 根据"商户订单号"退款             |
| getRefundDomesticByOutRefundNo | 查询单笔退款                     |
| getTradeBill                   | 获取申请交易账单                 |
| getFundFlowBill                | 获取申请资金账单                 |
| downloadTradeBill              | 下载申请交易账单                 |
| downloadFundFlowBill           | 下载申请资金账单                 |
| transferBatches                | 发起商户转账                     |

<br />

## 感谢

如果可以，来瓶快乐水

<img src="https://s1.ax1x.com/2022/09/29/xndVoj.jpg" alt="https://s1.ax1x.com/2022/09/29/xndVoj.jpg" style="width: 300px;" />

<br />

## 函数说明

### verifySignature(验证签名)

##### 使用场景

用于验证`支付回调`和`退款回调`是否来自官方，强烈建议！！回调均验证

##### 参数

| 参数      | 描述       | 说明                              |
| --------- | ---------- | --------------------------------- |
| signature | 签名       | http请求头['wechatpay-signature'] |
| timestamp | 时间戳     | http请求头['wechatpay-timestamp'] |
| nonce     | 随机字符串 | http请求头['wechatpay-nonce']     |
| data      | 回调数据   | 应答主体                          |

##### 使用示例

```js
// 不同框架获取请求头的方式不同，示例使用的框架是egg

const signature = ctx.request.header['wechatpay-signature'];
const timestamp = ctx.request.header['wechatpay-timestamp'];
const nonce = ctx.request.header['wechatpay-nonce'];
const data = ctx.request.body;

pay.verifySignature(signature, timestamp, nonce, data);  // true
```

<br />

### decryptAES(解密AES)

##### 使用场景

用于解密`支付回调`和`退款回调`

##### 示例：支付成功结果通知

```json
{
    "id": "EV-2018022511223320873",
    "create_time": "2015-05-20T13:29:35+08:00",
    "resource_type": "encrypt-resource",
    "event_type": "TRANSACTION.SUCCESS",
    "summary": "支付成功",
    "resource": {
        "original_type": "transaction",
        "algorithm": "AEAD_AES_256_GCM",
        "ciphertext": "",
        "associated_data": "",
        "nonce": ""
    }
}
```

##### 参数

| 参数       | 描述                  | 说明                     |
| ---------- | --------------------- | ------------------------ |
| cipherText | 密文                  | resource.ciphertext      |
| add        | associated_data字符串 | resource.associated_data |
| iv         | nonce字符串           | resource.nonce           |

##### 使用示例

```js
// 示例使用的框架是egg

const data = ctx.request.body;

const { ciphertext: cipherText, associated_data: add, nonce: iv } = data.resource;

pay.decryptAES(cipherText, add, iv);
```

<br />

### createOrderNo(生成订单号[使用uuid确保唯一性])

##### 使用场景

生成订单号

##### 参数

null

##### 使用示例

```js
pay.createOrderNo();  // s3r6a23m8d124dcaa12f2c862c82117e
```

<br />

### jsApiPay(jsApi支付)

##### 使用场景

JsSDk支付

##### 参数

| 参数        | 描述                            | 说明                            |
| ----------- | ------------------------------- | ------------------------------- |
| outTradeNo  | 商户订单号                      | 可调用"createOrderNo()"方法生成 |
| payerOpenId | 用户在直连商户appId下的唯一标识 | openid                          |
| amountTotal | 订单总金额(单位:分)             |                                 |
| description | 商品描述                        |                                 |
| options     | 可覆盖已有参数                  | 🔍可选                           |

##### 使用示例

```js
const outTradeNo = pay.createOrderNo();
const payerOpenId = 'openid';
const amountTotal = 1;
const description = '测试商品';

pay.jsApiPay(outTradeNo, payerOpenId, amountTotal, description)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### wmpPay(微信小程序支付)

##### 使用场景

微信小程序支付

##### 参数

| 参数        | 描述                            | 说明                            |
| ----------- | ------------------------------- | ------------------------------- |
| outTradeNo  | 商户订单号                      | 可调用"createOrderNo()"方法生成 |
| payerOpenId | 用户在直连商户appId下的唯一标识 | openid                          |
| amountTotal | 订单总金额(单位:分)             |                                 |
| description | 商品描述                        |                                 |
| options     | 可覆盖已有参数                  | 🔍可选                           |

##### 使用示例

```js
const outTradeNo = pay.createOrderNo();
const payerOpenId = 'openid';
const amountTotal = 1;
const description = '测试商品';

pay.wmpPay(outTradeNo, payerOpenId, amountTotal, description)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### h5Pay(h5支付)

##### 使用场景

h5支付

##### 参数

| 参数          | 描述                                          | 说明                            |
| ------------- | --------------------------------------------- | ------------------------------- |
| outTradeNo    | 商户订单号                                    | 可调用"createOrderNo()"方法生成 |
| amountTotal   | 订单总金额(单位:分)                           |                                 |
| description   | 商品描述                                      |                                 |
| payerClientIp | 用户的客户端IP,支持IPv4和IPv6两种格式的IP地址 |                                 |
| options       | 可覆盖已有参数                                | 🔍可选                           |

##### 使用示例

```js
const outTradeNo = pay.createOrderNo();
const amountTotal = 1;
const description = '测试商品';
const payerClientIp = '127.0.0.1';

pay.h5Pay(outTradeNo, amountTotal, description, payerClientIp)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### nativePay(native支付)

##### 使用场景

native支付

##### 参数

| 参数        | 描述                | 说明                            |
| ----------- | ------------------- | ------------------------------- |
| outTradeNo  | 商户订单号          | 可调用"createOrderNo()"方法生成 |
| amountTotal | 订单总金额(单位:分) |                                 |
| description | 商品描述            |                                 |
| options     | 可覆盖已有参数      | 🔍可选                           |

##### 使用示例

```js
const outTradeNo = pay.createOrderNo();
const amountTotal = 1;
const description = '测试商品';

pay.nativePay(outTradeNo, amountTotal, description)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### appPay(app支付)

##### 使用场景

appPay

##### 参数

| 参数        | 描述                | 说明                            |
| ----------- | ------------------- | ------------------------------- |
| outTradeNo  | 商户订单号          | 可调用"createOrderNo()"方法生成 |
| amountTotal | 订单总金额(单位:分) |                                 |
| description | 商品描述            |                                 |
| options     | 可覆盖已有参数      | 🔍可选                           |

##### 使用示例

```js
const outTradeNo = pay.createOrderNo();
const amountTotal = 1;
const description = '测试商品';

pay.appPay(outTradeNo, amountTotal, description)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### getOrderByTransactionId(根据微信支付订单号查询)

##### 使用场景

订单查询

##### 参数

| 参数          | 描述           | 说明                         |
| ------------- | -------------- | ---------------------------- |
| transactionId | 微信支付订单号 | 支付成功后由微信支付生成返回 |

##### 使用示例

```js
const transactionId = '';

pay.getOrderByTransactionId(transactionId)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### getOrderByOutTradeNo(根据商户订单号查询)

##### 使用场景

订单查询

##### 参数

| 参数       | 描述                   | 说明                                      |
| ---------- | ---------------------- | ----------------------------------------- |
| outTradeNo | 下单的时候由商户号生成 | 前面使用`pay.createOrderNo()`生成的订单号 |

##### 使用示例

```js
const transactionId = '';

pay.getOrderByTransactionId(transactionId)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### closeOrderByOutTradeNo(关闭订单)

##### 使用场景

关闭订单

##### 参数

| 参数       | 描述                   | 说明                                      |
| ---------- | ---------------------- | ----------------------------------------- |
| outTradeNo | 下单的时候由商户号生成 | 前面使用`pay.createOrderNo()`生成的订单号 |

##### 使用示例

```js
const transactionId = '';

pay.getOrderByTransactionId(transactionId)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### refundDomesticByTransactionId(根据"微信支付订单号"退款)

##### 使用场景

退款

##### 参数

| 参数          | 描述           | 说明                            |
| ------------- | -------------- | ------------------------------- |
| transactionId | 微信支付订单号 | 支付成功后由微信支付生成返回    |
| outRefundNo   | 商户退款单号   | 可调用"createOrderNo()"方法生成 |
| amountTotal   | 原订单金额     | 原支付交易的订单总金额          |
| amountRefund  | 退款金额       | 不能超过原订单支付金额          |
| options       | 可覆盖已有参数 | 🔍可选                           |

##### 使用示例

```js
const transactionId = '';
const outRefundNo = pay.createOrderNo();
const amountTotal = 1;
const amountRefund = 1;

pay.refundDomesticByTransactionId(transactionId, outRefundNo, amountTotal, amountRefund)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### refundDomesticByOutTradeNo(根据"商户订单号"退款)

##### 使用场景

退款

##### 参数

| 参数         | 描述           | 说明                                      |
| ------------ | -------------- | ----------------------------------------- |
| outTradeNo   | 商户订单号     | 前面使用`pay.createOrderNo()`生成的订单号 |
| outRefundNo  | 商户退款单号   | 可调用"createOrderNo()"方法生成           |
| amountTotal  | 原订单金额     | 原支付交易的订单总金额                    |
| amountRefund | 退款金额       | 不能超过原订单支付金额                    |
| options      | 可覆盖已有参数 | 🔍可选                                     |

##### 使用示例

```js
const outTradeNo = '';
const outRefundNo = pay.createOrderNo();
const amountTotal = 1;
const amountRefund = 1;

pay.refundDomesticByOutTradeNo(transactionId, outRefundNo, amountTotal, amountRefund)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### getRefundDomesticByOutRefundNo(查询单笔退款)

##### 使用场景

查询单笔退款

##### 参数

| 参数        | 描述         | 说明 |
| ----------- | ------------ | ---- |
| outRefundNo | 商户退款单号 |      |

##### 使用示例

```js
const outRefundNo = '';

pay.getRefundDomesticByOutRefundNo(outRefundNo)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### getTradeBill(获取申请交易账单)

##### 使用场景

获取申请交易账单

##### 参数

| 参数     | 描述     | 说明                        |
| -------- | -------- | --------------------------- |
| billDate | 账单日期 | 示例：2022-09-29            |
| billType | 账单类型 | ALL \|\| SUCCESS  \|\| FUND |
| tarType  | 压缩类型 | GZIP                        |

##### 使用示例

```js
const billDate = '2022-09-29';
// [ALL：返回当日所有订单信息（不含充值退款订单）] [SUCCESS：返回当日成功支付的订单（不含充值退款订单）] [REFUND：返回当日退款订单（不含充值退款订单）]
const billType = 'ALL';
const tarType = 'GZIP';

pay.getTradeBill(billDate, billType, tarType)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### getTradeBill(获取申请资金账单)

##### 使用场景

获取申请交易账单

##### 参数

| 参数        | 描述         | 说明                            |
| ----------- | ------------ | ------------------------------- |
| billDate    | 账单日期     | 示例：2022-09-29                |
| accountType | 资金账户类型 | BASIC \|\| OPERATION  \|\| FEES |
| tarType     | 压缩类型     | GZIP                            |

##### 使用示例

```js
const billDate = '2022-09-29';
// [BASIC：基本账户] [OPERATION：运营账户] [FEES：手续费账户]
const accountType = 'BASIC';
const tarType = 'GZIP';

pay.getFundFlowBill(billDate, accountType, tarType)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### downloadTradeBill(下载申请交易账单)

##### 使用场景

下载申请交易账单

##### 参数

| 参数     | 描述     | 说明                        |
| -------- | -------- | --------------------------- |
| billDate | 账单日期 | 示例：2022-09-29            |
| billType | 账单类型 | ALL \|\| SUCCESS  \|\| FUND |
| tarType  | 压缩类型 | GZIP                        |

##### 使用示例

```js
const billDate = '2022-09-29';
// [ALL：返回当日所有订单信息（不含充值退款订单）] [SUCCESS：返回当日成功支付的订单（不含充值退款订单）] [REFUND：返回当日退款订单（不含充值退款订单）]
const billType = 'ALL';
const tarType = 'GZIP';

pay.downloadTradeBill(billDate, billType, tarType)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### downloadFundFlowBill(下载申请资金账单)

##### 使用场景

下载申请资金账单

##### 参数

| 参数        | 描述         | 说明                            |
| ----------- | ------------ | ------------------------------- |
| billDate    | 账单日期     | 示例：2022-09-29                |
| accountType | 资金账户类型 | BASIC \|\| OPERATION  \|\| FEES |
| tarType     | 压缩类型     | GZIP                            |

##### 使用示例

```js
const billDate = '2022-09-29';
// [BASIC：基本账户] [OPERATION：运营账户] [FEES：手续费账户]
const accountType = 'BASIC';
const tarType = 'GZIP';

pay.downloadFundFlowBill(billDate, accountType, tarType)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />

### transferBatches(发起商户转账)

##### 使用场景

发起商户转账

##### 参数

| 参数               | 描述           | 说明                            |
| ------------------ | -------------- | ------------------------------- |
| outBatchNo         | 商户批次单号   | 可调用"createOrderNo()"方法生成 |
| batchName          | 批次名称       | openid                          |
| batchRemark        | 批次备注       |                                 |
| transferDetailList | 转账明细列表   | 数组                            |
| options            | 可覆盖已有参数 | 🔍可选                           |

**transferDetailList属性说明**

| 属性            | 描述                                          | 说明                                      |
| --------------- | --------------------------------------------- | ----------------------------------------- |
| out_detail_no   | 商家明细单号                                  | 可调用"createOrderNo()"方法生成           |
| transfer_amount | 转账金额(单位:分)                             |                                           |
| transfer_remark | 转账备注                                      |                                           |
| openid          | openid是微信用户在公众号appid下的唯一用户标识 | openid                                    |
| user_name       | 收款用户姓名                                  | 明细转账金额 >= 2,000元，收款用户姓名必填 |

##### 使用示例

```js
const outBatchNo = pay.createOrderNo();
const batchName = '活动1';
const batchRemark = '测试活动1转账';
const transferDetailList = [
  {
    out_detail_no: pay.createOrderNo(),
    transfer_amount: 1,
    transfer_remark: '中奖用户1',
    openid: ''
  }
]

pay.transferBatches(outBatchNo, batchName, batchRemark, transferDetailList)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<br />
