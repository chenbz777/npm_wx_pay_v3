export interface IConfig {
    appId: string;
    h5AppId?: string;
    wmpAppId?: string;
    appAppId?: string;
    mchId: string;
    apiKeyV3: string;
    serialNo: string;
    privateKey: string;
    publicKey: string;
    payNotifyUrl: string;
    refundNotifyUrl: string;
}
export interface IKey {
    [key: string]: string;
}
export interface IRefundWay {
    transaction_id?: string;
    out_trade_no?: string;
}
export interface ITransferDetailItem {
    out_detail_no: string;
    transfer_amount: number;
    transfer_remark: string;
    openid: string;
    user_name?: string;
}
